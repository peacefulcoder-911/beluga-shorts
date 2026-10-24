import json

paths = [
    "/Users/vinaybt/.gemini/antigravity-ide/brain/2b2b61be-dabc-4731-aa3a-c4a22bf641b5/.system_generated/logs/transcript_full.jsonl",
    "/Users/vinaybt/.gemini/antigravity-ide/brain/1894aa29-b7ef-4f08-b153-c12ab4ff7000/.system_generated/logs/transcript_full.jsonl"
]

script_content = ""
styles_content = ""

for path in paths:
    try:
        with open(path, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if data.get('type') == 'PLANNER_RESPONSE':
                        for call in data.get('tool_calls', []):
                            args = call.get('args', {})
                            target = args.get('TargetFile', '')
                            
                            # Capture any tool call setting content
                            if 'script.js' in target:
                                if call['name'] == 'write_to_file':
                                    script_content = args.get('CodeContent', "")
                                elif call['name'] == 'replace_file_content':
                                    old = args.get('TargetContent', "")
                                    new = args.get('ReplacementContent', "")
                                    if old and new and old in script_content:
                                        script_content = script_content.replace(old, new)
                                        
                            if 'styles.css' in target:
                                if call['name'] == 'write_to_file':
                                    styles_content = args.get('CodeContent', "")
                                elif call['name'] == 'replace_file_content':
                                    old = args.get('TargetContent', "")
                                    new = args.get('ReplacementContent', "")
                                    if old and new and old in styles_content:
                                        styles_content = styles_content.replace(old, new)
                except Exception:
                    pass
    except Exception:
        pass

if script_content:
    with open('/Users/vinaybt/Downloads/AI_Beluga_discord/public/script.js', 'w') as f:
        f.write(script_content)
    print("Restored script.js")

if styles_content:
    with open('/Users/vinaybt/Downloads/AI_Beluga_discord/public/styles.css', 'w') as f:
        f.write(styles_content)
    print("Restored styles.css")

