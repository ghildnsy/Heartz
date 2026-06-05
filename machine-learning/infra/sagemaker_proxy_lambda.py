"""API Gateway -> Lambda -> SageMaker Runtime proxy.

Purpose
- Expose a simple HTTP endpoint for FE/Postman without AWS SigV4 signing.
- Accept raw WAV bytes in the request body.
- Optionally accept a `target` label and forward it to SageMaker via CustomAttributes.

Request
- POST /predict
- Content-Type: audio/wav (or application/octet-stream)
- Body: raw WAV bytes (API Gateway may deliver as base64-encoded)
- Optional target:
  - query string: ?target=A
  - or header: x-heartz-target: A

Response
- JSON passthrough from SageMaker container.
"""

from __future__ import annotations

import base64
import json
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError


def _get_header(headers: dict[str, str] | None, name: str) -> str | None:
    if not headers:
        return None
    lower_name = name.lower()
    for key, value in headers.items():
        if key.lower() == lower_name:
            return value
    return None


def _parse_body(event: dict[str, Any]) -> bytes:
    body = event.get("body")
    if body is None:
        return b""

    if event.get("isBase64Encoded"):
        # In API Gateway REST API, binary bodies are base64-encoded.
        return base64.b64decode(body)

    if isinstance(body, str):
        # If it isn't marked base64, treat as UTF-8 bytes.
        # (This path is uncommon for true binary data.)
        return body.encode("utf-8")

    # Some tooling may pass already-bytes.
    if isinstance(body, (bytes, bytearray)):
        return bytes(body)

    return json.dumps(body).encode("utf-8")


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    endpoint_name = os.getenv("SAGEMAKER_ENDPOINT_NAME", "heartz")
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")

    path = event.get("path") or event.get("rawPath") or ""
    method = (event.get("httpMethod") or event.get("requestContext", {})
              .get("http", {}).get("method") or "").upper()

    # Handle health / ping check endpoints
    if method == "GET" and (path.endswith("/health") or path.endswith("/ping") or path == "/"):
        sagemaker_client = boto3.client("sagemaker", region_name=region)
        try:
            desc = sagemaker_client.describe_endpoint(EndpointName=endpoint_name)
            status = desc.get("EndpointStatus")
            return {
                "statusCode": 200,
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-store",
                },
                "body": json.dumps({
                    "status": "ok" if status == "InService" else "unhealthy",
                    "sagemaker_endpoint": endpoint_name,
                    "sagemaker_status": status,
                    "region": region,
                }),
            }
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "ClientError")
            msg = exc.response.get("Error", {}).get("Message", str(exc))
            # Fallback if Lambda lacks sagemaker:DescribeEndpoint permissions
            if "AccessDenied" in code or "AccessDenied" in msg:
                return {
                    "statusCode": 200,
                    "headers": {
                        "content-type": "application/json",
                        "cache-control": "no-store",
                    },
                    "body": json.dumps({
                        "status": "ok",
                        "sagemaker_endpoint": endpoint_name,
                        "sagemaker_status": "unknown (describe_endpoint AccessDenied)",
                        "region": region,
                    }),
                }
            return {
                "statusCode": 503,
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-store",
                },
                "body": json.dumps({
                    "status": "unhealthy",
                    "code": code,
                    "detail": msg,
                    "sagemaker_endpoint": endpoint_name,
                    "region": region,
                }),
            }
        except Exception as exc:
            return {
                "statusCode": 500,
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-store",
                },
                "body": json.dumps({
                    "status": "error",
                    "detail": str(exc),
                    "sagemaker_endpoint": endpoint_name,
                    "region": region,
                }),
            }

    if method != "POST" or not path.endswith("/predict"):
        return {
            "statusCode": 404,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"message": "Not found"}),
        }

    headers = event.get("headers") or {}
    qs = event.get("queryStringParameters") or {}

    content_type = (
        _get_header(headers, "content-type")
        or _get_header(headers, "Content-Type")
        or "application/octet-stream"
    )

    target = (
        (qs.get("target") if isinstance(qs, dict) else None)
        or _get_header(headers, "x-heartz-target")
        or _get_header(headers, "x-amzn-sagemaker-custom-attributes")
    )

    custom_attributes = None
    if target:
        # SageMaker container parses either `target=<label>` or a raw label.
        # We standardize to key=value to avoid ambiguity.
        custom_attributes = f"target={target.strip()}"

    body_bytes = _parse_body(event)
    if not body_bytes:
        return {
            "statusCode": 400,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"message": "Empty request body"}),
        }

    runtime = boto3.client("sagemaker-runtime", region_name=region)

    try:
        kwargs: dict[str, Any] = {
            "EndpointName": endpoint_name,
            "ContentType": content_type,
            "Body": body_bytes,
        }
        if custom_attributes:
            kwargs["CustomAttributes"] = custom_attributes

        resp = runtime.invoke_endpoint(**kwargs)
        resp_body = resp["Body"].read()
        resp_ct = resp.get("ContentType") or "application/json"

        return {
            "statusCode": 200,
            "headers": {
                "content-type": resp_ct,
                "cache-control": "no-store",
            },
            "body": resp_body.decode("utf-8", errors="replace"),
        }

    except ClientError as exc:
        # ClientError contains AWS-side details; return a safe summary.
        code = exc.response.get("Error", {}).get("Code", "ClientError")
        msg = exc.response.get("Error", {}).get("Message", str(exc))
        return {
            "statusCode": 502,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"message": "Upstream error", "code": code, "detail": msg}),
        }
    except Exception as exc:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"message": "Internal error", "detail": str(exc)}),
        }
