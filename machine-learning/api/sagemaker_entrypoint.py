"""SageMaker container entrypoint.

SageMaker real-time endpoints start the container with:

    docker run <image> serve

So the image must accept the `serve` command and start the inference web server
(on port 8080 by default).

Using a Python module entrypoint avoids Windows CRLF/shebang issues that can
break shell entrypoints in Linux containers.
"""

from __future__ import annotations

import os
import sys

import uvicorn


def main(argv: list[str] | None = None) -> int:
    args = sys.argv[1:] if argv is None else argv
    cmd = args[0] if args else "serve"

    if cmd != "serve":
        sys.stderr.write(
            "Unsupported command. Expected: serve\n"
            f"Got: {cmd!r}\n"
        )
        return 2

    host = os.getenv("SAGEMAKER_BIND_TO_HOST", "0.0.0.0")
    port = int(os.getenv("SAGEMAKER_BIND_TO_PORT", os.getenv("PORT", "8080")))
    app_module = os.getenv("SAGEMAKER_APP", "api.sagemaker:app")

    uvicorn.run(app_module, host=host, port=port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
