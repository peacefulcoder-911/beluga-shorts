const UI = {
    loadExampleBtn: document.getElementById('load-example'),
    scriptInput: document.getElementById('script-input'),
    parseScriptBtn: document.getElementById('parse-script'),
    clearScriptBtn: document.getElementById('clear-script'),
    characterList: document.getElementById('character-list'),
    addCharForm: document.getElementById('add-character-form'),
    memeList: document.getElementById('meme-list'),
    addMemeForm: document.getElementById('add-meme-form'),
    valDisplay: document.getElementById('val-display'),
    settingDisplay: document.getElementById('setting-display'),
    valTyping: document.getElementById('val-typing'),
    settingTyping: document.getElementById('setting-typing'),
    valMeme: document.getElementById('val-meme'),
    settingMeme: document.getElementById('setting-meme'),
    settingSound: document.getElementById('setting-sound'),
    messageContainer: document.getElementById('message-container'),
    stepCounter: document.getElementById('step-counter'),
    typingIndicator: document.getElementById('typing-indicator'),
    btnPlay: document.getElementById('btn-play'),
    btnPause: document.getElementById('btn-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnRecord: document.getElementById('btn-record'),
    playbackSpeed: document.getElementById('playback-speed'),
    progressBar: document.getElementById('progress-bar'),
    settingShorts: document.getElementById('setting-shorts'),
    discordAppWrapper: document.getElementById('discord-app-wrapper'),
    discordContainer: document.getElementById('discord-container'),
    chatInputText: document.getElementById('chat-input-text')
};

let sfxTracks = {
    'boom': 'https://www.myinstants.com/media/sounds/vine-boom.mp3',
    'call': 'https://www.myinstants.com/media/sounds/discord-call.mp3'
};
let mediaRecorder;
let recordedChunks = [];

let characters = {
    'Beluga': { pic: 'https://i.kym-cdn.com/entries/icons/mobile/000/026/638/cat.jpg', emoji: '', color: '#ffffff', badge: '' },
    'Hecker': { pic: 'https://static.wikia.nocookie.net/beluga/images/7/7b/Heckercat.jpg', emoji: '', color: '#ffffff', badge: 'BOT' },
    'Mom': { pic: '', emoji: '👩', color: '#f47fff', badge: '' },
    'Skittle': { pic: '', emoji: '🐶', color: '#57f287', badge: '' }
};

let memes = {
    'crying': 'https://i.imgur.com/Y3oU0o0.jpeg',
    'shocked': 'https://i.imgur.com/P0oIpOq.jpeg',
    'thinking': 'https://i.imgur.com/9mvzSB3.jpeg',
    'laughing': 'https://i.imgur.com/XzuHo4r.jpeg',
    'angry': 'https://i.imgur.com/y9cqhwm.jpeg',
    'sad': 'https://i.imgur.com/OwZbHBB.jpeg',
    'sus': 'https://i.imgur.com/4FBaVJm.jpeg',
    'pain': 'https://i.imgur.com/QlIlbDK.jpeg'
};

const exampleScript = `Hecker: i know your password

[sfx:call]

Beluga: no you dont

[effect:shake]

Hecker|2000: i hacked your wifi
then your house
then your computer

[sfx:boom]

Beluga: [meme:shocked]

[type_erase: "i am calling the police" -> "pls dont i give you my robux"]

Beluga: pls dont i give you my robux

Hecker: thanks bro

[delete:last]

[system: 30 minutes later]

Hecker: i just spent it all`;

let parsedSteps = [];
let playbackState = {
    playing: false,
    paused: false,
    currentStep: 0
};

// --- INITIALIZATION ---
function init() {
    renderCharacters();
    renderMemes();
    updateHUD();
    
    // Sliders
    UI.settingDisplay.addEventListener('input', (e) => UI.valDisplay.innerText = e.target.value);
    UI.settingTyping.addEventListener('input', (e) => UI.valTyping.innerText = e.target.value);
    UI.settingMeme.addEventListener('input', (e) => UI.valMeme.innerText = e.target.value);
    
    // Script Management
    UI.loadExampleBtn.addEventListener('click', () => {
        UI.scriptInput.value = exampleScript;
        parseScript(exampleScript);
        playbackState.currentStep = 0;
        updateHUD();
    });
    
    UI.clearScriptBtn.addEventListener('click', () => {
        UI.scriptInput.value = '';
    });
    
    UI.parseScriptBtn.addEventListener('click', () => {
        parseScript(UI.scriptInput.value);
        playbackState.currentStep = 0;
        updateHUD();
    });
    
    // Playback Controls
    UI.btnPlay.addEventListener('click', () => {
        if(!playbackState.playing) {
            if(playbackState.currentStep >= parsedSteps.length) {
                playbackState.currentStep = 0;
            }
            playScript();
        } else if(playbackState.paused) {
            playbackState.paused = false;
            UI.btnPause.innerText = '⏸ Pause';
        }
    });
    
    UI.btnPause.addEventListener('click', () => {
        if(playbackState.playing) {
            playbackState.paused = !playbackState.paused;
            UI.btnPause.innerText = playbackState.paused ? '▶ Resume' : '⏸ Pause';
        }
    });
    
    UI.btnStop.addEventListener('click', stopScript);
    
    UI.btnRecord.addEventListener('click', startRecording);
    
    UI.settingShorts.addEventListener('change', (e) => {
        if(e.target.checked) UI.discordAppWrapper.classList.add('shorts-mode');
        else UI.discordAppWrapper.classList.remove('shorts-mode');
    });
    
    // Character Form
    UI.addCharForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let name = document.getElementById('char-name').value.trim();
        let pic = document.getElementById('char-pic').value.trim();
        let emoji = document.getElementById('char-emoji').value.trim();
        let color = document.getElementById('char-color').value;
        let badge = document.getElementById('char-badge') ? document.getElementById('char-badge').value.trim() : '';
        if(name) {
            characters[name] = { pic, emoji, color, badge };
            renderCharacters();
            UI.addCharForm.reset();
            document.getElementById('char-color').value = '#ffffff';
        }
    });
    
    // Meme Form
    UI.addMemeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let key = document.getElementById('meme-key').value.trim().toLowerCase();
        let url = document.getElementById('meme-url').value.trim();
        if(key && url) {
            memes[key] = url;
            renderMemes();
            UI.addMemeForm.reset();
        }
    });
}

