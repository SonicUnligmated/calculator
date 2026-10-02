/* Colorizer / theme engine
 * Drives --accent-* CSS variables + light-mode + presets.
 * Consumed by calculator visuals (wallpaper wave, overlays, buttons).
 */
(function (global) {
  'use strict';

  const THEME_STORAGE_KEY = 'atc_theme_color_v1';

  // refreshThemeSVGs is defined in particles.js; provide no-op fallback + local binding (strict mode)
  if (typeof global.refreshThemeSVGs !== 'function') {
    global.refreshThemeSVGs = function () {};
  }
  var refreshThemeSVGs = function () { return global.refreshThemeSVGs.apply(null, arguments); };
  if (typeof global.cosmicOrbs === 'undefined') global.cosmicOrbs = [];
  if (typeof global.globalBlobs === 'undefined') global.globalBlobs = null;
  var cosmicOrbs = global.cosmicOrbs;
  var globalBlobs = global.globalBlobs;

  var extraGlowEnabled = false;
  function applyExtraGlow() {
    document.body.classList.toggle('extra-glow-active', extraGlowEnabled);
  }
  function toggleExtraGlow() {
    var el = document.getElementById('extra-glow-toggle');
    extraGlowEnabled = el ? el.checked : false;
    localStorage.setItem('atc_extra_glow', extraGlowEnabled ? '1' : '0');
    applyExtraGlow();
  }
  global.toggleExtraGlow = toggleExtraGlow;

  function openSettingsPanel(panelName) {
    document.querySelectorAll('.settings-panel').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.settings-nav-btn').forEach(function (b) { b.classList.remove('active'); });
    var panel = document.getElementById('settings-panel-' + panelName);
    if (panel) panel.classList.add('active');
    var btn = document.querySelector('.settings-nav-btn[data-panel="' + panelName + '"]');
    if (btn) btn.classList.add('active');
  }
  global.openSettingsPanel = openSettingsPanel;

  function openSettingsModal() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    var modal = document.getElementById('settings-modal');
    if (modal) {
      modal.style.display = 'flex';
      openSettingsPanel('general');
    }
  }
  global.openSettingsModal = openSettingsModal;

  function closeSettingsModal() {
    var hexInput = document.getElementById('accent-hex-input');
    if (hexInput && hexInput.value) {
      var _skipSave = _activePresetType === 'custom' && _customPresets[_activeCustomIdx] && _customPresets[_activeCustomIdx].locked;
      if (!_skipSave) {
        try { localStorage.setItem(THEME_STORAGE_KEY, hexInput.value); } catch (e) { console.warn('Could not save theme preference:', e); }
      }
    }
    var modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
  }
  global.closeSettingsModal = closeSettingsModal;

  function applyThemeLocks() {
    var locked = _activePresetType === 'custom' && _customPresets[_activeCustomIdx] && !!_customPresets[_activeCustomIdx].locked;
    ['theme-lock-colorPicker', 'theme-lock-colorStrength'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('theme-locked', locked);
      if (locked) el.setAttribute('data-lock-hint', 'Preset locked. Click 🔒 to unlock.');
      else el.removeAttribute('data-lock-hint');
    });
  }
  global.applyThemeLocks = applyThemeLocks;

  function loadAppSettings() {
    // Prefixes / quiz settings omitted in standalone package
    applyThemeLocks();
  }

