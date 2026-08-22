/**
 * CSS Craft Studio — Interactive Logic Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  init3DTiltCards();
  initThemeEngine();
  initCustomizerDrawer();
  initCodeInspector();
  initWidgetInteractions();
});

/* ==========================================================================
   1. 3D Parallax Mouse Tilt & Specular Reflection
   ========================================================================== */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Get dynamic tilt sensitivity from CSS custom property
      const maxTilt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tilt-deg')) || 15;

      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Specular Glare position
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${percentX}%`);
      card.style.setProperty('--mouse-y', `${percentY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/* ==========================================================================
   2. Theme Preset Engine
   ========================================================================== */
function initThemeEngine() {
  const themeBtns = document.querySelectorAll('[data-theme-set], [data-theme-apply]');

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeSet || btn.dataset.themeApply;
      document.documentElement.setAttribute('data-theme', theme);

      // Update active states
      document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.themeSet === theme);
      });
      document.querySelectorAll('.preset-card').forEach(p => {
        p.classList.toggle('active', p.dataset.themeApply === theme);
      });

      showToast(`Switched theme to: ${theme.toUpperCase()}`);
    });
  });
}

/* ==========================================================================
   3. Live CSS Studio Customizer Drawer & Property Binder
   ========================================================================== */
function initCustomizerDrawer() {
  const drawer = document.getElementById('customizerDrawer');
  const openBtn = document.getElementById('openCustomizerBtn');
  const closeBtn = document.getElementById('closeCustomizerBtn');
  const resetBtn = document.getElementById('resetCustomizerBtn');

  openBtn.addEventListener('click', () => drawer.classList.add('open'));
  closeBtn.addEventListener('click', () => drawer.classList.remove('open'));

  // Sliders
  const inputHue = document.getElementById('inputHue');
  const inputBlur = document.getElementById('inputBlur');
  const inputGlow = document.getElementById('inputGlow');
  const inputRadius = document.getElementById('inputRadius');
  const inputTilt = document.getElementById('inputTilt');

  const valHue = document.getElementById('valHue');
  const valBlur = document.getElementById('valBlur');
  const valGlow = document.getElementById('valGlow');
  const valRadius = document.getElementById('valRadius');
  const valTilt = document.getElementById('valTilt');

  inputHue.addEventListener('input', (e) => {
    const val = e.target.value;
    document.documentElement.style.setProperty('--hue', val);
    valHue.textContent = `${val}°`;
  });

  inputBlur.addEventListener('input', (e) => {
    const val = e.target.value;
    document.documentElement.style.setProperty('--glass-blur', `${val}px`);
    valBlur.textContent = `${val}px`;
  });

  inputGlow.addEventListener('input', (e) => {
    const val = e.target.value;
    document.documentElement.style.setProperty('--glow-spread', `${val}px`);
    valGlow.textContent = `${val}px`;
  });

  inputRadius.addEventListener('input', (e) => {
    const val = e.target.value;
    document.documentElement.style.setProperty('--border-radius', `${val}px`);
    valRadius.textContent = `${val}px`;
  });

  inputTilt.addEventListener('input', (e) => {
    const val = e.target.value;
    document.documentElement.style.setProperty('--tilt-deg', `${val}deg`);
    valTilt.textContent = `${val}°`;
  });

  resetBtn.addEventListener('click', () => {
    inputHue.value = 180;
    inputBlur.value = 16;
    inputGlow.value = 25;
    inputRadius.value = 16;
    inputTilt.value = 15;

    document.documentElement.style.setProperty('--hue', '180');
    document.documentElement.style.setProperty('--glass-blur', '16px');
    document.documentElement.style.setProperty('--glow-spread', '25px');
    document.documentElement.style.setProperty('--border-radius', '16px');
    document.documentElement.style.setProperty('--tilt-deg', '15deg');

    valHue.textContent = '180°';
    valBlur.textContent = '16px';
    valGlow.textContent = '25px';
    valRadius.textContent = '16px';
    valTilt.textContent = '15°';

    showToast('Reset CSS custom properties to default!');
  });
}

/* ==========================================================================
   4. Code Inspector & CSS Snippets Exporter
   ========================================================================== */
