// Carrega parcial via fetch
function loadPartial(name) {
  fetch(`partials/${name}.html`)
    .then(r => r.text())
    .then(html => {
      const container = document.getElementById('content');
      container.innerHTML = html;
      if (name === 'capa') {
        observeCube();
      }
      if (name === 'autocards') {
        initAutocards();
      }
      applyStagger(container);
      updateProgress();
    });
}

// Progress bar
function updateProgress() {
  const height = document.body.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  const percent = (scrolled / height) * 100;
  document.getElementById('progress-bar').style.width = `${percent}%`;
}
window.addEventListener('scroll', updateProgress);

// Observa cubo para revelar
function observeCube() {
  const cube = document.querySelector('.cube');
  if (!cube) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cube.classList.add('reveal');
      }
    });
  });
  obs.observe(cube);
}

function applyStagger(container) {
  const items = container.querySelectorAll('h1, h2, p, li');
  if (items.length) {
    gsap.from(items, {opacity: 0, y: 30, duration: 0.6, stagger: 0.1});
  }
}

// Som ao clicar
let synth;
function playTone(type = 'click') {
  if (!window.Tone) return;
  if (!synth) synth = new Tone.Synth().toDestination();
  const now = Tone.now();
  switch (type) {
    case 'open':
      synth.triggerAttackRelease('C4', '8n', now);
      synth.triggerAttackRelease('E4', '8n', now + 0.1);
      synth.triggerAttackRelease('G4', '8n', now + 0.2);
      break;
    case 'close':
      synth.triggerAttackRelease('G4', '8n', now);
      synth.triggerAttackRelease('E4', '8n', now + 0.1);
      synth.triggerAttackRelease('C4', '8n', now + 0.2);
      break;
    case 'send':
      synth.triggerAttackRelease('C5', '4n', now);
      break;
    case 'hover':
      synth.triggerAttackRelease('C4', '16n', now);
      break;
    default:
      synth.triggerAttackRelease('C4', '8n', now);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('mouseover', () => playTone('hover'));
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = a.getAttribute('data-target');
      loadPartial(target);
      playTone('click');
    });
  });
  loadPartial('capa');
});

// Modo foco
function toggleFocus() {
  document.documentElement.classList.toggle('focus-mode');
}

// ----- Card de tarefa com animação FLIP -----
function initAutocards() {
  const card = document.querySelector('.task-card');
  if (!card) return;
  card.addEventListener('click', () => openTaskForm(card));
}

function openTaskForm(card) {
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = `
    <div class="task-form">
      <button class="close-btn" aria-label="Fechar">&times;</button>
      <form>
        <label>Tarefa:<br><input type="text" required></label>
        <button type="submit">Enviar</button>
      </form>
    </div>`;
  const form = overlay.querySelector('.task-form');
  overlay.classList.add('open');
  document.body.classList.add('no-scroll');

  const start = card.getBoundingClientRect();
  const end = form.getBoundingClientRect();
  gsap.set(form, {
    x: start.left - end.left,
    y: start.top - end.top,
    scaleX: start.width / end.width,
    scaleY: start.height / end.height,
    transformOrigin: 'top left'
  });
  gsap.to(form, {duration: 0.6, x:0, y:0, scaleX:1, scaleY:1, ease:'elastic.out(1,0.5)'});
  playTone('open');

  overlay.querySelector('.close-btn').addEventListener('click', () => closeTaskForm());
  overlay.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    closeTaskForm('send');
  });
}

function closeTaskForm(type = 'close') {
  const overlay = document.getElementById('overlay');
  const form = overlay.querySelector('.task-form');
  if (!form) return;
  const card = document.querySelector('.task-card');
  const start = form.getBoundingClientRect();
  const end = card.getBoundingClientRect();
  gsap.to(form, {
    duration: 0.5,
    x: end.left - start.left,
    y: end.top - start.top,
    scaleX: end.width / start.width,
    scaleY: end.height / start.height,
    ease: 'elastic.in(1,0.5)',
    onComplete: () => {
      overlay.classList.remove('open');
      overlay.innerHTML = '';
      document.body.classList.remove('no-scroll');
    }
  });
  playTone(type);
}