var _customPresets=[];var _activePresetType=null;var _activeCustomIdx=-1;var CUSTOM_PRESETS_KEY='atc_custom_presets';var ACTIVE_PRESET_KEY='atc_active_preset';
function loadCustomPresets(){try{var d=JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY));if(Array.isArray(d))_customPresets=d.slice(0,3);}catch(e){}_customPresets=_customPresets.map(function(p){return{hex:p.hex||'#00bbcc',strength:p.strength!=null?p.strength:62,locked:!!p.locked};});try{var a=JSON.parse(localStorage.getItem(ACTIVE_PRESET_KEY));if(a){_activePresetType=a.type;_activeCustomIdx=a.type==='custom'?a.index:-1;}}catch(e){}}
function saveCustomPresets(){try{localStorage.setItem(CUSTOM_PRESETS_KEY,JSON.stringify(_customPresets));}catch(e){}}
function saveActivePreset(){try{if(_activePresetType)localStorage.setItem(ACTIVE_PRESET_KEY,JSON.stringify({type:_activePresetType,index:_activeCustomIdx}));else localStorage.removeItem(ACTIVE_PRESET_KEY);}catch(e){}}
function renderCustomPresets(){var area=document.getElementById('custom-presets-area');if(!area)return;var html='';_customPresets.forEach(function(p,i){var isActive=_activePresetType==='custom'&&_activeCustomIdx===i;var lockCls=p.locked?' locked':'';html+='<div class="custom-preset-wrap"><button class="preset-swatch'+(isActive?' active-preset':'')+'" data-custom-idx="'+i+'" style="background:'+p.hex+';" title="Custom '+(i+1)+' ('+p.hex+')" onclick="selectCustomPreset('+i+')"></button><button class="custom-preset-lock'+lockCls+'" onclick="event.stopPropagation();toggleCustomLock('+i+')" title="'+(p.locked?'Unlock':'Lock')+'">'+(p.locked?'🔒':'🔓')+'</button><button class="custom-preset-del" onclick="event.stopPropagation();removeCustomPreset('+i+')" title="Remove">×</button></div>';});if(_customPresets.length>0&&_customPresets.length<3)html+='<button class="custom-add-btn" onclick="addCustomPreset()" title="Add custom preset">+</button>';area.innerHTML=html;}
function selectCustomPreset(idx){var p=_customPresets[idx];if(!p)return;_activePresetType='custom';_activeCustomIdx=idx;var picker=document.getElementById('accent-color-picker');var hexInput=document.getElementById('accent-hex-input');var slider=document.getElementById('accent-strength-slider');var disp=document.getElementById('strength-value-display');if(picker)picker.value=p.hex;if(hexInput)hexInput.value=p.hex.toUpperCase();if(slider)slider.value=p.strength;if(disp)disp.textContent=p.strength;changeAccentColor(p.hex,p.strength);localStorage.setItem(THEME_STORAGE_KEY,p.hex);localStorage.setItem('atc_accent_strength',String(p.strength));saveActivePreset();syncAllPresetHighlights();}
function addCustomPreset(){if(_customPresets.length>=3)return;var picker=document.getElementById('accent-color-picker');var slider=document.getElementById('accent-strength-slider');var hex=picker?picker.value:'#000000';var str=slider?parseInt(slider.value):90;_customPresets.push({hex:hex.toLowerCase(),strength:str,locked:false});_activePresetType='custom';_activeCustomIdx=_customPresets.length-1;saveCustomPresets();saveActivePreset();renderCustomPresets();}
function toggleCustomLock(idx){if(!_customPresets[idx])return;_customPresets[idx].locked=!_customPresets[idx].locked;saveCustomPresets();renderCustomPresets();}
function removeCustomPreset(idx){_customPresets.splice(idx,1);saveCustomPresets();if(_activePresetType==='custom'){if(_activeCustomIdx===idx){_activePresetType=null;_activeCustomIdx=-1;}else if(_activeCustomIdx>idx)_activeCustomIdx--;}saveActivePreset();renderCustomPresets();}
function syncAllPresetHighlights(){document.querySelectorAll('.preset-swatches .preset-swatch').forEach(function(sw){sw.classList.remove('active-preset');if(_activePresetType==='standard'){var picker=document.getElementById('accent-color-picker');var slider=document.getElementById('accent-strength-slider');
if(picker&&sw.dataset.hex===picker.value.toLowerCase()&&slider&&getStandardPresetMatch(picker.value.toLowerCase(),parseInt(slider.value)))sw.classList.add('active-preset');
}});renderCustomPresets();}
function getStandardPresetMatch(hex,strength){var map={'#00bbcc':62,'#8833ff':32,'#000000':90,'#ff8800':62,'#ff0000':32};return map[hex.toLowerCase()]===strength;}function handleColorChange(){var picker=document.getElementById('accent-color-picker');var slider=document.getElementById('accent-strength-slider');var hex=picker?picker.value.toLowerCase():'#000000';var str=slider?parseInt(slider.value):90;if(getStandardPresetMatch(hex,str)){_activePresetType='standard';_activeCustomIdx=-1;saveActivePreset();localStorage.setItem(THEME_STORAGE_KEY,hex);localStorage.setItem('atc_accent_strength',String(str));syncAllPresetHighlights();return;}if(_activePresetType==='custom'&&_customPresets[_activeCustomIdx]){var cp=_customPresets[_activeCustomIdx];if(!cp.locked){cp.hex=hex;cp.strength=str;saveCustomPresets();localStorage.setItem(THEME_STORAGE_KEY,hex);localStorage.setItem('atc_accent_strength',String(str));}}_activePresetType=_activePresetType==='custom'?'custom':null;if(_activePresetType!=='custom'&&_customPresets.length===0){_customPresets.push({hex:hex,strength:str,locked:false});_activePresetType='custom';_activeCustomIdx=0;saveCustomPresets();localStorage.setItem(THEME_STORAGE_KEY,hex);localStorage.setItem('atc_accent_strength',String(str));}else if(_activePresetType!=='custom'){localStorage.setItem(THEME_STORAGE_KEY,hex);localStorage.setItem('atc_accent_strength',String(str));}saveActivePreset();syncAllPresetHighlights();}
function applyPreset(hexColor, isLight, presetStrength) {
const PRESET_STRENGTH = presetStrength !== undefined ? presetStrength : 62;
const picker = document.getElementById('accent-color-picker');
const hexInput = document.getElementById('accent-hex-input');
const strengthSlider = document.getElementById('accent-strength-slider');
const strengthDisplay = document.getElementById('strength-value-display');
const lightToggle = document.getElementById('light-mode-toggle');
if (picker) picker.value = hexColor;
if (hexInput) hexInput.value = hexColor.toUpperCase();
if (strengthSlider) strengthSlider.value = PRESET_STRENGTH;
if (strengthDisplay) strengthDisplay.textContent = PRESET_STRENGTH;
if (lightToggle) lightToggle.checked = isLight;
document.documentElement.classList.toggle('light-mode', isLight);
localStorage.setItem('atc_light_mode', isLight ? '1' : '0');
changeAccentColor(hexColor, PRESET_STRENGTH);
try {
localStorage.setItem(THEME_STORAGE_KEY, hexColor);
localStorage.setItem('atc_accent_strength', String(PRESET_STRENGTH));
} catch(e) {}
_activePresetType='standard';_activeCustomIdx=-1;saveActivePreset();syncAllPresetHighlights();
}

