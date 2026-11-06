// Intro: el logo brilla de izquierda a derecha y una cortina se levanta para dejar ver la web.
// No se muestra con movimiento reducido, al llegar a una sección (index.html#visitanos) ni al volver desde otra página de la web.

(() => {
  const intro = document.getElementById('intro');
  const franja = document.getElementById('intro-franja');
  const html = document.documentElement;
  if (!intro) return;

  const destino = (() => {
    if (location.hash.length < 2) return null;
    try { return document.querySelector(location.hash); } catch (e) { return null; }
  })();
  const entrada = performance.getEntriesByType('navigation')[0];
  const recarga = entrada && entrada.type === 'reload';
  const desdeOtraPagina = !recarga && document.referrer !== '' && new URL(document.referrer).origin === location.origin;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || destino || desdeOtraPagina) {
    intro.remove();
    franja?.remove();
    html.classList.remove('overflow-hidden');
    html.dataset.listo = 'true';
    if (destino) {
      // la portada se monta al terminar DOMContentLoaded: después se recalcula y se salta a la sección
      document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        destino.scrollIntoView({ behavior: 'instant' });
      }, 0));
    } else {
      window.scrollTo(0, 0);
    }
    return;
  }

  window.scrollTo(0, 0);

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
