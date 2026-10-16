// RicOS C64 TEST 02 — original-style menu and debugger shell, not the PETSCII editor.
// The emulator is provided by James/jaammees' C64 HTML export runtime.
(function(){
'use strict';
const el=id=>document.getElementById(id);
let ready=false,started=false,paused=false,loadMode='inject',randomDelay=false,grid=false,raster=false,mouseInfo=false;
let memoryAddress=0x0400,activeTab='Memory',sizeMode='Fit',sidModel='6581',refreshTimer=0;
const disabled=['Joystick Settings...']; // unavailable dialogs are not offered as interactive options
const menuData={
'C64':[['Show Raster Position','raster'],['Show Grid','grid'],['Mouse Info','mouseinfo'],'-',
['Load PRG...','loadprg'],['Attach D64...','attachd64'],['Autostart D64...','autod64'],['Insert CRT...','loadcrt'],'-',
['Download Snapshot','snapshot'],'PRG Start Settings',['Load/Run','mode-load'],['Inject into RAM','mode-inject'],['Random Delay','randomdelay'],'-',
['Reset Machine','reset']],
'Sound':[['Sound Playback','sound'],'SID Model',['6581','sid6581'],['8580','sid8580']],
'Joystick':[['Port 1','joy1'],['Port 2','joy2'],['Swap Joysticks','swapjoy'],'1351 Mouse',['Port 1','mouse1'],['Port 2','mouse2']],
'Size':[['100%','size100'],['200%','size200'],['300%','size300'],['400%','size400'],['Fit Pixel Multiple','sizepixel'],['Fit','sizefit']],
'Speed':[['25%','speed25'],['50%','speed50'],['100%','speed100'],['150%','speed150'],['200%','speed200'],['300%','speed300']]
};
const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=action;return b};
function buildMenus(){
 const bar=el('menubar');
 for(const [name,items] of Object.entries(menuData)){
  const details=document.createElement('details');details.className='menu';
  const summary=document.createElement('summary');summary.textContent=name;details.append(summary);
  const popup=document.createElement('div');popup.className='dropdown';details.append(popup);
  for(const item of items){
   if(item==='-'){const sep=document.createElement('div');sep.className='separator';popup.append(sep);continue}
   if(typeof item==='string'){const lab=document.createElement('div');lab.className='label';lab.textContent=item;popup.append(lab);continue}
   popup.append(button(item[0],item[1]));
  }
  details.addEventListener('toggle',()=>{if(details.open)document.querySelectorAll('.menu[open]').forEach(x=>{if(x!==details)x.open=false})});
  bar.append(details);
 }
 document.addEventListener('click',e=>{if(!e.target.closest('.menu'))document.querySelectorAll('.menu[open]').forEach(x=>x.open=false)});
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;runAction(b.dataset.action);document.querySelectorAll('.menu[open]').forEach(x=>x.open=false)});
 syncChecks();
}
function syncChecks(){
 const checked={
 raster,grid,mouseinfo,randomdelay,sound:typeof c64!=='undefined'&&c64.sound?!!c64.sound.audioEnabled:true,
 'mode-inject':loadMode==='inject','mode-load':loadMode==='loadrun',
 sid6581:sidModel==='6581',sid8580:sidModel==='8580',
 sizefit:sizeMode==='Fit',sizepixel:sizeMode==='Fit Pixel Multiple',
 joy1:!!(ready&&c64.joystick.portEnabled[0]),joy2:!!(ready&&c64.joystick.portEnabled[1]),
 mouse1:!!(ready&&c64.joystick.mousePortEnabled[0]),mouse2:!!(ready&&c64.joystick.mousePortEnabled[1])
 };
 document.querySelectorAll('#menubar [data-action]').forEach(x=>x.classList.toggle('checked',!!checked[x.dataset.action]));
}
function notice(text,error=false){const n=el('notice');n.textContent=text;n.classList.toggle('error',error)}
function assertReady(){if(!ready)throw Error('El C64 todavía se está inicializando')}
function ensureStart(){assertReady();if(!g_started)startContent();started=true;el('playpause').textContent='⏸ Pause';paused=false}
function reset(){ensureStart();c64_reset();notice('Reset Machine')}
function playPause(){
 ensureStart();
 if(paused){debugger_play();paused=false;el('playpause').textContent='⏸ Pause'}
 else{debugger_pause();paused=true;el('playpause').textContent='▶ Play'}
 notice(paused?'Paused':'Running');refreshDebugger();
}
function step(){
 ensureStart();
 if(!paused){debugger_pause();paused=true;el('playpause').textContent='▶ Play'}
 debugger_step();refreshDebugger();notice('CPU Step');
}
function setSize(mode){
 sizeMode=mode;
 // Existing C64 renderer owns layout and canvas; apply requested scale after its resize.
 if(typeof resize==='function')resize();
 const canvas=el('c64-canvas');
 if(!canvas)return;
 if(/^\d+%$/.test(mode)){let sc=parseInt(mode,10)/100;canvas.style.width=(384*sc)+'px';canvas.style.height=(272*sc)+'px'}
 syncChecks();
}
function readByte(addr){return c64_cpuReadNS(addr&65535)&255}
const hex=(n,d=2)=>(n>>>0).toString(16).toUpperCase().padStart(d,'0');
function renderRegisters(){
 const regs=[['PC','$'+hex(c64_getPC(),4)],['A','$'+hex(c64_getRegA())],['X','$'+hex(c64_getRegX())],['Y','$'+hex(c64_getRegY())],['SP','$'+hex(c64_getSP())],['Raster',String(c64_getRasterY())],['Cycle',String(c64_getVicCycle())],['N Z C',''+c64_getFlagN()+' '+c64_getFlagZ()+' '+c64_getFlagC()]];
 el('registers').innerHTML=regs.map(([name,value])=>'<div>'+name+'<strong>'+value+'</strong></div>').join('');
}
const opcodes={0x00:['BRK',1],0x20:['JSR',3],0x4C:['JMP',3],0x6C:['JMP',3],0x60:['RTS',1],0x40:['RTI',1],
0xEA:['NOP',1],0xA9:['LDA',2],0xA5:['LDA',2],0xAD:['LDA',3],0xBD:['LDA',3],0xA2:['LDX',2],0xA0:['LDY',2],0x85:['STA',2],0x8D:['STA',3],0x9D:['STA',3],0x8E:['STX',3],0x8C:['STY',3],
0x18:['CLC',1],0x38:['SEC',1],0x58:['CLI',1],0x78:['SEI',1],0xD8:['CLD',1],0xF8:['SED',1],0xCA:['DEX',1],0x88:['DEY',1],0xE8:['INX',1],0xC8:['INY',1],0xD0:['BNE',2],0xF0:['BEQ',2],0x10:['BPL',2],0x30:['BMI',2],0x90:['BCC',2],0xB0:['BCS',2],0x69:['ADC',2],0xE9:['SBC',2],0xC9:['CMP',2],0x29:['AND',2],0x09:['ORA',2],0x49:['EOR',2],0x48:['PHA',1],0x68:['PLA',1],0x08:['PHP',1],0x28:['PLP',1]};
function renderDisassembly(){
 let at=c64_getPC(),lines=[];
 for(let i=0;i<32;i++){
  const op=readByte(at),o=opcodes[op],len=o?o[1]:1;
  const bytes=Array.from({length:len},(_,j)=>readByte(at+j));
  const arg=len===3?'$'+hex(bytes[1]+256*bytes[2],4):len===2?'$'+hex(bytes[1]):'';
  lines.push((i===0?'▶ ':'  ')+hex(at,4)+'  '+bytes.map(x=>hex(x)).join(' ').padEnd(9,' ')+(o?o[0]+' '+arg:'.BYTE $'+hex(op)));
  at=(at+len)&65535;
 }
 el('disassembly').textContent=lines.join('\n');
}
function renderMemory(){
 let addr=memoryAddress;const rows=[];
 for(let r=0;r<32;r++){
  const data=Array.from({length:16},(_,i)=>readByte(addr+i));
  let ascii=data.map(n=>n>=32&&n<127?String.fromCharCode(n):'.').join('');
  rows.push('$'+hex(addr,4)+'  '+data.map(x=>hex(x)).join(' ')+'  '+ascii);
  addr=(addr+16)&65535;
 }
 el('righttext').textContent=rows.join('\n');
}
function renderCharset(){
 const start=0xd000;let rows=['CHARGEN / C64 MEMORY (HEX VIEW)'];
 for(let r=0;r<26;r++){let a=start+r*8;rows.push(hex(a,4)+' : '+Array.from({length:8},(_,i)=>hex(readByte(a+i))).join(' '))}
 el('righttext').textContent=rows.join('\n');
}
function renderSprites(){
 let rows=['SPRITE CONTROL REGISTERS ($D000-$D02E)',''];
 for(let s=0;s<8;s++){rows.push('Sprite '+s+'   X=$'+hex(readByte(0xd000+2*s))+'  Y=$'+hex(readByte(0xd001+2*s))+'  COLOR=$'+hex(readByte(0xd027+s)))}
 rows.push('','Enable: $'+hex(readByte(0xd015)),'Multicolor: $'+hex(readByte(0xd01c)),'X high bit: $'+hex(readByte(0xd010)));
 el('righttext').textContent=rows.join('\n');
}
function renderBitmap(){
 const r=readByte(0xd011),base=readByte(0xd018);
 el('righttext').textContent='VIC-II DISPLAY\n\nD011: $'+hex(r)+'\nD016: $'+hex(readByte(0xd016))+'\nD018: $'+hex(base)+'\nD020: $'+hex(readByte(0xd020))+'\nD021: $'+hex(readByte(0xd021))+'\n\nBitmap mode: '+(r&32?'ON':'OFF')+'\nDisplay: '+(r&16?'ON':'OFF');
}
function renderSID(){
 let rows=['SID $D400-$D418',''];
 for(let a=0xd400;a<0xd419;a+=8)rows.push('$'+hex(a,4)+'  '+Array.from({length:Math.min(8,0xd419-a)},(_,i)=>hex(readByte(a+i))).join(' '));
 rows.push('','Model: '+sidModel);
 el('righttext').textContent=rows.join('\n');
}
function renderDrive(){
 let text='C1541 DRIVE\n\n';
 try{text+='Status: '+(typeof c1541_getStatus==='function'?c1541_getStatus():'N/A')+'\n';text+='Position: '+(typeof c1541_getPosition==='function'?c1541_getPosition():'N/A')}
 catch(e){text+='Waiting for drive data'};
 el('righttext').textContent=text;
}
function refreshDebugger(){
 if(!ready)return;
 try{renderRegisters();renderDisassembly();
 const tabs={Memory:renderMemory,Charset:renderCharset,Sprites:renderSprites,Bitmap:renderBitmap,SID:renderSID,Drive:renderDrive};tabs[activeTab]();
 el('rastertext').textContent='Raster '+c64_getRasterY();
 }catch(e){notice('Debugger: '+e.message,true)}
}
function runAction(action){
 try{
 if(action==='loadprg'||action==='attachd64'||action==='autod64'||action==='loadcrt'){el(action==='loadprg'?'fprg':action==='loadcrt'?'fcrt':'fd64').dataset.autostart=action==='autod64'?'yes':'no';el(action==='loadprg'?'fprg':action==='loadcrt'?'fcrt':'fd64').click();return}
 if(action==='raster'){raster=!raster;el('videooverlay').classList.toggle('showraster',raster);notice('Raster overlay '+(raster?'ON':'OFF'))}
 else if(action==='grid'){grid=!grid;el('videooverlay').classList.toggle('showgrid',grid);notice('Grid '+(grid?'ON':'OFF'))}
 else if(action==='mouseinfo'){mouseInfo=!mouseInfo;el('mousecoord').style.display=mouseInfo?'':'none'}
 else if(action==='randomdelay'){randomDelay=!randomDelay;notice('Random delay '+(randomDelay?'ON':'OFF'))}
 else if(action==='mode-load'){loadMode='loadrun'}
 else if(action==='mode-inject'){loadMode='inject'}
 else if(action==='reset')reset();
 else if(action==='snapshot')snapshot();
 else if(action==='sound'){ensureStart();if(c64.sound.audioEnabled)c64.sound.stopAudio();else c64.sound.startAudio()}
 else if(action.startsWith('sid')){ensureStart();sidModel=action.slice(3);c64.sound.setModel(sidModel)}
 else if(action==='joy1'||action==='joy2'){assertReady();let p=action==='joy1'?1:2;c64.joystick.setPortEnabled(p,!c64.joystick.portEnabled[p-1])}
 else if(action==='swapjoy'){assertReady();c64.joystick.swap()}
 else if(action==='mouse1'||action==='mouse2'){assertReady();let p=action==='mouse1'?1:2;c64.joystick.setMousePortEnabled(p,!c64.joystick.mousePortEnabled[p-1])}
 else if(action.startsWith('size'))setSize(action==='sizepixel'?'Fit Pixel Multiple':action==='sizefit'?'Fit':action.slice(4)+'%');
 else if(action.startsWith('speed')){ensureStart();debugger_set_speed(parseInt(action.slice(5),10));notice('Speed '+action.slice(5)+'%')}
 syncChecks();refreshDebugger();
 }catch(e){notice(e.message,true)}
}
function snapshot(){
 assertReady();
 if(typeof c64_getSnapshot!=='function'||typeof c64_getSnapshotSize!=='function')throw Error('Snapshot no disponible');
 const ptr=c64_getSnapshot(),n=c64_getSnapshotSize();
 if(!n||n>16*1024*1024)throw Error('Tamaño de snapshot inválido');
 const bytes=new Uint8Array(c64.HEAPU8.subarray(ptr,ptr+n));const url=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));
 const a=document.createElement('a');a.href=url;a.download='RICOS-C64-SNAPSHOT.bin';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 notice('Snapshot descargado');
}
async function loadFile(input){
 const file=input.files&&input.files[0];if(!file)return;
 try{
  ensureStart();const data=new Uint8Array(await file.arrayBuffer()),name=file.name.toLowerCase();
  if(name.endsWith('.prg')){
   c64_reset();const inject=loadMode==='inject';
   const delay=randomDelay?Math.random()*100:0;
   setTimeout(()=>{c64_loadPRG(data,data.length,inject?1:0);
    if(inject)c64.insertText('run\n');
    else setTimeout(()=>c64.insertText('load "*",8,1\nrun\n'),2000);
   },delay);
  }else if(name.endsWith('.d64')){
   c64_insertDisk(data,data.length);
   if(input.dataset.autostart==='yes'){c64_reset();setTimeout(()=>c64.insertText('load "*",8,1\nrun\n'),1100)}
  }else if(name.endsWith('.crt')){c64_loadCRT(data,data.length);c64_reset()}
  notice(file.name+' loaded');
 }catch(e){notice('Error: '+e.message,true)}
 finally{input.value=''}
}
function tab(name){
 activeTab=name;document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
 el('right-title').textContent=name;el('mem-address-bar').style.display=name==='Memory'?'flex':'none';refreshDebugger();
}
function initialise(){
 buildMenus();
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
 el('fprg').addEventListener('change',e=>loadFile(e.target));el('fd64').addEventListener('change',e=>loadFile(e.target));el('fcrt').addEventListener('change',e=>loadFile(e.target));
 el('startbtn').onclick=()=>{try{ensureStart();notice('Running')}catch(e){notice(e.message,true)}};
 el('resetbtn').onclick=()=>{try{reset()}catch(e){notice(e.message,true)}};
 el('playpause').onclick=()=>{try{playPause()}catch(e){notice(e.message,true)}};
 el('stepbtn').onclick=()=>{try{step()}catch(e){notice(e.message,true)}};
 el('memorygo').onclick=()=>{let x=parseInt(el('memoryaddress').value.replace(/^\$/,''),16);if(Number.isFinite(x)){memoryAddress=x&65535;refreshDebugger()}};
 el('memoryaddress').onkeydown=e=>{if(e.key==='Enter')el('memorygo').click()};
 el('fullscreenbtn').onclick=()=>{try{ensureStart();fullscreen()}catch(e){notice(e.message,true)}};
 el('joyinfo').onchange=()=>{try{assertReady();const port=parseInt(el('joyinfo').value,10);c64.joystick.setPortEnabled(1,port===1);c64.joystick.setPortEnabled(2,port===2);syncChecks();notice('Joystick port '+port)}catch(e){notice(e.message,true)}};
 el('memoryaddress').addEventListener('keydown',e=>e.stopImmediatePropagation());
 el('c64-canvas').addEventListener('mousemove',e=>{if(!mouseInfo)return;const r=e.target.getBoundingClientRect();el('mousecoord').textContent=Math.round((e.clientX-r.left)/r.width*384)+', '+Math.round((e.clientY-r.top)/r.height*272)});
 el('c64-canvas').setAttribute('tabindex','0');
 const check=setInterval(()=>{if(typeof c64_ready!=='undefined'&&c64_ready){ready=true;clearInterval(check);
  document.querySelectorAll('.controls button').forEach(b=>b.disabled=false);el('joyinfo').value='2';c64.joystick.setPortEnabled(2,true);
  notice('C64 ready — click screen to start');syncChecks();refreshDebugger();refreshTimer=setInterval(refreshDebugger,180);
 }},150);
 setTimeout(()=>{if(!ready)notice('C64 initialization failed; check browser console',true)},12000);
 window.addEventListener('error',e=>notice('Runtime error: '+e.message,true));
}
document.addEventListener('DOMContentLoaded',initialise);
})();
