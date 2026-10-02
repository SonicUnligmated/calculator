/* Particle field + calculator theme-overlay canvases (canvas transparency / mix-blend-mode:screen)
   Formula-text spawning needs ALL_FORMULA_TYPES + QUESTION_GENERATORS;
   demo provides lightweight stubs so orbit particles + calc overlays still run. */
(function (global) {
  'use strict';
  if (typeof global.ALL_FORMULA_TYPES === 'undefined') {
    global.ALL_FORMULA_TYPES = ['demo'];
  }
  if (typeof global.QUESTION_GENERATORS === 'undefined') {
    global.QUESTION_GENERATORS = {
      demo: function () {
        var a = Math.floor(Math.random() * 90) + 10;
        var b = Math.floor(Math.random() * 9) + 2;
        var c = a * b;
        return { q: a + ' × ' + b + ' = ?', ans: 0, opts: [String(c), String(c + 1), String(c - 1), String(c + 10)] };
      }
    };
  }
  if (typeof global.globalBlobs === 'undefined') {
    global.globalBlobs = null; // optional; referenced by theme/cosmic roam but unused for calc overlays
  }

document.body.style.background = "#0d0d0d";
function buildGridSVG(isLight){const c=isLight?'rgba(0,0,0,0.04)':'rgba(255,255,255,0.04)';return `<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><path d='M0 0 L60 0 M0 0 L0 60' stroke='${c}' stroke-width='0.5' fill='none'/></svg>`;}
let encodedGrid = '';
function refreshThemeSVGs(){const rs=getComputedStyle(document.documentElement);const isLight=document.documentElement.classList.contains('light-mode');encodedGrid=encodeURIComponent(buildGridSVG(isLight).replace(/\s+/g,' '));const bgDiv=document.getElementById('el-arquitecto-bg-layer');if(bgDiv)bgDiv.style.backgroundImage=`url("data:image/svg+xml;charset=utf-8,${encodedGrid}")`;}
const styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
styleSheet.textContent = `#el-arquitecto-bg-layer{content:'';position:fixed;top:0;left:0;width:100%;height:100%;z-index:-3;pointer-events:none;background-size:60px 60px;opacity:0.4;mix-blend-mode:multiply}#el-arquitecto-particle-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;mix-blend-mode:screen}`;
let canvas = document.createElement("canvas");
canvas.id = "el-arquitecto-particle-canvas";
canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;mix-blend-mode:screen;";
document.body.appendChild(canvas);
const bgDiv = document.createElement('div'); bgDiv.id = 'el-arquitecto-bg-layer'; document.body.appendChild(bgDiv);
let ctx = null;
let particles = [];
let activeFormulas = [];
let nextSpawnTime = 0;
let globalCooldownEnd = 0;
const MAX_FORMULAS = 9;
function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
activeFormulas.forEach(function(f){f.qParticles.forEach(function(p){p.formulaId=-1;p.locked=false;});f.aParticles.forEach(function(p){p.formulaId=-1;p.locked=false;});});
activeFormulas = [];
nextSpawnTime = 0;
globalCooldownEnd = 0;
particles.forEach(function(p){if(p.isOrbit)p.radius=Math.random()*(Math.min(window.innerWidth,window.innerHeight)/2);});
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
let program, positionLoc, sizeLoc, alphaLoc, resolutionLoc, colorLoc;
let positionBuffer, sizeBuffer, alphaBuffer, colorBuffer, sparkleBuffer;
let colorIndexLoc, sparkleSpeedLoc, timeLoc;
const startTime = Date.now();
let lastFrameTime = performance.now();
if (gl) {
const vsSource = `attribute vec2 a_position;attribute float a_size;attribute float a_alpha;attribute float a_colorIndex;attribute float a_sparkleSpeed;uniform vec2 u_resolution;uniform float u_time;varying float v_alpha;varying float v_colorIndex;varying float v_sparkleSpeed;void main(){vec2 zeroToOne=a_position/u_resolution;vec2 zeroToTwo=zeroToOne*2.0;vec2 clipSpace=zeroToTwo-1.0;gl_Position=vec4(clipSpace*vec2(1,-1),0,1);gl_PointSize=a_size*2.0;v_alpha=a_alpha;v_colorIndex=a_colorIndex;v_sparkleSpeed=a_sparkleSpeed;}`;
const fsSource = `precision mediump float;varying float v_alpha;varying float v_colorIndex;varying float v_sparkleSpeed;uniform vec3 u_accentColor;uniform float u_time;void main(){vec2 coord=gl_PointCoord-vec2(0.5);float dist=length(coord);if(dist>0.5)discard;float glow=1.0-(dist*2.0);glow=pow(glow,2.5);vec3 color=u_accentColor;if(v_colorIndex>0.5&&v_colorIndex<1.5)color=vec3(1.0,1.0,1.0);else if(v_colorIndex>1.5&&v_colorIndex<2.5)color=vec3(1.0,0.85,0.85);else if(v_colorIndex>2.5&&v_colorIndex<3.5)color=vec3(1.0,1.0,0.8);else if(v_colorIndex>3.5)color=vec3(0.3,1.0,0.5);float sparkle=1.0;if(v_colorIndex>0.5)sparkle=0.6+0.4*sin(u_time*v_sparkleSpeed);float finalAlpha=v_alpha*glow*sparkle;gl_FragColor=vec4(color,finalAlpha);}`;
function createShader(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);return shader;}
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
positionLoc = gl.getAttribLocation(program, "a_position");
sizeLoc = gl.getAttribLocation(program, "a_size");
alphaLoc = gl.getAttribLocation(program, "a_alpha");
colorIndexLoc = gl.getAttribLocation(program, "a_colorIndex");
sparkleSpeedLoc = gl.getAttribLocation(program, "a_sparkleSpeed");
resolutionLoc = gl.getUniformLocation(program, "u_resolution");
colorLoc = gl.getUniformLocation(program, "u_accentColor");
timeLoc = gl.getUniformLocation(program, "u_time");
positionBuffer = gl.createBuffer();
sizeBuffer = gl.createBuffer();
alphaBuffer = gl.createBuffer();
colorBuffer = gl.createBuffer();
sparkleBuffer = gl.createBuffer();
function stripHtml(text){const d=document.createElement('div');d.innerHTML=String(text);return d.textContent||'';}
function textToTargets(text,cx,cy,fontSize,maxWidth){const off=document.createElement('canvas');const octx=off.getContext('2d',{willReadFrequently:true});const font="bold "+fontSize+"px 'Courier New',monospace";octx.font=font;const words=text.split(' ');const lines=[];let currentLine=words[0]||'';for(let i=1;i<words.length;i++){const testLine=currentLine+' '+words[i];if(octx.measureText(testLine).width<(maxWidth||400)){currentLine=testLine;}else{lines.push(currentLine);currentLine=words[i];}}lines.push(currentLine);const w=Math.ceil(Math.max(...lines.map(l=>octx.measureText(l).width))+20);const lineHeight=Math.ceil(fontSize*1.2);const h=Math.ceil(lineHeight*lines.length+10);off.width=w;off.height=h;octx.font=font;octx.fillStyle='#fff';octx.textBaseline='middle';lines.forEach((line,i)=>{octx.fillText(line,10,(i*lineHeight)+lineHeight/2+5);});const data=octx.getImageData(0,0,w,h).data;const targets=[];const step=2;for(let y=0;y<h;y+=step){for(let x=0;x<w;x+=step){const idx=(y*w+x)*4;if(data[idx+3]>128){targets.push({x:cx-w/2+x,y:cy-h/2+y});}}}if(targets.length>5000){const ratio=targets.length/5000;const sub=[];for(let i=0;i<5000;i++){sub.push(targets[Math.floor(i*ratio)]);}return sub;}return targets;}
function generateFormulaTexts(activeTexts){const types=ALL_FORMULA_TYPES;if(!types||!types.length)return null;let qText='',ansText='',type='';for(let attempt=0;attempt<30;attempt++){const t=types[Math.floor(Math.random()*types.length)];const gen=QUESTION_GENERATORS[t];if(!gen)continue;let qData;try{qData=gen();}catch(e){continue;}if(!qData)continue;let t_qText=stripHtml(qData.q).replace(/\s+/g,' ').trim();if(/[a-zA-Z]/.test(t_qText))continue;if(activeTexts&&activeTexts.includes(t_qText))continue;qText=t_qText;type=t;if(typeof qData.ans==='number'&&Number.isInteger(qData.ans)&&qData.ans>=0&&qData.ans<qData.opts.length){ansText=String(qData.opts[qData.ans]);}else{ansText=String(qData.opts[0]!==undefined?qData.opts[0]:qData.ans);}ansText=stripHtml(ansText).replace(/\s+/g,' ').trim();break;}if(!qText)return null;if(qText.length>45)qText=qText.substring(0,45);if(ansText.length>20)ansText=ansText.substring(0,20);return{qText,ansText,type};}
function findFreePosition(){const margin=130;for(let attempt=0;attempt<20;attempt++){const cx=margin+Math.random()*Math.max(100,window.innerWidth-margin*2);const cy=margin+60+Math.random()*Math.max(100,window.innerHeight-margin*2-120);let ok=true;for(const f of activeFormulas){const dx=cx-f.cx;const dy=cy-f.cy;if(Math.sqrt(dx*dx+dy*dy)<350){ok=false;break;}}if(ok)return{cx,cy};}return{cx:margin+Math.random()*Math.max(100,window.innerWidth-margin*2),cy:margin+60+Math.random()*Math.max(100,window.innerHeight-margin*2-120)};}
function spawnFormula(){if(activeFormulas.length>=MAX_FORMULAS)return;const activeTexts=activeFormulas.map(function(f){return f.qText;});const data=generateFormulaTexts(activeTexts);if(!data)return;const pos=findFreePosition();const fontSize=28;const qTargets=textToTargets(data.qText,pos.cx,pos.cy,fontSize,450);const aTargets=textToTargets(data.ansText,pos.cx,pos.cy+fontSize*2.5,fontSize,200);const freeParticles=particles.filter(function(p){return p.formulaId<0&&!p.isOrbit;});const qAssign=[];for(let i=0;i<qTargets.length&&i<freeParticles.length;i++){const p=freeParticles[i];p.formulaId=activeFormulas.length;p.targetX=qTargets[i].x;p.targetY=qTargets[i].y;p.isAnswer=false;p.colorIndex=0;if(Math.random()<0.15)p.colorIndex=1;p.locked=false;p.speed=0.004+Math.random()*0.006;p.size=Math.random()*1.0+0.5;qAssign.push(p);}const now=performance.now();const isCh2=data.type&&data.type.startsWith('ch2_');const answerDelay=isCh2?5000+Math.random()*7000:2000+Math.random()*2000;activeFormulas.push({id:activeFormulas.length,qText:data.qText,ansText:data.ansText,cx:pos.cx,cy:pos.cy,qParticles:qAssign,aParticles:[],aTargets:aTargets,spawnTime:now,answerDelay:answerDelay,showDuration:26000+Math.random()*4000,answerFormed:false});}
function assignAnswerParticles(formula){const freeParticles=particles.filter(function(p){return p.formulaId<0&&!p.isOrbit;});const targets=formula.aTargets;for(let i=0;i<targets.length&&i<freeParticles.length;i++){const p=freeParticles[i];p.formulaId=formula.id;p.targetX=targets[i].x;p.targetY=targets[i].y;p.isAnswer=true;const r=Math.random();if(r<0.7)p.colorIndex=4;else p.colorIndex=0;p.locked=false;p.speed=0.004+Math.random()*0.006;p.size=Math.random()*1.0+0.5;formula.aParticles.push(p);}formula.answerFormed=true;}
function initParticles(){particles=[];const count=1500;const vmin=Math.min(window.innerWidth,window.innerHeight);for(let i=0;i<count;i++){const isOrbit=i<300;const sz=Math.random()*3.0+2.0;particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,size:sz,baseSize:sz,alpha:0,colorIndex:0,sparkleSpeed:2.0+Math.random()*6.0,formulaId:-1,targetX:0,targetY:0,isAnswer:false,locked:false,speed:0.005,isOrbit:isOrbit,angle:Math.random()*Math.PI*2,radius:Math.random()*(vmin/2),orbitSpeed:Math.random()*0.001+0.0005});}}initParticles();
window.spawnTestFormula=function(qText,ansText){if(activeFormulas.length>=MAX_FORMULAS){console.log("Max formulas reached.");return;}const pos=findFreePosition();const fontSize=28;const qTargets=textToTargets(qText,pos.cx,pos.cy,fontSize,450);const aTargets=textToTargets(ansText,pos.cx,pos.cy+fontSize*2.5,fontSize,200);const freeParticles=particles.filter(function(p){return p.formulaId<0&&!p.isOrbit;});const qAssign=[];for(let i=0;i<qTargets.length&&i<freeParticles.length;i++){const p=freeParticles[i];p.formulaId=activeFormulas.length;p.targetX=qTargets[i].x;p.targetY=qTargets[i].y;p.isAnswer=false;p.colorIndex=0;if(Math.random()<0.15)p.colorIndex=1;p.locked=false;p.speed=0.004+Math.random()*0.006;p.size=Math.random()*1.0+0.5;qAssign.push(p);}const now=performance.now();activeFormulas.push({id:activeFormulas.length,qText:qText,ansText:ansText,cx:pos.cx,cy:pos.cy,qParticles:qAssign,aParticles:[],aTargets:aTargets,spawnTime:now,answerDelay:2000,showDuration:Infinity,answerFormed:false});console.log("Spawned test formula:",qText,ansText);};
}
function renderParticles() {
const now = performance.now();
const deltaTime = now - lastFrameTime;
lastFrameTime = now;
const timeScale = Math.min(deltaTime / 16.66, 4.0);
if (now >= nextSpawnTime && activeFormulas.length < MAX_FORMULAS && now >= globalCooldownEnd) {
spawnFormula();
nextSpawnTime = now + 1000 + Math.random() * 2000;
if (Math.random() < 0.18) {
globalCooldownEnd = now + 3000 + Math.random() * 4000;
}
}
for (let i = activeFormulas.length - 1; i >= 0; i--) {
const f = activeFormulas[i];
const age = now - f.spawnTime;
if (!f.answerFormed && age >= f.answerDelay) {
assignAnswerParticles(f);
}
if (age >= f.answerDelay + f.showDuration) {
f.qParticles.forEach(function(p){p.formulaId=-1;p.locked=false;p.colorIndex=0;p.vx=(Math.random()-0.5)*0.5;p.vy=(Math.random()-0.5)*0.5;p.size=p.baseSize;});
f.aParticles.forEach(function(p){p.formulaId=-1;p.locked=false;p.colorIndex=0;p.vx=(Math.random()-0.5)*0.5;p.vy=(Math.random()-0.5)*0.5;p.size=p.baseSize;});
activeFormulas.splice(i, 1);
}
}
const rootStyle = getComputedStyle(document.documentElement);
const accent0 = rootStyle.getPropertyValue('--accent-0-rgb').trim();
const [r,g,b] = accent0.split(',').map(n=>parseFloat(n)/255);
const positions = new Float32Array(particles.length * 2);
const sizes = new Float32Array(particles.length);
const alphas = new Float32Array(particles.length);
particles.forEach((p, i) => {
let currentAlpha = 0;
if (p.formulaId >= 0) {
const dx = p.targetX - p.x;
const dy = p.targetY - p.y;
const distance = Math.sqrt(dx*dx + dy*dy);
if (distance <= 3) {
p.x = p.targetX + (Math.random() - 0.5) * 3;
p.y = p.targetY + (Math.random() - 0.5) * 3;
} else {
let gravityFactor = 1;
if (distance < 150) gravityFactor = 2;
if (distance < 80) gravityFactor = 8;
let randomFlux = 0.2 + Math.random() * 1.6;
p.x += dx * p.speed * gravityFactor * randomFlux * timeScale;
p.y += dy * p.speed * gravityFactor * randomFlux * timeScale;
}
currentAlpha = 0.75 + Math.sin(now*0.005 + p.x)*0.2;
} else if (p.isOrbit) {
let randomFlux = 0.2 + Math.random() * 1.6;
p.angle += p.orbitSpeed * randomFlux * timeScale;
p.x = window.innerWidth/2 + Math.cos(p.angle) * p.radius;
p.y = window.innerHeight/2 + Math.sin(p.angle) * p.radius;
currentAlpha = 0.6 + Math.sin(now*0.005 + p.x)*0.15;
} else {
p.x += p.vx * timeScale;
p.y += p.vy * timeScale;
if (p.x < -10) p.x = canvas.width + 10;
if (p.x > canvas.width + 10) p.x = -10;
if (p.y < -10) p.y = canvas.height + 10;
if (p.y > canvas.height + 10) p.y = -10;
currentAlpha = 0.4 + Math.sin(now*0.002 + p.x*0.01)*0.15;
}
positions[i * 2] = p.x;
positions[i * 2 + 1] = p.y;
sizes[i] = p.size;
alphas[i] = currentAlpha;
p.alpha = currentAlpha;
});
if (gl) {
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
gl.useProgram(program);
gl.uniform3f(colorLoc, r, g, b);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(sizeLoc);
gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(alphaLoc);
gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);
const colorIndices = new Float32Array(particles.length);
const sparkleSpeeds = new Float32Array(particles.length);
particles.forEach((p, i) => { colorIndices[i] = p.colorIndex || 0; sparkleSpeeds[i] = p.sparkleSpeed || 2.0; });
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorIndices, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(colorIndexLoc);
gl.vertexAttribPointer(colorIndexLoc, 1, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, sparkleBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sparkleSpeeds, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(sparkleSpeedLoc);
gl.vertexAttribPointer(sparkleSpeedLoc, 1, gl.FLOAT, false, 0, 0);
gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);
gl.uniform1f(timeLoc, now * 0.001);
gl.drawArrays(gl.POINTS, 0, particles.length);
}
updateOverlayCanvases();
requestAnimationFrame(renderParticles);
}
function updateOverlayCanvases() {
const cw = document.getElementById('calculator-widget');
if (!cw || cw.style.display === 'none') return;
const overlays = cw.querySelectorAll('.calc-theme-overlay');
if (!overlays.length || !particles.length) return;
const rs = getComputedStyle(document.documentElement);
const rgb = rs.getPropertyValue('--accent-0-rgb').trim();
overlays.forEach(function(ov) {
const rect = ov.getBoundingClientRect();
const w = Math.round(rect.width), h = Math.round(rect.height);
if (!w || !h) return;
if (ov.width !== w) ov.width = w;
if (ov.height !== h) ov.height = h;
const ctx = ov.getContext('2d');
ctx.clearRect(0, 0, w, h);
particles.forEach(function(p) {
const lx = p.x - rect.left;
const ly = p.y - rect.top;
const r = p.size;
if (lx < -r || lx > w + r || ly < -r || ly > h + r) return;
const a = p.alpha || 0;
if (a <= 0) return;
const pRgb = (p.colorIndex === 4) ? '0,255,128' : rgb;
const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
grad.addColorStop(0, `rgba(${pRgb},${a})`);
grad.addColorStop(1, `rgba(${pRgb},0)`);
ctx.beginPath();
ctx.arc(lx, ly, r, 0, Math.PI * 2);
ctx.fillStyle = grad;
ctx.fill();
});
});
}
if (gl) { renderParticles(); }

  global.refreshThemeSVGs = refreshThemeSVGs;
  global.updateOverlayCanvases = updateOverlayCanvases;
})(typeof window !== 'undefined' ? window : globalThis);
