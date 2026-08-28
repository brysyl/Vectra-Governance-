with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# If the exception handler or response is broken, let's clean and normalize it
if "@app.exception_handler(Exception)" in content:
    parts = content.split("@app.exception_handler(Exception)")
    base = parts[0]
    
    clean_handler = """
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )
"""
    content = base.strip() + "\n\n" + clean_handler.strip() + "\n\n# SAFE STATIC MOUNT AT EOF\napp.mount(\"/\", StaticFiles(directory=\".\", html=True), name=\"static\")\n"

with open("main.py", "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Final syntax fix applied!")
