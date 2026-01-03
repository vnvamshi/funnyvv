import React, { useState, useRef, useEffect } from 'react';

interface VoiceToVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMessage?: (message: any) => void;
}

const VoiceToVoiceModal: React.FC<VoiceToVoiceModalProps> = ({ isOpen, onClose, onAddMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (e: any) => {
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
        }
        if (final) { setTranscript(final); onAddMessage?.({ role: 'user', content: final }); }
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => { try { recognitionRef.current?.stop(); } catch(e) {} };
  }, [onAddMessage]);

  const toggle = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setTranscript(''); recognitionRef.current?.start(); setIsListening(true); }
  };

  if (!isOpen) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99999}}>
      <div style={{background:'linear-gradient(135deg,#004236,#007E67)',borderRadius:'24px',padding:'40px',maxWidth:'450px',width:'90%',textAlign:'center',color:'white'}}>
        <h2 style={{marginBottom:'20px'}}>Voice Assistant</h2>
        <div onClick={toggle} style={{width:'100px',height:'100px',borderRadius:'50%',background:isListening?'#F5EC9B':'rgba(255,255,255,0.15)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'40px'}}>{isListening?'🎤':'🎙️'}</div>
        <p>{isListening?'Listening...':'Tap to speak'}</p>
        {transcript && <div style={{background:'rgba(255,255,255,0.1)',padding:'15px',borderRadius:'10px',margin:'15px 0'}}>{transcript}</div>}
        <button onClick={onClose} style={{marginTop:'20px',padding:'12px 40px',background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'30px',color:'white',cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
};
export default VoiceToVoiceModal;
