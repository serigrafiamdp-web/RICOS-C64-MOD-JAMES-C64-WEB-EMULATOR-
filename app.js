// RicOS independent C64 controls. TEST 01, untested in browser.
(function(){
'use strict';
const $=id=>document.getElementById(id),status=$('status'),buttons=['start','reset','pause','fullscreen','file'];
let paused=false;
function message(m,bad=false){status.textContent=m;status.dataset.state=bad?'error':'ready'}
function ready(){return typeof c64_ready!=='undefined'&&c64_ready&&typeof c64_reset==='function'}
function start(){if(!ready())throw Error('C64 todavía no está listo');if(!g_started)startContent()}
function unpause(){if(paused){debugger_play();paused=false;$('pause').textContent='⏸ Pause'}}
const check=setInterval(()=>{if(ready()){clearInterval(check);buttons.forEach(id=>$(id).disabled=false);message('C64 listo: clic para empezar')}},150);
setTimeout(()=>{if(!ready())message('Error al cargar C64. Abrí la consola y usá servidor HTTP.',true)},12000);
$('start').onclick=()=>{try{start();unpause();message('C64 ejecutándose')}catch(e){message(e.message,true)}};
$('reset').onclick=()=>{try{start();unpause();c64_reset();message('Reset realizado')}catch(e){message(e.message,true)}};
$('pause').onclick=()=>{try{start();if(paused){debugger_play();paused=false}else{debugger_pause();paused=true}
$('pause').textContent=paused?'▶ Resume':'⏸ Pause';message(paused?'C64 pausado':'C64 reanudado')}
catch(e){message(e.message,true)}};
$('fullscreen').onclick=()=>{try{start();fullscreen()}catch(e){message(e.message,true)}};
$('file').onchange=async()=>{const f=$('file').files[0];if(!f)return;
try{start();unpause();const data=new Uint8Array(await f.arrayBuffer()),name=f.name.toLowerCase();
if(name.endsWith('.prg')){c64_reset();c64_loadPRG(data,data.length,1);c64.insertText('run\n')}
else if(name.endsWith('.d64')){c64_reset();c64_insertDisk(data,data.length);setTimeout(()=>c64.insertText('load "*",8,1\nrun\n'),1000)}
else if(name.endsWith('.crt')){c64_loadCRT(data,data.length);c64_reset()}
else throw Error('Formato no soportado');message('Archivo cargado: '+f.name)}
catch(e){message('Error: '+e.message,true)}finally{$('file').value=''}};
window.addEventListener('error',e=>message('Runtime: '+e.message,true));
})();