// --- PARSING ---
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
        
        let matchEffect = block.match(/^\[effect:\s*(.+?)\]$/i);
        if(matchEffect) {
            parsedSteps.push({ type: 'effect', name: matchEffect[1].toLowerCase() });
            return;
        }

        let matchSfx = block.match(/^\[sfx:\s*(.+?)\]$/i);
        if(matchSfx) {
            parsedSteps.push({ type: 'sfx', name: matchSfx[1].toLowerCase() });
            return;
        }

        if(block.toLowerCase() === '[delete:last]') {
            parsedSteps.push({ type: 'delete_last' });
            return;
        }

        let matchTypeErase = block.match(/^\[type_erase:\s*"(.*?)"\s*->\s*"(.*?)"\]$/i);
        if(matchTypeErase) {
            parsedSteps.push({ type: 'type_erase', text1: matchTypeErase[1], text2: matchTypeErase[2] });
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

// --- PLAYBACK ENGINE ---
async function playScript() {
    if(parsedSteps.length === 0) return;
    
    playbackState.playing = true;
    playbackState.paused = false;
    UI.btnPause.innerText = '⏸ Pause';
    
    UI.messageContainer.classList.remove('visible');
    
    let simulatedTime = new Date();
    
    for(let i = playbackState.currentStep; i < parsedSteps.length; i++) {
        playbackState.currentStep = i;
        updateHUD();
        
        let step = parsedSteps[i];
        
        if(step.type === 'pause') {
            UI.messageContainer.classList.remove('visible');
            let ok = await wait(step.time);
            if(!ok) break;
            continue;
        }
        
        if(step.type === 'system') {
            UI.messageContainer.classList.remove('visible');
            await wait(200); 
            if(!playbackState.playing) break;

            UI.messageContainer.className = 'system-divider';
            UI.messageContainer.innerHTML = `<span>${escapeHTML(step.text)}</span>`;
            
            let timeMatch = step.text.match(/(\d+)\s+minutes later/i);
            if (timeMatch) simulatedTime.setMinutes(simulatedTime.getMinutes() + parseInt(timeMatch[1]));
            
            
            // force reflow
            void UI.messageContainer.offsetWidth;
            UI.messageContainer.classList.add('visible');
            
            let ok = await wait(parseInt(UI.settingDisplay.value));
            if(!ok) break;
            continue;
        }
        
        if(step.type === 'effect') {
            UI.discordContainer.classList.add('effect-' + step.name);
            setTimeout(() => {
                UI.discordContainer.classList.remove('effect-' + step.name);
            }, step.name === 'shake' ? 300 : 500);
            continue;
        }
        
        if(step.type === 'sfx') {
            if(sfxTracks[step.name]) {
                new Audio(sfxTracks[step.name]).play().catch(e=>{});
            }
            continue;
        }

        if(step.type === 'delete_last') {
            UI.messageContainer.classList.remove('visible');
            continue;
        }

        if(step.type === 'type_erase') {
            let typeTime = parseInt(UI.settingTyping.value);
            
            UI.chatInputText.innerText = "";
            UI.chatInputText.classList.add("typing");
            
            let t1 = step.text1;
            let currentStr = "";
            for(let c=0; c<t1.length; c++) {
                currentStr += t1[c];
                UI.chatInputText.innerText = currentStr;
                let ok = await wait(Math.max(30, typeTime / t1.length));
                if(!ok) break;
            }
            if(!playbackState.playing) break;
            await wait(400); 
            
            for(let c=t1.length; c>=0; c--) {
                UI.chatInputText.innerText = t1.substring(0, c);
                let ok = await wait(30);
                if(!ok) break;
            }
            if(!playbackState.playing) break;
            await wait(200);
            
            let t2 = step.text2;
            currentStr = "";
            for(let c=0; c<t2.length; c++) {
                currentStr += t2[c];
                UI.chatInputText.innerText = currentStr;
                let ok = await wait(Math.max(30, typeTime / t2.length));
                if(!ok) break;
            }
            
            UI.chatInputText.classList.remove("typing");
            UI.chatInputText.innerText = "Message #general";
            continue;
        }
        
        if(step.type === 'message') {
            UI.messageContainer.classList.remove('visible');
            await wait(200);
            if(!playbackState.playing) break;
            
            UI.messageContainer.innerHTML = '';
            
            let typingDuration = parseInt(UI.settingTyping.value);
            let charData = characters[step.name] || { color: '#ffffff', pic: '', emoji: '?' };
            
            UI.typingIndicator.style.display = 'flex';
            UI.typingIndicator.innerHTML = `
                ${getAvatarHTML(charData, 28)}
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span id="typing-text" style="margin-left: 5px;"><strong>${escapeHTML(step.name)}</strong> is typing...</span>
            `;
            
            let ok = await wait(typingDuration);
            if(!ok) break;
            
            UI.typingIndicator.style.display = 'none';
            
            let isMeme = false;
            for(let line of step.lines) {
                if(line.match(/^\[meme:(.+?)\]$/i)) isMeme = true;
            }
            
            let displayTime = step.time;
            if(!displayTime) {
                if(isMeme) {
                    displayTime = parseInt(UI.settingMeme.value);
                } else {
                    let totalChars = step.lines.join('\n').length;
                    displayTime = totalChars * 55;
                    if(displayTime < 1800) displayTime = 1800;
                    if(displayTime > 5000) displayTime = 5000;
                }
            }
            
            let contentHTML = step.lines.map(line => {
                let memeMatch = line.match(/^\[meme:(.+?)\]$/i);
                if(memeMatch) {
                    let memeUrl = memes[memeMatch[1].toLowerCase()] || '';
                    return `<img src="${memeUrl}" class="msg-meme">`;
                }
                
                let reactMatch = line.match(/^\[react:(.+?):(\d+)\]$/i);
                if(reactMatch) {
                    return `<div class="msg-reaction"><span>${reactMatch[1]}</span><span>${reactMatch[2]}</span></div>`;
                }
                
                let editedMatch = line.match(/^(.*)\(edited\)(.*)$/i);
                if(editedMatch) {
                    return `<div class="msg-line">${escapeHTML(editedMatch[1].trim())} <span class="msg-edited">(edited)</span> ${escapeHTML(editedMatch[2].trim())}</div>`;
                }
                
                return `<div class="msg-line">${escapeHTML(line)}</div>`;
            }).join('');
            
            let badgeHTML = charData.badge ? `<span class="msg-badge">${escapeHTML(charData.badge)}</span>` : '';
            UI.messageContainer.className = 'message-container';
            UI.messageContainer.innerHTML = `
                ${getAvatarHTML(charData, 52)}
                <div class="msg-content-wrapper">
                    <div class="msg-header">
                        <span class="msg-username" style="color: ${charData.color}">${escapeHTML(step.name)}</span>${badgeHTML}
                        <span class="msg-timestamp">Today at ${getTimestamp(simulatedTime)}</span>
                    </div>
                    <div class="msg-text-lines">
                        ${contentHTML}
                    </div>
                </div>
            `;
            
            void UI.messageContainer.offsetWidth;
            UI.messageContainer.classList.add('visible');
            
            if(UI.settingSound.checked) playPing();
            
            simulatedTime.setMilliseconds(simulatedTime.getMilliseconds() + typingDuration + displayTime);
            
            ok = await wait(displayTime);
            if(!ok) break;
        }
    }
    
    if(playbackState.playing) {
        playbackState.playing = false;
        playbackState.currentStep = parsedSteps.length;
        updateHUD();
    }
}

function stopScript() {
    playbackState.playing = false;
    playbackState.paused = false;
    playbackState.currentStep = 0;
    UI.messageContainer.innerHTML = '';
    UI.messageContainer.classList.remove('visible');
    UI.typingIndicator.style.display = 'none';
    UI.btnPause.innerText = '⏸ Pause';
    updateHUD();
}

async function wait(ms) {
    let speed = parseFloat(UI.playbackSpeed.value) || 1;
    let remaining = ms / speed;
    let lastTime = performance.now();
    
    return new Promise(resolve => {
        function tick(time) {
            if(!playbackState.playing) { resolve(false); return; }
            let delta = time - lastTime;
            if(delta > 100) delta = 16; // Clamp large leaps if tab gets backgrounded
            lastTime = time;
            
            if(!playbackState.paused) {
                remaining -= delta;
            }
            
            if(remaining <= 0) {
                resolve(true);
            } else {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    });
}

// --- UTILS ---
function updateHUD() {
    if(parsedSteps.length > 0) {
        UI.progressBar.style.width = ((playbackState.currentStep) / parsedSteps.length * 100) + '%';
    } else {
        UI.progressBar.style.width = '0%';
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 60, max: 60 } },
            audio: true
        });
        
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'beluga_simulator_export.webm';
            a.click();
            URL.revokeObjectURL(url);
            
            // Stop tracks
            stream.getTracks().forEach(t => t.stop());
        };
        
        mediaRecorder.start();
        
        // Auto play the script after recording starts
        playbackState.currentStep = 0;
        await playScript();
        
        // Stop recording when script finishes
        if(mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    } catch(err) {
        console.error("Recording failed: ", err);
        alert("Recording failed. Did you cancel the screen share?");
    }
}

