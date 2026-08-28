with open("main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

clean_lines = []
for i, line in enumerate(lines):
    stripped = line.strip()
    clean_lines.append(line)
    if stripped.endswith(":") and not stripped.startswith("#") and not stripped.startswith("'''") and not stripped.startswith('"""'):
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.strip() != "" and not next_line.startswith(" ") and not next_line.startswith("\t"):
                clean_lines.append("    pass\n")

code = "".join(clean_lines)
code = code.replace('app.mount("/", StaticFiles(directory=".", html=True), name="static")', "")

if "from fastapi.staticfiles import StaticFiles" not in code:
    code = "from fastapi.staticfiles import StaticFiles\n" + code

code = code.strip() + '\n\n# SAFE STATIC MOUNT AT EOF\napp.mount("/", StaticFiles(directory=".", html=True), name="static")\n'

with open("main.py", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ Successfully patched main.py!")
