// Intro: el logo brilla de izquierda a derecha y después entra la web

(() => {
  const intro = document.getElementById('intro');
  const html = document.documentElement;
  if (!intro) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove();
    html.classList.remove('overflow-hidden');
    return;
  }

  let terminada = false;
  const entrar = () => {
    if (terminada) return;
    terminada = true;
    intro.dataset.saliendo = 'true';
    html.classList.remove('overflow-hidden');
    setTimeout(() => {
      intro.remove();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 750);
  };

  document.getElementById('intro-brillo').addEventListener('animationend', () => setTimeout(entrar, 250), { once: true });
  document.getElementById('intro-saltar').addEventListener('click', entrar);
  intro.addEventListener('click', entrar);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') entrar(); });
  setTimeout(entrar, 3500);
})();
