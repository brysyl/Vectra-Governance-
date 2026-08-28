import os
import sys
import traceback

try:
    print("Initializing Vectra Governance service...", flush=True)
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Uvicorn server on 0.0.0.0:{port}", flush=True)
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
except Exception as e:
    print("CRITICAL STARTUP EXCEPTION:", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
