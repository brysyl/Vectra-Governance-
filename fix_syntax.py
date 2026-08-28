with open("main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- INSPECTING LINES 35 to 48 ---")
for i in range(max(0, 34), min(len(lines), 48)):
    print(f"{i+1}: {repr(lines[i])}")

# Safely remove a stray orphan closing parenthesis if present around line 43
if len(lines) >= 43 and lines[42].strip() == ")":
    print("🛠️ Removing orphan ')' at line 43")
    lines[42] = "\n"

with open("main.py", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("✅ Syntax patch applied!")
