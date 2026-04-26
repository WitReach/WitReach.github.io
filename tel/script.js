// --- Default Settings ---
const DEFAULT_SETTINGS = {
  speed: 2.0,
  fontSize: 60,
  margin: 100, // percentage string mapping
  mirrorIndex: 1, // Default to Mirror Y
};

const DEFAULT_SCRIPT = `Hello how are you\n\nWelcome to your new teleprompter!\n\nYou can use your presenter remote (Up/Down/Space) to control the scrolling.\n\nThe controls are now neatly at the bottom with easy tap buttons. Every change you make, and every word you type, is automatically saved so you never lose your place!`;

const mirrorModes = ['mirror-none', 'mirror-y', 'mirror-x', 'mirror-both'];
const mirrorLabels = ['Normal', 'Mirror: Y', 'Mirror: X', 'Both'];

// --- State Variables ---
let state = {
  isPlaying: false,
  scrollDirection: 1, // 1 for forward (downwards in document), -1 for rewind (upwards in document)
  speed: DEFAULT_SETTINGS.speed,
  fontSize: DEFAULT_SETTINGS.fontSize,
  margin: DEFAULT_SETTINGS.margin,
  mirrorIndex: DEFAULT_SETTINGS.mirrorIndex,
  scriptText: DEFAULT_SCRIPT
};

// --- DOM Cache ---
let dom = {};

function cacheDom() {
  dom = {
    prompterContainer: document.getElementById('prompter-container'),
    prompterText: document.getElementById('prompter-text'),
    scriptTextarea: document.getElementById('script-textarea'),
    
    viewPrompter: document.getElementById('view-prompter'),
    viewEditor: document.getElementById('view-editor'),
    settingsHud: document.getElementById('settings-hud'),
    
    btnEdit: document.getElementById('btn-edit'),
    btnSave: document.getElementById('btn-save-script'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnMirror: document.getElementById('btn-mirror'),
    
    iconPlay: document.getElementById('icon-play'),
    iconPause: document.getElementById('icon-pause'),
    mirrorLabel: document.getElementById('mirror-label'),
    
    // Config buttons
    btnSpeedMinus: document.getElementById('btn-speed-minus'),
    btnSpeedPlus: document.getElementById('btn-speed-plus'),
    labelSpeed: document.getElementById('label-speed'),

    btnFontMinus: document.getElementById('btn-font-minus'),
    btnFontPlus: document.getElementById('btn-font-plus'),
    labelFont: document.getElementById('label-font'),

    btnMarginMinus: document.getElementById('btn-margin-minus'),
    btnMarginPlus: document.getElementById('btn-margin-plus'),
    labelMargin: document.getElementById('label-margin'),
  };
}

// --- Local Storage Management ---
function loadData() {
  const savedSettings = localStorage.getItem('teleprompter_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      state.speed = parsed.speed ?? DEFAULT_SETTINGS.speed;
      state.fontSize = parsed.fontSize ?? DEFAULT_SETTINGS.fontSize;
      state.margin = parsed.margin ?? DEFAULT_SETTINGS.margin;
      state.mirrorIndex = parsed.mirrorIndex ?? DEFAULT_SETTINGS.mirrorIndex;
    } catch(e) {
      console.error("Could not parse settings", e);
    }
  }

  const savedScript = localStorage.getItem('teleprompter_script');
  if (savedScript !== null) {
    state.scriptText = savedScript;
  }
}

function saveData(type = 'all') {
  if (type === 'all' || type === 'settings') {
    localStorage.setItem('teleprompter_settings', JSON.stringify({
      speed: state.speed,
      fontSize: state.fontSize,
      margin: state.margin,
      mirrorIndex: state.mirrorIndex
    }));
  }
  if (type === 'all' || type === 'script') {
    localStorage.setItem('teleprompter_script', state.scriptText);
  }
}

// --- Initialization ---
window.onload = init;

function init() {
  cacheDom();
  loadData();

  // Apply initial values
  dom.scriptTextarea.value = state.scriptText;
  renderText(state.scriptText);
  applySettings(true); // true = force scroll reset

  // Bind Events
  bindEvents();

  // Start Animation Loop
  requestAnimationFrame(scrollLoop);
  
  // HUD Auto-hider
  hudSleepTimer = setTimeout(sleepHud, 3000);
}

function bindEvents() {
  // Play / Pause
  dom.btnPlayPause.addEventListener('click', togglePlay);
  
  // Editor
  dom.btnEdit.addEventListener('click', openEditor);
  dom.btnSave.addEventListener('click', saveEditor);
  
  // Realtime script saving
  dom.scriptTextarea.addEventListener('input', (e) => {
    state.scriptText = e.target.value;
    saveData('script');
  });

  // Mirror toggle
  dom.btnMirror.addEventListener('click', cycleMirror);

  // Speed Controls
  dom.btnSpeedMinus.addEventListener('click', () => changeSpeed(-0.5));
  dom.btnSpeedPlus.addEventListener('click', () => changeSpeed(0.5));

  // Font Controls
  dom.btnFontMinus.addEventListener('click', () => changeFont(-4));
  dom.btnFontPlus.addEventListener('click', () => changeFont(4));

  // Margin Controls
  dom.btnMarginMinus.addEventListener('click', () => changeMargin(-5));
  dom.btnMarginPlus.addEventListener('click', () => changeMargin(5));

  // Global Keyboard
  window.addEventListener('keydown', handleKeydown);

  // Wake HUD on interactions
  window.addEventListener('mousemove', wakeHud);
  window.addEventListener('click', wakeHud);
  window.addEventListener('touchstart', wakeHud);
}

