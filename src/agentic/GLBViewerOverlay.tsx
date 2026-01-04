import React,{useState,useEffect}from'react';import AgenticBar,{onCommand}from'./AgenticBar';import{glbScene}from'./GLBSceneController';
const GLBViewerOverlay:React.FC<{name?:string}>=({name='Skyven'})=>{
const[cf,setCf]=useState(1);const st=glbScene.getState();
useEffect(()=>{const h=(e:any)=>setCf(e.detail.floor);window.addEventListener('glb-floor',h);return()=>window.removeEventListener('glb-floor',h)},[]);
const qf=[1,10,20,30,40,50];
return(<div data-glb style={{position:'relative',width:'100%',height:'100%'}}>
<div style={{position:'absolute',top:20,left:20,background:'rgba(0,0,0,0.7)',padding:'12px 20px',borderRadius:12,zIndex:100}}>
<div style={{color:'#B8860B',fontWeight:700,fontSize:'1.2em'}}>{name}</div>
<div style={{color:'#888',fontSize:'0.85em'}}>Floor {cf} of {st.totalFloors}</div></div>
<div style={{position:'absolute',top:20,right:20,background:'rgba(0,0,0,0.7)',padding:8,borderRadius:12,display:'flex',gap:4,zIndex:100}}>
{qf.map(f=><button key={f} onClick={()=>glbScene.goFloor(f)} style={{width:36,height:36,background:cf===f?'#B8860B':'rgba(255,255,255,0.1)',color:cf===f?'#000':'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>{f}</button>)}</div>
<div style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:8,zIndex:100}}>
{['Lobby','Amenities','Rooftop','Pool','Gym'].map(h=><button key={h} onClick={()=>glbScene.goHotspot(h.toLowerCase())} style={{padding:'10px 16px',background:'rgba(0,0,0,0.7)',color:'#fff',border:'1px solid #444',borderRadius:20,cursor:'pointer',fontSize:'0.85em'}}>📍 {h}</button>)}</div>
<div style={{position:'absolute',bottom:20,left:20,right:20,zIndex:100}}>
<AgenticBar context={`${name} - Floor ${cf}`} hints={['"go to floor 44"','"lobby"','"rooftop"']} welcomeMessage={`Welcome to ${name}. Say go to floor and a number.`}/></div></div>)};
export default GLBViewerOverlay;
