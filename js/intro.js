// Intro: el logo se dibuja y después entra la web (se puede saltar con clic o tecla)

(() => {
  const intro = document.getElementById('intro');
  const html = document.documentElement;
  if (!intro) return;

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducirMovimiento) {
    intro.remove();
    html.classList.remove('intro-activa');
    return;
  }

  let cerrada = false;
  const cerrar = () => {
    if (cerrada) return;
    cerrada = true;
    intro.classList.add('intro--sale');
    html.classList.remove('intro-activa');
    setTimeout(() => {
      intro.remove();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 650);
  };

  intro.querySelector('.intro-logo').classList.add('dibujando');
  setTimeout(cerrar, 2800);

  intro.addEventListener('click', cerrar);
  addEventListener('keydown', cerrar, { once: true });
})();