// --- Core Scrolling Logic ---
let lastTime = 0;
function scrollLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  if (state.isPlaying) {
    // 1 speed unit = 1 px per 16.6ms frame
    const scrollDelta = state.speed * (dt / 16.6) * state.scrollDirection;
    
    // Normal scroll logic combined with direction
    dom.prompterContainer.scrollTop += scrollDelta;
  }
  
  requestAnimationFrame(scrollLoop);
}

// --- HUD Auto-Hide ---
let hudSleepTimer = null;
function wakeHud() {
  // If editor is open, keep hidden
  if (!dom.viewEditor.classList.contains('hidden')) return;

  dom.settingsHud.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  dom.settingsHud.classList.add('opacity-100', 'translate-y-0');
  
  if (hudSleepTimer) clearTimeout(hudSleepTimer);
  
  // Sleep after 2.5s if playing, otherwise leave awake
  if (state.isPlaying) {
    hudSleepTimer = setTimeout(sleepHud, 2500);
  }
}

function sleepHud() {
  // Don't sleep if user is hovering over panel
  if (dom.settingsHud.matches(':hover') || !state.isPlaying) return;
  // Make HUD fade downwards
  dom.settingsHud.classList.remove('opacity-100', 'translate-y-0');
  dom.settingsHud.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
}

// --- Keyboard Presenter Logic ---
function handleKeydown(e) {
  if (!dom.viewEditor.classList.contains('hidden')) return;

  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    handleDirectionalCommand(1);  // Reversed per user request
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    handleDirectionalCommand(-1); // Reversed per user request
  } else if (e.code === 'Escape') {
    e.preventDefault();
    setPlay(false);
    openEditor();
  }
}

function handleDirectionalCommand(direction) {
  if (!state.isPlaying) {
    // If paused, pressing a direction starts playing in that direction
    state.scrollDirection = direction;
    setPlay(true);
  } else {
    // If playing
    if (state.scrollDirection === direction) {
      // Pressing the same direction we are already going -> PAUSE
      setPlay(false);
    } else {
      // Pressing the opposite direction -> SWITCH DIRECTION
      state.scrollDirection = direction;
    }
  }
}

// --- Actions & Rendering ---
function renderText(text) {
  const formatted = text.replace(/\n/g, '<br>');
  dom.prompterText.innerHTML = formatted;
}

function applySettings(resetScroll = false) {
  // Update Labels
  dom.labelSpeed.innerText = state.speed.toFixed(1);
  dom.labelFont.innerText = state.fontSize + 'px';
  dom.labelMargin.innerText = state.margin + '%';
  dom.mirrorLabel.innerText = mirrorLabels[state.mirrorIndex];

  // Apply Styles
  dom.prompterText.style.fontSize = state.fontSize + 'px';
  dom.prompterText.style.width = state.margin + '%';
  
  // Apply Mirror Classes
  dom.prompterContainer.className = `w-full h-full overflow-y-auto px-4 md:px-12 relative z-0 ${mirrorModes[state.mirrorIndex]}`;

  if (resetScroll) {
    dom.prompterContainer.scrollTop = 0;
  }
}

function togglePlay() {
  setPlay(!state.isPlaying);
}

function setPlay(play) {
  state.isPlaying = play;
  if (state.isPlaying) {
    dom.iconPlay.classList.add('hidden');
    dom.iconPause.classList.remove('hidden');
    sleepHud();
  } else {
    dom.iconPlay.classList.remove('hidden');
    dom.iconPause.classList.add('hidden');
    wakeHud();
  }
}

function openEditor() {
  setPlay(false);
  // Hide HUD entirely
  dom.settingsHud.classList.add('hidden');
  dom.viewEditor.classList.remove('hidden');
  dom.scriptTextarea.focus();
}

function saveEditor() {
  state.scriptText = dom.scriptTextarea.value;
  saveData('script');
  renderText(state.scriptText);
  // Re-flow DOM and scroll to top
  dom.prompterContainer.scrollTop = 0;
  
  dom.viewEditor.classList.add('hidden');
  dom.settingsHud.classList.remove('hidden');
  wakeHud();
}

function changeSpeed(delta) {
  let v = state.speed + delta;
  if (v < 0) v = 0;
  if (v > 10) v = 10;
  state.speed = v;
  saveData('settings');
  applySettings(false);
  wakeHud();
}

function changeFont(delta) {
  let v = state.fontSize + delta;
  if (v < 20) v = 20;
  if (v > 200) v = 200;
  state.fontSize = v;
  saveData('settings');
  applySettings(false);
  wakeHud();
}

function changeMargin(delta) {
  let v = state.margin + delta;
  if (v < 20) v = 20;
  if (v > 100) v = 100;
  state.margin = v;
  saveData('settings');
  applySettings(false);
  wakeHud();
}

function cycleMirror() {
  state.mirrorIndex = (state.mirrorIndex + 1) % mirrorModes.length;
  saveData('settings');
  applySettings(true);
}
