class AgenticBar {
    constructor(opts={}) {
        this.API = opts.apiBase || 'http://localhost:1117/api';
        this.userType = opts.userType || 'visitor';
        this.onNavigate = opts.onNavigate || (()=>{});
        this.onResponse = opts.onResponse || (()=>{});
        this.sessionId = null;
        this.isListening = false;
        this.recognition = null;
        this.init();
    }
    
    async init() {
        await this.startSession();
        this.createUI();
        this.setupSpeech();
    }
    
    async startSession() {
        try {
            const r = await fetch(`${this.API}/session/start`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_type:this.userType}) });
            const d = await r.json();
            this.sessionId = d.session_id;
        } catch(e) {}
    }
    
    createUI() {
        const bar = document.createElement('div');
        bar.id = 'agentic-bar';
        bar.innerHTML = `<style>#agentic-bar{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1a3a4a,#0d2538);border-radius:50px;padding:10px 20px;display:flex;align-items:center;gap:15px;box-shadow:0 4px 20px rgba(0,0,0,0.3);border:2px solid rgba(184,134,11,0.4);z-index:9999;font-family:sans-serif}#agentic-bar .mic{width:45px;height:45px;border-radius:50%;background:linear-gradient(135deg,#B8860B,#DAA520);border:none;cursor:pointer;font-size:1.3em}#agentic-bar .mic.on{background:#f44336;animation:pulse 1s infinite}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(244,67,54,0.7)}50%{box-shadow:0 0 0 12px rgba(244,67,54,0)}}#agentic-bar .txt{color:#fff;font-size:13px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#agentic-bar .badge{padding:2px 8px;border-radius:10px;font-size:10px;background:rgba(184,134,11,0.3);color:#B8860B}</style><button class="mic" id="ab-mic">🎤</button><div class="txt" id="ab-txt">Click mic</div><div id="ab-badges"></div>`;
        document.body.appendChild(bar);
        document.getElementById('ab-mic').onclick = () => this.toggle();
    }
    
    setupSpeech() {
        if (!('webkitSpeechRecognition' in window)) return;
        const SR = window.webkitSpeechRecognition;
        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.onresult = async(e) => {
            let final='';
            for(let i=e.resultIndex;i<e.results.length;i++) if(e.results[i].isFinal) final+=e.results[i][0].transcript;
            document.getElementById('ab-txt').textContent = final||'Listening...';
            if(final) await this.send(final);
        };
        this.recognition.onend = () => { if(this.isListening) this.recognition.start(); };
    }
    
    toggle() { this.isListening ? this.stop() : this.start(); }
    start() { if(!this.recognition) return alert('Use Chrome'); this.recognition.start(); this.isListening=true; document.getElementById('ab-mic').classList.add('on'); document.getElementById('ab-mic').textContent='🔴'; }
    stop() { if(this.recognition) this.recognition.stop(); this.isListening=false; document.getElementById('ab-mic').classList.remove('on'); document.getElementById('ab-mic').textContent='🎤'; }
    
    async send(text) {
        try {
            const r = await fetch(`${this.API}/ledger/log`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_type:this.userType,session_id:this.sessionId,raw_transcript:text,page_route:location.pathname}) });
            const d = await r.json();
            if(d.analysis) document.getElementById('ab-badges').innerHTML = `<span class="badge">${d.analysis.sentiment}</span><span class="badge">${d.analysis.emotion}</span>`;
            if(d.tts_response) this.speak(d.tts_response.text);
            if(d.analysis?.intent==='system_back') this.onNavigate('back');
            if(d.analysis?.intent==='system_close') this.onNavigate('/');
            this.onResponse(d);
        } catch(e) {}
    }
    
    speak(text) { if(window.speechSynthesis) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } }
}
if(typeof module!=='undefined') module.exports=AgenticBar;
