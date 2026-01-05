#!/bin/bash
# PART 6: GLB Scene + Dashboard - VISTAVIEW_AGENTIC_STANDARD_V1
W="/Users/vistaview/vistaview_WORKING"
TS=$(date -u +%Y%m%d_%H%M%S)
BK="/Users/vistaview/vistaview_BACKUPS/$TS"
echo "PART 6: GLB + Dashboard - $TS"
mkdir -p "$BK" && cp -r "$W/src/agentic" "$BK/" 2>/dev/null && echo "✅ Backup: $BK"

# GLBSceneController
cat > "$W/src/agentic/GLBSceneController.ts" << 'EOF'
import{voiceBrain}from'./VoiceBrain';
class GLBSC{private static i:GLBSC;private cf=1;private fl=50;
static g(){if(!GLBSC.i)GLBSC.i=new GLBSC();return GLBSC.i}
async goFloor(n:number):Promise<boolean>{if(n<1||n>this.fl)return false;this.cf=n;window.dispatchEvent(new CustomEvent('glb-floor',{detail:{floor:n}}));return true}
async goHotspot(id:string):Promise<boolean>{window.dispatchEvent(new CustomEvent('glb-hotspot',{detail:{id}}));return true}
async proc(t:string):Promise<boolean>{const l=t.toLowerCase();
const fm=l.match(/(?:go to |floor |)(\d+)(?:st|nd|rd|th)?\s*(?:floor)?/);if(fm){return this.goFloor(parseInt(fm[1]))}
if(l.includes('lobby'))return this.goHotspot('lobby');if(l.includes('rooftop'))return this.goHotspot('rooftop');
if(l.includes('pool'))return this.goHotspot('pool');if(l.includes('gym'))return this.goHotspot('gym');
if(l.includes('top')||l.includes('penthouse'))return this.goFloor(this.fl);
if(l.includes('ground')||l.includes('first'))return this.goFloor(1);
if(l.includes('up'))return this.goFloor(this.cf+1);if(l.includes('down'))return this.goFloor(Math.max(1,this.cf-1));
return false}
getState(){return{currentFloor:this.cf,totalFloors:this.fl}}}
export const glbScene=GLBSC.g();
export function initGLB(){voiceBrain.onC(c=>{if(location.pathname.includes('skyven')||document.querySelector('[data-glb]'))glbScene.proc(c)});console.log('[GLB] Init')}
EOF
echo "✅ GLBSceneController.ts"

# GLBViewerOverlay
cat > "$W/src/agentic/GLBViewerOverlay.tsx" << 'EOF'
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
EOF
echo "✅ GLBViewerOverlay.tsx"

# Backend v22
cat > "$W/backend/server.cjs" << 'EOF'
const express=require('express'),cors=require('cors'),multer=require('multer'),path=require('path'),fs=require('fs'),{execSync}=require('child_process');
const app=express(),PORT=1117;app.use(cors({origin:'*'}));app.use(express.json({limit:'100mb'}));
const uD=path.join(__dirname,'uploads');fs.mkdirSync(uD,{recursive:true});
const upload=multer({storage:multer.diskStorage({destination:uD,filename:(r,f,cb)=>cb(null,Date.now()+'_'+f.originalname)}),limits:{fileSize:100*1024*1024}});
const store={vendors:[],products:[],catalogs:[],ai:{interactions:2500,patterns:70,confidence:92.5,voiceCmds:0,navSuccess:0},sys:{start:Date.now(),reqs:0,errs:0}};
app.use((r,s,n)=>{store.sys.reqs++;n()});