global.applyPreset = applyPreset;
global.selectCustomPreset = selectCustomPreset;
global.addCustomPreset = addCustomPreset;
global.toggleCustomLock = toggleCustomLock;
global.removeCustomPreset = removeCustomPreset;

const lightnessLevels = [90, 82, 74, 65, 55, 42, 80, 62, 87, 48];
function hexToHsl(hex) {
let r = parseInt(hex.slice(1,3),16)/255;
let g = parseInt(hex.slice(3,5),16)/255;
let b = parseInt(hex.slice(5,7),16)/255;
const max = Math.max(r,g,b), min = Math.min(r,g,b);
let h, s, l = (max + min)/2;
if (max === min) h = s = 0;
else {
const d = max - min;
s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
switch(max){
case r: h = (g-b)/d + (g<b?6:0); break;
case g: h = (b-r)/d + 2; break;
case b: h = (r-g)/d + 4; break;
}
h /= 6;
}
return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function hslToHex(h, s, l) {
h /= 360; s /= 100; l /= 100;
let r, g, b;
if (s === 0) r = g = b = l;
else {
const hue2rgb = (p,q,t) => {
if(t<0) t+=1; if(t>1) t-=1;
if(t<1/6) return p + (q-p)*6*t;
if(t<1/2) return q;
if(t<2/3) return p + (q-p)*(2/3-t)*6;
return p;
};
const q = l<0.5 ? l*(1+s) : l + s - l*s;
const p = 2*l - q;
r = hue2rgb(p,q,h+1/3);
g = hue2rgb(p,q,h);
b = hue2rgb(p,q,h-1/3);
}
const toHex = x => Math.round(x*255).toString(16).padStart(2,'0');
return '#' + toHex(r) + toHex(g) + toHex(b);
}
function changeAccentColor(newHex, strength = 100) {
if (!newHex || newHex[0] !== '#' || newHex.length !== 7) return;
let [hue, baseSat, baseLight] = hexToHsl(newHex);
const factor = strength / 100;
for (let i = 0; i < 10; i++) {
let targetLight = lightnessLevels[i];
let finalLight = baseLight + (targetLight - baseLight) * factor;
const newColor = hslToHex(hue, baseSat, finalLight);
document.documentElement.style.setProperty(`--accent-${i}`, newColor);
const nr = parseInt(newColor.slice(1,3),16);
const ng = parseInt(newColor.slice(3,5),16);
const nb = parseInt(newColor.slice(5,7),16);
document.documentElement.style.setProperty(`--accent-${i}-rgb`, `${nr}, ${ng}, ${nb}`);
}
const tintSat = Math.min(100, baseSat * 1.2);
const tintLight = 50;
const tintHex = hslToHex(hue, tintSat, tintLight);
const r = parseInt(tintHex.slice(1,3), 16);
const g = parseInt(tintHex.slice(3,5), 16);
const b = parseInt(tintHex.slice(5,7), 16);
const isLightMode = document.documentElement.classList.contains('light-mode');
document.documentElement.style.setProperty('--bg-tint-color',isLightMode ? 'rgba(0,0,0,0)' : `rgba(${r}, ${g}, ${b}, 0.05)`);
document.documentElement.style.setProperty('--bg-tint-color-high', isLightMode ? 'rgba(0,0,0,0)' : `rgba(${r}, ${g}, ${b}, 0.08)`);
const deepColor = hslToHex(hue, Math.min(100, baseSat * 1.1), 28);
const dr = parseInt(deepColor.slice(1,3),16);
const dg = parseInt(deepColor.slice(3,5),16);
const db = parseInt(deepColor.slice(5,7),16);
document.documentElement.style.setProperty('--accent-deep', deepColor);
document.documentElement.style.setProperty('--accent-deep-rgb', `${dr}, ${dg}, ${db}`);
refreshThemeSVGs();
if (typeof globalBlobs !== 'undefined' && globalBlobs) {
globalBlobs.forEach(blob => {
blob.colorStops = [ `rgba(var(--accent-0-rgb), 0.32)`, `rgba(var(--accent-2-rgb), 0.08)`, `rgba(var(--accent-4-rgb), 0)`
];
});
}
if (typeof cosmicOrbs !== 'undefined' && cosmicOrbs.length > 0) {
const rs = getComputedStyle(document.documentElement);
const a0 = rs.getPropertyValue('--accent-0-rgb').trim();
const a2 = rs.getPropertyValue('--accent-2-rgb').trim();
cosmicOrbs.forEach(orb => {
orb.el.style.background = `radial-gradient(circle, rgba(${a0}, 0.5) 0%, rgba(${a2}, 0.15) 60%, transparent 100%)`;
orb.el.style.boxShadow = `0 0 ${orb.size/2}px rgba(${a0}, 0.3)`;
});
}
}

global.changeAccentColor = changeAccentColor;
global.hexToHsl = hexToHsl;
global.hslToHex = hslToHex;

function resetThemeToDefaults() {
if (!confirm('Reset all theme settings to default?')) return;
localStorage.removeItem(THEME_STORAGE_KEY);
localStorage.removeItem('atc_accent_strength');
localStorage.removeItem(CUSTOM_PRESETS_KEY);
localStorage.removeItem(ACTIVE_PRESET_KEY);
_customPresets=[];_activePresetType=null;_activeCustomIdx=-1;
const picker = document.getElementById('accent-color-picker');
const hexInput = document.getElementById('accent-hex-input');
const strengthSlider = document.getElementById('accent-strength-slider');
const strengthDisplay = document.getElementById('strength-value-display');
if (picker) picker.value = '#000000';
if (hexInput) hexInput.value = '#000000';
if (strengthSlider) strengthSlider.value = 90;
if (strengthDisplay) strengthDisplay.textContent = 90;
changeAccentColor('#000000', 90);
refreshThemeSVGs();
syncAllPresetHighlights();renderCustomPresets();
}

global.resetThemeToDefaults = resetThemeToDefaults;


(function initThemeSystem() {
const picker = document.getElementById('accent-color-picker');
const hexInput = document.getElementById('accent-hex-input');
const settingsBtn = document.getElementById('settings-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const settingsModal = document.getElementById('settings-modal');
if (settingsBtn) {
settingsBtn.addEventListener('click', function(e) {
e.stopPropagation();
openSettingsModal();
});
}
if (settingsCloseBtn) {
settingsCloseBtn.addEventListener('click', function(e) {
e.stopPropagation();
closeSettingsModal();
});
}
if (settingsModal) {
settingsModal.addEventListener('click', function(e) {
if (e.target === settingsModal) closeSettingsModal();
});
}
const strengthSlider = document.getElementById('accent-strength-slider');
function updateThemeFromInputs() {
const hex = picker ? picker.value : '#ff8800';
const strength = strengthSlider ? parseInt(strengthSlider.value) : 100;
const displayEl = document.getElementById('strength-value-display');
if (displayEl) displayEl.textContent = strength;
changeAccentColor(hex, strength);
handleColorChange();
}
if (picker) {
picker.addEventListener('input', function() {
if (hexInput) hexInput.value = picker.value.toUpperCase();
updateThemeFromInputs();
});
}
if (hexInput) {
hexInput.addEventListener('change', function() {
var v = hexInput.value.trim();
if (v[0] !== '#') v = '#' + v;
if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
if (picker) picker.value = v;
updateThemeFromInputs();
}
});
}
if (strengthSlider) {
strengthSlider.addEventListener('input', updateThemeFromInputs);
}
const lightToggle = document.getElementById('light-mode-toggle');
if (lightToggle) {
lightToggle.addEventListener('change', function() {
document.documentElement.classList.toggle('light-mode', this.checked);
localStorage.setItem('atc_light_mode', this.checked ? '1' : '0');
const hex = picker ? picker.value : '#000000';
const str = strengthSlider ? parseInt(strengthSlider.value) : 90;
changeAccentColor(hex, str);
});
}
let initialColor = '#000000';
let initialStrength = 90;
try {
const savedColor = localStorage.getItem(THEME_STORAGE_KEY);
if (savedColor && savedColor[0] === '#' && savedColor.length === 7) {
initialColor = savedColor;
}
const savedMode = localStorage.getItem('atc_light_mode');
if (savedMode === '1') {
document.documentElement.classList.add('light-mode');
if(lightToggle) lightToggle.checked = true;
}
const savedStrength = localStorage.getItem('atc_accent_strength');
if(savedStrength) initialStrength = parseInt(savedStrength);
} catch (e) { console.warn("Could not load saved theme:", e); }
if (picker) picker.value = initialColor;
if (hexInput) hexInput.value = initialColor.toUpperCase();
if (strengthSlider) strengthSlider.value = initialStrength;
const displayEl = document.getElementById('strength-value-display');
if (displayEl) displayEl.textContent = initialStrength;
loadCustomPresets();
if(_activePresetType==='custom'&&_customPresets[_activeCustomIdx]){var cp=_customPresets[_activeCustomIdx];initialColor=cp.hex;initialStrength=cp.strength;if(picker)picker.value=initialColor;if(hexInput)hexInput.value=initialColor.toUpperCase();if(strengthSlider)strengthSlider.value=initialStrength;var de=document.getElementById('strength-value-display');if(de)de.textContent=initialStrength;}
changeAccentColor(initialColor, initialStrength);
syncAllPresetHighlights();
renderCustomPresets();
if(strengthSlider) {
strengthSlider.addEventListener('change', function() {
localStorage.setItem('atc_accent_strength', strengthSlider.value);
});
}
loadAppSettings();
applyThemeLocks();
applyExtraGlow();
document.body.style.opacity = "1";
})();

})(typeof window !== 'undefined' ? window : globalThis);