const componentSnippets = {
  'card-holo': {
    title: 'Holographic 3D Tilt Card',
    css: `/* Holographic 3D Tilt Card */
.holo-card {
  position: relative;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(255, 0, 119, 0.08));
  border: 1px solid rgba(0, 240, 255, 0.3);
  backdrop-filter: blur(16px);
  transform-style: preserve-3d;
  transition: transform 0.15s ease, box-shadow 0.4s ease;
}

.holo-card:hover {
  box-shadow: 0 0 35px rgba(0, 240, 255, 0.3);
}

.card-glare {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.2) 0%, transparent 60%);
  pointer-events: none;
}`,
    html: `<div class="tilt-card holo-card">
  <div class="card-glare"></div>
  <div class="card-content">
    <h3>Neural Matrix V2</h3>
    <p>Holographic glass card with 3D spatial rotation.</p>
  </div>
</div>`
  },

  'card-conic': {
    title: 'Animated Conic Border Card',
    css: `/* CSS @property for Conic Rotation */
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.conic-card {
  position: relative;
  border-radius: 16px;
  background: #090c15;
}

.conic-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: conic-gradient(from var(--angle), #00f0ff, #ff0077, #7000ff, #00f0ff);
  animation: rotateConic 4s linear infinite;
  z-index: -1;
}

@keyframes rotateConic {
  to { --angle: 360deg; }
}`,
    html: `<div class="tilt-card conic-card">
  <div class="card-content">
    <h3>Quantum Ray Border</h3>
    <p>Continuous rotating conic-gradient border.</p>
  </div>
</div>`
  },

  'card-glass': {
    title: 'Deep Glassmorphism Card',
    css: `/* Frosted Glassmorphism */
.deep-glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}`,
    html: `<div class="tilt-card deep-glass-card">
  <div class="floating-orb orb-1"></div>
  <div class="card-content">
    <h3>Frosted Acrylic Layer</h3>
  </div>
</div>`
  },

  'card-neo': {
    title: 'Neomorphic Depth Card',
    css: `/* Tactile Neomorphism */
.neo-card {
  background: #0b0f19;
  border-radius: 16px;
  box-shadow: 8px 8px 20px #04060b, -8px -8px 20px #121827;
  transition: box-shadow 0.3s ease;
}

.neo-card:hover {
  box-shadow: 12px 12px 28px #030408, -12px -12px 28px #131a2a;
}`,
    html: `<div class="tilt-card neo-card">
  <div class="card-content">
    <h3>Extruded Tactile Deck</h3>
  </div>
</div>`
  },

  'btn-glitch': {
    title: 'Cyberpunk Glitch Button',
    css: `/* Cyberpunk Glitch Button */
.btn-glitch {
  position: relative;
  padding: 0.9rem 2rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: #000;
  background: #00f0ff;
  border: none;
  cursor: pointer;
}

.btn-glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  background: #ff0077;
  color: #fff;
  clip-path: inset(50% 0 0 0);
  opacity: 0;
}

.btn-glitch:hover::after {
  opacity: 1;
  animation: glitchAnim 0.3s steps(2, start) infinite;
}

@keyframes glitchAnim {
  0% { clip-path: inset(20% 0 50% 0); transform: translate(-3px, 2px); }
  50% { clip-path: inset(60% 0 10% 0); transform: translate(3px, -2px); }
  100% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, -1px); }
}`,
    html: `<button class="btn-glitch" data-text="INITIATE_PROT">INITIATE_PROT</button>`
  },

  'btn-shimmer': {
    title: 'Shimmer Light Ray Button',
    css: `/* Shimmer Light Beam Button */
.btn-shimmer {
  position: relative;
  padding: 0.9rem 2.2rem;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  overflow: hidden;
  cursor: pointer;
}

.btn-shimmer::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(60deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: rotate(30deg) translateY(-100%);
  transition: transform 0.6s ease;
}

.btn-shimmer:hover::before {
  transform: rotate(30deg) translateY(100%);
}`,
    html: `<button class="btn-shimmer"><span>Shimmer Ray ✨</span></button>`
  },

  'loader-atomic': {
    title: 'Atomic Orbit Spinner',
    css: `/* 3-Axis Rotational Atomic Spinner */
.loader-atomic {
  position: relative;
  width: 60px; height: 60px;
}

.orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #00f0ff;
}

.ring-1 { animation: orbitRotate1 1.2s infinite linear; }
.ring-2 { animation: orbitRotate2 1.5s infinite linear; border-top-color: #ff0077; }

@keyframes orbitRotate1 {
  0% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg); }
  100% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg); }
}

@keyframes orbitRotate2 {
  0% { transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg); }
  100% { transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg); }
}`,
    html: `<div class="loader-atomic">
  <div class="orbit ring-1"></div>
  <div class="orbit ring-2"></div>
  <div class="core-dot"></div>
</div>`
  }
};

function initCodeInspector() {
  const modalOverlay = document.getElementById('codeModalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const titleElem = document.getElementById('modalComponentTitle');
  const codeCSS = document.getElementById('codeCSSSnippet');
  const codeHTML = document.getElementById('codeHTMLSnippet');

  const tabs = document.querySelectorAll('.modal-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  let activeSnippet = '';

  document.querySelectorAll('[data-code-id]').forEach(elem => {
    const btn = elem.querySelector('.inspect-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const codeId = elem.dataset.codeId;
      const data = componentSnippets[codeId] || {
        title: 'CSS Component Inspector',
        css: `/* Custom CSS Component */\n${elem.firstElementChild ? elem.firstElementChild.className : ''} {\n  backdrop-filter: blur(16px);\n  border-radius: 16px;\n}`,
        html: elem.outerHTML
      };

      titleElem.textContent = data.title;
      codeCSS.textContent = data.css;
      codeHTML.textContent = data.html;
      activeSnippet = data.css;

      modalOverlay.classList.add('open');
    });
  });

  closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab === 'css' ? 'tabCSS' : 'tabHTML';
      document.getElementById(targetId).classList.add('active');

      activeSnippet = tab.dataset.tab === 'css' ? codeCSS.textContent : codeHTML.textContent;
    });
  });

  // Copy code
  copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(activeSnippet).then(() => {
      showToast('Snippet copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy code.');
    });
  });
}

/* ==========================================================================
   5. Interactive UI Widget Interactions & Toasts
   ========================================================================== */
function initWidgetInteractions() {
  const fluxRange = document.getElementById('fluxRange');
  const fluxVal = document.getElementById('fluxVal');

  if (fluxRange && fluxVal) {
    fluxRange.addEventListener('input', (e) => {
      fluxVal.textContent = `${e.target.value}%`;
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-accent"></i> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
