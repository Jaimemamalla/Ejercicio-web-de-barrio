// intro.js: el logo "Máximo Parra" se dibuja y después entra la web.
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
    }, 650);
  };

  // El dibujo arranca solo con CSS (clase intro-activa en <html>); aquí solo se
  // programa el cierre: trazo 1,8 s + relleno hasta ~2 s + pequeña pausa
  intro.querySelector('.intro-logo').classList.add('dibujando');
  setTimeout(cerrar, 2800);

  // Saltar la intro
  intro.addEventListener('click', cerrar);
  addEventListener('keydown', cerrar, { once: true });
})();
