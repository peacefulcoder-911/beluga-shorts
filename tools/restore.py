import json

paths = [
    "/Users/vinaybt/.gemini/antigravity-ide/brain/2b2b61be-dabc-4731-aa3a-c4a22bf641b5/.system_generated/logs/transcript_full.jsonl",
    "/Users/vinaybt/.gemini/antigravity-ide/brain/1894aa29-b7ef-4f08-b153-c12ab4ff7000/.system_generated/logs/transcript_full.jsonl"
]

files_to_restore = [
    "/Users/vinaybt/Downloads/AI_Beluga_discord/public/index.html",
    "/Users/vinaybt/Downloads/AI_Beluga_discord/public/script.js",
    "/Users/vinaybt/Downloads/AI_Beluga_discord/public/styles.css"
]

file_contents = {f: "" for f in files_to_restore}

for path in paths:
    try:
        with open(path, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if data.get('type') == 'PLANNER_RESPONSE':
                        for call in data.get('tool_calls', []):
                            target = call['args'].get('TargetFile')
                            if target in files_to_restore:
                                if call['name'] == 'write_to_file':
                                    file_contents[target] = call['args'].get('CodeContent', "")
                                elif call['name'] == 'replace_file_content':
                                    # Very basic replace logic for exact matching
                                    old_content = call['args'].get('TargetContent', "")
                                    new_content = call['args'].get('ReplacementContent', "")
                                    if old_content in file_contents[target]:
                                        file_contents[target] = file_contents[target].replace(old_content, new_content)
                except Exception:
                    pass
    except Exception:
        pass

import os
os.makedirs("public", exist_ok=True)
for target, content in file_contents.items():
    if content:
        with open(target, 'w') as f:
            f.write(content)
        print(f"Restored {target}")
