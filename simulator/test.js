const fs = require('fs');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const exampleScriptMatch = appJs.match(/const exampleScript = `([\s\S]+?)`;/);
const exampleScript = exampleScriptMatch ? exampleScriptMatch[1] : '';

let parsedSteps = [];
function parseScript(text) {
    parsedSteps = [];
    let blocks = text.trim().split(/\n\s*\n/);
    blocks.forEach(block => {
        block = block.trim();
        if(!block) return;
        
        let matchPause = block.match(/^\[pause:(\d+)\]$/i);
        if(matchPause) {
            parsedSteps.push({ type: 'pause', time: parseInt(matchPause[1], 10) });
            return;
        }

        let matchSystem = block.match(/^\[system:\s*(.+?)\]$/i);
        if(matchSystem) {
            parsedSteps.push({ type: 'system', text: matchSystem[1] });
            return;
        }

        let lines = block.split('\n');
        let headerMatch = lines[0].match(/^([^|:]+)(?:\|(\d+))?:\s*(.*)$/);
        
        if(headerMatch) {
            let name = headerMatch[1].trim();
            let time = headerMatch[2] ? parseInt(headerMatch[2], 10) : null;
            let firstLineText = headerMatch[3];
            
            let messageLines = [];
            if(firstLineText) messageLines.push(firstLineText);
            for(let i=1; i<lines.length; i++) {
                messageLines.push(lines[i]);
            }
            
            parsedSteps.push({
                type: 'message',
                name: name,
                time: time,
                lines: messageLines
            });
        }
    });
}
parseScript(exampleScript);
console.log("Parsed steps:", parsedSteps.length);
if (parsedSteps.length === 0) console.log("Failed to parse blocks:", exampleScript.trim().split(/\n\s*\n/).length);
