"""Lambda handler for heartz-api-wrapper.

Drop-in proxy for API Gateway -> SageMaker Runtime.

- Accepts raw WAV bytes (API Gateway may base64-encode binary payloads)
- Forwards Content-Type to SageMaker
- Supports optional verification target via:
  - query string: ?target=A
  - header: x-heartz-target: A

It forwards the target as SageMaker CustomAttributes: "target=<label>".
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
        return base64.b64decode(body)

    if isinstance(body, str):
        return body.encode("utf-8")

    if isinstance(body, (bytes, bytearray)):
        return bytes(body)

    return json.dumps(body).encode("utf-8")


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
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

    headers = event.get("headers") or {}
    qs = event.get("queryStringParameters") or {}

    content_type = _get_header(headers, "content-type") or "application/octet-stream"

    target = None
    if isinstance(qs, dict):
        target = qs.get("target")
    target = target or _get_header(headers, "x-heartz-target")

    custom_attributes = None
    if target and str(target).strip():
        custom_attributes = f"target={str(target).strip()}"

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
        payload = resp["Body"].read()
        resp_ct = resp.get("ContentType") or "application/json"

        return {
            "statusCode": 200,
            "headers": {
                "content-type": resp_ct,
                "cache-control": "no-store",
            },
            "body": payload.decode("utf-8", errors="replace"),
        }

    except ClientError as exc:
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
