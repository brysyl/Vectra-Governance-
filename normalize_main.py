with open("main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

normalized = []
indent_level = 0

for line in lines:
    stripped = line.strip()
    if not stripped:
        normalized.append("\n")
        continue
    
    # Dedent after block-closing or specific keywords if needed, 
    # but here let's ensure top-level statements have 0 indent and block bodies have 4 spaces.
    if stripped.startswith("if ") or stripped.startswith("else:") or stripped.startswith("def ") or stripped.startswith("async def "):
        indent_level = 0
        normalized.append(stripped + "\n")
        indent_level = 4
        continue
    
    if indent_level == 4 and not (stripped.startswith("client =") or stripped.startswith("print(") or stripped.startswith("return") or stripped.startswith("raise")):
        # If we encounter a top-level statement again
        if any(stripped.startswith(p) for p in ["import ", "from ", "app =", "@app", "#", "api_key ="]):
            indent_level = 0
            
    if indent_level > 0 and not stripped.startswith("if ") and not stripped.startswith("else:"):
        normalized.append(" " * indent_level + stripped + "\n")
    else:
        normalized.append(stripped + "\n")
        
with open("main.py", "w", encoding="utf-8") as f:
    f.writelines(normalized)

print("✅ main.py lines normalized!")
