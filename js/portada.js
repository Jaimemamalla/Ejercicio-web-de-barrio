// Animación de scroll del pendiente: la portada se queda fija y el scroll mueve el vídeo

document.addEventListener('DOMContentLoaded', () => {
  const portada = document.querySelector('#portada');
  if (!portada) return;

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducirMovimiento || !window.gsap || !window.ScrollTrigger) return;

  const video = portada.querySelector('video');
  const logoNav = document.querySelector('#logo-nav');

  /* Carga del vídeo en memoria */
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

  /* Scrub suave del vídeo */
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

  const desbloquear = () => {
    video.play().then(() => video.pause()).catch(() => {});
    removeEventListener('touchstart', desbloquear);
  };
  addEventListener('touchstart', desbloquear, { passive: true });

  /* Animación de los 4 pasos */
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

        gsap.set('#video-pendiente', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.45, clipPath: 'circle(75% at 50% 50%)' });
        gsap.set('#panel-materiales', { autoAlpha: 0, y: 30 });
        gsap.set('#panel-escaparate', { autoAlpha: 0, y: 30 });
        gsap.set(logoNav, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: portada,
            start: 'top top',
            end: '+=250%',
            scrub: 0.25,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => { objetivo = self.progress * video.duration; },
          },
        });

        // Paso 1 a 2: la firma pasa al navbar y el pendiente crece
        tl.to('#flecha', { autoAlpha: 0, duration: 0.2 }, 0)
          .to('#madrid', { autoAlpha: 0, duration: 0.2 }, 0)
          .to('#firma', { y: -70, scale: 0.6, autoAlpha: 0, duration: 0.6 }, 0.1)
          .to(logoNav, { autoAlpha: 1, duration: 0.4 }, 0.4)
          .to('#video-pendiente', { scale: 1, y: escritorio ? '-1svh' : '-2svh', duration: 0.8 }, 0.1);

        // Paso 2 a 3: el pendiente a la izquierda y entran los chips
        tl.to('#video-pendiente', {
            x: escritorio ? () => -window.innerWidth * 0.22 : 0,
            y: escritorio ? '-1svh' : '-18svh',
            scale: escritorio ? 0.9 : 0.55,
            duration: 0.6,
          }, 1.0)
          .to('#panel-materiales', { autoAlpha: 1, y: 0, duration: 0.5 }, 1.2);

        // Paso 3 a 4: el pendiente se encoge hacia la fachada
        tl.to('#panel-materiales', { autoAlpha: 0, y: -24, duration: 0.4 }, 2.0)
          .to('#video-pendiente', {
            x: 0,
            y: escritorio ? '-3svh' : '-2svh',
            scale: escritorio ? 0.3 : 0.32,
            clipPath: 'circle(50% at 50% 50%)',
            duration: 0.7,
          }, 2.0)
          .to('#panel-escaparate', { autoAlpha: 1, y: 0, duration: 0.5 }, 2.3);

        tl.to({}, { duration: 0.3 });
      }
    );
  };

  listo.then(montar);
});
