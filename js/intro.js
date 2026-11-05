// Intro: el logo brilla de izquierda a derecha y una cortina se levanta para dejar ver la web

(() => {
  const intro = document.getElementById('intro');
  const franja = document.getElementById('intro-franja');
  const html = document.documentElement;
  if (!intro) return;

  window.scrollTo(0, 0);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove();
    franja?.remove();
    html.classList.remove('overflow-hidden');
    html.dataset.listo = 'true';
    return;
  }

  let terminada = false;
  const entrar = () => {
    if (terminada) return;
    terminada = true;
    intro.dataset.saliendo = 'true';
    if (franja) franja.dataset.saliendo = 'true';
    html.dataset.listo = 'true';
    setTimeout(() => {
      html.classList.remove('overflow-hidden');
      intro.remove();
      franja?.remove();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 1200);
  };

  document.getElementById('intro-brillo').addEventListener('animationend', () => setTimeout(entrar, 150), { once: true });
  document.getElementById('intro-saltar').addEventListener('click', entrar);
  intro.addEventListener('click', entrar);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') entrar(); });
  setTimeout(entrar, 3200);
})();
