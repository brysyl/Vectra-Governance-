with open("main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- INSPECTING LINES 25 to 45 ---")
for i in range(max(0, 24), min(len(lines), 45)):
    print(f"{i+1}: {repr(lines[i])}")

# Safely remove dangling or malformed conditional/function headers
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Check for dangling headers (lines ending in ':' with no indented block following)
    if stripped.endswith(":") and not stripped.startswith("#") and not stripped.startswith('"""') and not stripped.startswith("'''"):
        if i + 1 >= len(lines) or (lines[i+1].strip() != "" and not lines[i+1].startswith(" ") and not lines[i+1].startswith("\t")):
            print(f"🧹 Removing dangling header at line {i+1}: {stripped}")
            i += 1
            continue
            
    new_lines.append(line)
    i += 1

# Re-add clean static mount at the absolute EOF
code = "".join(new_lines)
code = code.replace('app.mount("/", StaticFiles(directory=".", html=True), name="static")', "")

if "from fastapi.staticfiles import StaticFiles" not in code:
    code = "from fastapi.staticfiles import StaticFiles\n" + code

code = code.strip() + '\n\n# SAFE STATIC MOUNT AT EOF\napp.mount("/", StaticFiles(directory=".", html=True), name="static")\n'

with open("main.py", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ main.py successfully cleaned and normalized!")