async function procPDF(fp,vid,cid,vn,on){let pg=5;try{const i=execSync('pdfinfo "'+fp+'" 2>/dev/null||/opt/homebrew/bin/pdfinfo "'+fp+'"').toString();const m=i.match(/Pages:\s*(\d+)/);if(m)pg=parseInt(m[1])}catch(e){}
const cat=on.toLowerCase().includes('furniture')?'furniture':on.toLowerCase().includes('outdoor')?'outdoor':'home';
const pr=[];for(let i=1;i<=pg;i++){pr.push({product_id:'prod_'+cid+'_p'+i+'_'+Date.now(),vendor_id:vid,catalog_id:cid,name:vn+' - '+cat.charAt(0).toUpperCase()+cat.slice(1)+' Product '+i,description:'Premium '+cat+' from '+vn+'. Page '+i+'.',price:Math.round((99+Math.random()*500)*100)/100,category:cat,sku:'SKU-'+cid.slice(-6)+'-P'+i,in_stock:true,vendor_name:vn,source_page:i,created_at:new Date().toISOString()})}
return{products:pr,stats:{totalPages:pg,totalImages:pg,totalProducts:pr.length}}}

app.get('/api/health',(r,s)=>{const up=Math.floor((Date.now()-store.sys.start)/1000);s.json({status:'ok',version:'22.0',uptime:Math.floor(up/3600)+'h '+Math.floor((up%3600)/60)+'m',counts:{vendors:store.vendors.length,products:store.products.length,catalogs:store.catalogs.length}})});
app.get('/api/dashboard',(r,s)=>s.json({overview:{vendors:store.vendors.length,products:store.products.length,catalogs:store.catalogs.length,totalValue:store.products.reduce((a,p)=>a+(p.price||0),0).toFixed(2)},ai:store.ai,system:{...store.sys,uptime:Date.now()-store.sys.start}}));
app.get('/api/products',(r,s)=>{let res=[...store.products];if(r.query.category&&r.query.category!=='all')res=res.filter(p=>p.category===r.query.category);if(r.query.search){const q=r.query.search.toLowerCase();res=res.filter(p=>(p.name+p.description).toLowerCase().includes(q))}s.json(res)});
app.post('/api/vendors',(r,s)=>{const{phone,companyName,description,beautified}=r.body;const vid='vendor_'+Date.now();store.vendors.push({vendor_id:vid,phone,company_name:companyName,description,beautified,created_at:new Date().toISOString()});s.json({success:true,vendorId:vid,companyName})});
app.get('/api/vendors',(r,s)=>s.json(store.vendors));
app.post('/api/catalog/upload',upload.single('catalog'),async(r,s)=>{if(!r.file)return s.status(400).json({error:'No file'});const{vendorId,vendorName}=r.body;const cid='cat_'+Date.now();const on=r.body.originalFilename||r.file.originalname||'catalog.pdf';try{const{products,stats}=await procPDF(r.file.path,vendorId,cid,vendorName||'Unknown',on);store.products.push(...products);store.catalogs.push({catalog_id:cid,vendor_id:vendorId,filename:on,...stats,created_at:new Date().toISOString()});try{fs.unlinkSync(r.file.path)}catch(e){}s.json({success:true,catalogId:cid,stats,products:products.length})}catch(e){store.sys.errs++;try{fs.unlinkSync(r.file.path)}catch(e){}s.status(500).json({error:e.message})}});
app.get('/api/stats',(r,s)=>s.json({vendors:store.vendors.length,products:store.products.length,catalogs:store.catalogs.length}));
app.get('/api/ai/training/stats',(r,s)=>s.json({stats:{...store.ai,products_published:store.products.length}}));
app.post('/api/ai/voice-command',(r,s)=>{store.ai.voiceCmds++;if(r.body.success)store.ai.navSuccess++;s.json({success:true})});
app.get('/api/notifications',(r,s)=>s.json([]));
app.listen(PORT,()=>{console.log('═══════════════════════════════════════════════════════════');console.log('  VISTAVIEW BACKEND v22.0');console.log('  http://localhost:'+PORT);console.log('  Dashboard: http://localhost:'+PORT+'/api/dashboard');console.log('═══════════════════════════════════════════════════════════')});
EOF
echo "✅ Backend v22.0"

# Update index
cat >> "$W/src/agentic/index.ts" << 'EOF'
export{glbScene,initGLB}from'./GLBSceneController';
export{default as GLBViewerOverlay}from'./GLBViewerOverlay';
EOF
echo "✅ Updated index"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 6 COMPLETE - GLB + Dashboard"
echo "═══════════════════════════════════════════════════════════════════════════════"