function renderCharacters() {
    UI.characterList.innerHTML = '';
    for(let name in characters) {
        let char = characters[name];
        let div = document.createElement('div');
        div.className = 'char-item';
        div.innerHTML = `
            ${getAvatarHTML(char, 24)}
            <span style="color: ${char.color}; font-weight: bold;">${escapeHTML(name)}</span>
            <button class="btn btn-gray" style="padding: 2px 6px; font-size: 10px; margin-left: auto;" onclick="deleteChar('${escapeHTML(name)}')">X</button>
        `;
        UI.characterList.appendChild(div);
    }
}
window.deleteChar = function(name) {
    delete characters[name];
    renderCharacters();
};

function renderMemes() {
    UI.memeList.innerHTML = '';
    for(let key in memes) {
        let url = memes[key];
        let div = document.createElement('div');
        div.className = 'char-item';
        div.innerHTML = `
            <img src="${escapeHTML(url)}" style="width:24px; height:24px; object-fit:cover; border-radius:4px;">
            <span style="color:#f2f3f5">${escapeHTML(key)}</span>
            <button class="btn btn-gray" style="padding: 2px 6px; font-size: 10px; margin-left: auto;" onclick="deleteMeme('${escapeHTML(key)}')">X</button>
        `;
        UI.memeList.appendChild(div);
    }
}
window.deleteMeme = function(key) {
    delete memes[key];
    renderMemes();
};

function getAvatarHTML(charData, size) {
    if(charData.pic) {
        return `<img src="${charData.pic}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; flex-shrink: 0;" onerror="this.outerHTML='<div style=\\'width:${size}px; height:${size}px; background:${charData.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:${size/2}px; flex-shrink: 0;\\'>${charData.emoji || '?'}</div>'">`;
    } else {
        return `<div style="width:${size}px; height:${size}px; background:${charData.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:${size/2}px; flex-shrink: 0;">${charData.emoji || '?'}</div>`;
    }
}

function getTimestamp(d) {
    if (!d) d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    m = m < 10 ? '0' + m : m;
    return `${h}:${m} ${ampm}`;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function playPing() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        
        const osc1 = ctx.createOscillator();
        osc1.frequency.value = 1174.7; 
        osc1.type = 'sine';
        osc1.connect(gain); 
        osc1.start(); 
        osc1.stop(ctx.currentTime + 0.5);
        
        const osc2 = ctx.createOscillator();
        osc2.frequency.value = 1568; 
        osc2.type = 'sine';
        osc2.connect(gain); 
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.5);
    } catch(e) {
        console.error("Audio failed", e);
    }
}

// Start
init();
