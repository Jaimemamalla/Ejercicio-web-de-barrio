// portada.js: animación de scroll del pendiente (GSAP ScrollTrigger)
// La portada se queda fija (pin) y el scroll mueve video.currentTime (scrub).

document.addEventListener('DOMContentLoaded', () => {
  const portada = document.querySelector('#portada');
  if (!portada) return;

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Sin GSAP o con "reducir movimiento": se queda el paso 4 fijo (clase portada--estatica)
  if (reducirMovimiento || !window.gsap || !window.ScrollTrigger) return;

  const video = portada.querySelector('video');
  const logoNav = document.querySelector('#logo-nav');

  /* ---------- 1. El vídeo entero en memoria ----------
     Saltar de segundo es mucho más rápido (y más fino) si el vídeo ya está
     descargado en memoria que pidiéndolo al servidor por trozos. Si falla
     (por ejemplo abriendo el HTML sin servidor), se usa el vídeo normal. */
  const listo = new Promise((resolve) => {
    const esperarMetadatos = () => {
      if (video.readyState >= 1) resolve();
      else video.addEventListener('loadedmetadata', resolve, { once: true });
    };
    const origen = video.querySelector('source')?.src || video.currentSrc;
    fetch(origen)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        video.src = URL.createObjectURL(blob);
        video.load();
        esperarMetadatos();
      })
      .catch(esperarMetadatos);
  });

  /* ---------- 2. Scrub suave ----------
     Cada fotograma acercamos el vídeo al segundo objetivo (0 a 1 del scroll). */
  let objetivo = 0;
  let actual = 0;
  const suavizar = () => {
    const falta = objetivo - actual;
    if (Math.abs(falta) > 0.001 && video.duration) {
      actual += falta * 0.3;
      const t = Math.min(video.duration - 0.05, Math.max(0, actual));
      if (Math.abs(video.currentTime - t) > 1 / 60 && !video.seeking) video.currentTime = t;
    }
    requestAnimationFrame(suavizar);
  };

  // En iPhone el vídeo no deja saltar de segundo hasta tocar la pantalla una vez
  const desbloquear = () => {
    video.play().then(() => video.pause()).catch(() => {});
    removeEventListener('touchstart', desbloquear);
  };
  addEventListener('touchstart', desbloquear, { passive: true });

  /* ---------- 3. La animación ---------- */
  const montar = () => {
    portada.classList.remove('portada--estatica');
    gsap.registerPlugin(ScrollTrigger);
    video.pause();
    requestAnimationFrame(suavizar);

    const mm = gsap.matchMedia();

    mm.add(
      { escritorio: '(min-width: 768px)', movil: '(max-width: 767px)' },
      (ctx) => {
        const { escritorio } = ctx.conditions;

        // Estados iniciales
        gsap.set('#video-pendiente', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.4, clipPath: 'circle(75% at 50% 50%)' });
        gsap.set('#panel-materiales', { autoAlpha: 0, y: 30 });
        gsap.set('#panel-escaparate', { autoAlpha: 0, y: 30 });
        gsap.set(logoNav, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: portada,
            start: 'top top',
            end: '+=250%',        // menos recorrido: la animación va más rápida
            scrub: 0.25,
            pin: true,
            anticipatePin: 1,
            // El avance del scroll (0 a 1) se convierte en un segundo del vídeo
            onUpdate: (self) => { objetivo = self.progress * video.duration; },
          },
        });

        // 1 a 2: la firma pasa al navbar y el pendiente crece
        tl.to('#flecha', { autoAlpha: 0, duration: 0.2 }, 0)
          .to('#madrid', { autoAlpha: 0, duration: 0.2 }, 0)
          .to('#firma', { y: -70, scale: 0.6, autoAlpha: 0, duration: 0.6 }, 0.1)
          .to(logoNav, { autoAlpha: 1, duration: 0.4 }, 0.4)
          .to('#video-pendiente', { scale: escritorio ? 0.75 : 0.6, y: escritorio ? '-2svh' : '-4svh', duration: 0.8 }, 0.1);

        // 2 a 3: el pendiente a la izquierda y entran los chips
        tl.to('#video-pendiente', {
            x: escritorio ? () => -window.innerWidth * 0.22 : 0,
            y: escritorio ? '-2svh' : '-22svh',
            scale: escritorio ? 0.75 : 0.45,
            duration: 0.6,
          }, 1.0)
          .to('#panel-materiales', { autoAlpha: 1, y: 0, duration: 0.5 }, 1.2);

        // 3 a 4: el pendiente se encoge hacia la fachada
        tl.to('#panel-materiales', { autoAlpha: 0, y: -24, duration: 0.4 }, 2.0)
          .to('#video-pendiente', {
            x: 0,
            y: escritorio ? '-5svh' : '-4svh',
            scale: escritorio ? 0.5 : 0.45,
            clipPath: 'circle(11% at 50% 50%)',
            duration: 0.7,
          }, 2.0)
          .to('#panel-escaparate', { autoAlpha: 1, y: 0, duration: 0.5 }, 2.3);

        tl.to({}, { duration: 0.3 }); // pausa final antes de soltar el pin
      }
    );
  };

  listo.then(montar);
});
