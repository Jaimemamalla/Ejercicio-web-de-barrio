// portada.js · Animación de scroll del pendiente (GSAP ScrollTrigger)
// La portada se queda fija (pin) y el scroll mueve video.currentTime (scrub).

document.addEventListener('DOMContentLoaded', () => {
  const portada = document.querySelector('#portada');
  if (!portada) return;

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Sin GSAP o con "reducir movimiento": se queda el paso 4 fijo (clase portada--estatica)
  if (reducirMovimiento || !window.gsap || !window.ScrollTrigger) return;

  const video = portada.querySelector('video');
  const logoNav = document.querySelector('#logo-nav');

  const montar = () => {
    portada.classList.remove('portada--estatica');
    gsap.registerPlugin(ScrollTrigger);

    // Scrub suave: cada fotograma acercamos el vídeo al segundo objetivo,
    // así el giro no va a saltos aunque el scroll sea brusco.
    let objetivo = 0;
    let actual = 0;
    video.pause();
    const suavizar = () => {
      actual += (objetivo - actual) * 0.18;
      if (Math.abs(video.currentTime - actual) > 0.02 && !video.seeking) {
        video.currentTime = Math.min(video.duration - 0.05, Math.max(0, actual));
      }
      requestAnimationFrame(suavizar);
    };
    requestAnimationFrame(suavizar);

    // En iPhone el vídeo no deja saltar de segundo hasta tocar la pantalla una vez
    const desbloquear = () => {
      video.play().then(() => video.pause()).catch(() => {});
      removeEventListener('touchstart', desbloquear);
    };
    addEventListener('touchstart', desbloquear, { passive: true });

    const mm = gsap.matchMedia();

    mm.add(
      { escritorio: '(min-width: 768px)', movil: '(max-width: 767px)' },
      (ctx) => {
        const { escritorio } = ctx.conditions;

        // Estados iniciales
        gsap.set('#video-pendiente', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.4, clipPath: 'circle(75% at 50% 50%)' });
        gsap.set('#panel-materiales', { autoAlpha: 0, y: 40 });
        gsap.set('#panel-escaparate', { autoAlpha: 0, y: 40 });
        gsap.set(logoNav, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power1.inOut' },
          scrollTrigger: {
            trigger: portada,
            start: 'top top',
            end: '+=400%',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            // El avance del scroll (0 a 1) se convierte en un segundo del vídeo
            onUpdate: (self) => { objetivo = self.progress * video.duration; },
          },
        });

        // 1 → 2: la firma pasa al navbar y el pendiente crece
        tl.to('#flecha', { autoAlpha: 0, duration: 0.3 }, 0)
          .to('#madrid', { autoAlpha: 0, duration: 0.3 }, 0.2)
          .to('#firma', { y: -90, scale: 0.6, autoAlpha: 0, duration: 0.8 }, 0.3)
          .to(logoNav, { autoAlpha: 1, duration: 0.5 }, 0.7)
          .to('#video-pendiente', { scale: escritorio ? 0.75 : 0.6, y: escritorio ? '-2svh' : '-4svh', duration: 1 }, 0.3);

        // 2 → 3: el pendiente a la izquierda y entran los chips
        tl.to('#video-pendiente', {
            x: escritorio ? () => -window.innerWidth * 0.22 : 0,
            y: escritorio ? '-2svh' : '-22svh',
            scale: escritorio ? 0.75 : 0.45,
            duration: 0.8,
          }, 1.5)
          .to('#panel-materiales', { autoAlpha: 1, y: 0, duration: 0.7 }, 1.8);

        // 3 → 4: el pendiente se encoge hacia la fachada
        tl.to('#panel-materiales', { autoAlpha: 0, y: -30, duration: 0.5 }, 2.8)
          .set(video, { mixBlendMode: 'normal' }, 3.0)
          .to('#video-pendiente', {
            x: 0,
            y: escritorio ? '-5svh' : '-4svh',
            scale: escritorio ? 0.5 : 0.45,
            clipPath: 'circle(11% at 50% 50%)',
            duration: 0.9,
          }, 2.9)
          .to('#panel-escaparate', { autoAlpha: 1, y: 0, duration: 0.7 }, 3.2);

        tl.to({}, { duration: 0.3 }); // pausa final antes de soltar el pin
      }
    );
  };

  if (video.readyState >= 1) montar();
  else video.addEventListener('loadedmetadata', montar, { once: true });
});
