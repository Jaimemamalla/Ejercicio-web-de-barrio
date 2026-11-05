// intro.js · El logo "Máximo Parra" se dibuja y después entra la web.
// Se puede saltar con clic, tecla o el botón "Entrar". Con "reducir movimiento" no se muestra.

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
      if (window.ScrollTrigger) ScrollTrigger.refresh(); // recalcula el pin de la portada
    }, 850);
  };

  // Empieza a dibujar (trazo 2,8 s + relleno hasta ~3,2 s + pequeña pausa)
  requestAnimationFrame(() => {
    intro.querySelector('.intro-logo').classList.add('dibujando');
    setTimeout(cerrar, 4000);
  });

  // Saltar la intro
  intro.addEventListener('click', cerrar);
  addEventListener('keydown', cerrar, { once: true });
})();
