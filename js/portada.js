// Animación de scroll del pendiente: la portada se queda fija y el scroll elige el fotograma

document.addEventListener('DOMContentLoaded', () => {
  const portada = document.querySelector('#portada');
  const lienzo = document.querySelector('#secuencia-pendiente');
  if (!portada || !lienzo) return;

  const ctx = lienzo.getContext('2d');
  const TOTAL = 192;
  const fotogramas = new Array(TOTAL).fill(null);
  let ultimo = null;

  /* Borde difuminado: se aplica al pintar, así el cuadro de la imagen no se ve */
  const borde = document.createElement('canvas');
  borde.width = lienzo.width;
  borde.height = lienzo.height;
  const centro = lienzo.width / 2;
  const degradado = borde.getContext('2d').createRadialGradient(centro, centro, 0, centro, centro, centro * 1.05);
  degradado.addColorStop(0, '#000');
  degradado.addColorStop(0.74, '#000');
  degradado.addColorStop(1, 'rgba(0,0,0,0)');
  borde.getContext('2d').fillStyle = degradado;
  borde.getContext('2d').fillRect(0, 0, borde.width, borde.height);

  /* Pintar un fotograma (el más cercano que ya esté cargado) */
  const buscar = (k) => {
    for (let d = 0; d < TOTAL; d++) {
      if (fotogramas[k - d]) return fotogramas[k - d];
      if (fotogramas[k + d]) return fotogramas[k + d];
    }
    return null;
  };
  const dibujar = (indice) => {
    const img = buscar(Math.max(0, Math.min(TOTAL - 1, Math.round(indice))));
    if (!img || img === ultimo) return;
    ultimo = img;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(borde, 0, 0);
  };

  /* Carga de la secuencia: primero uno de cada 8, luego los intermedios */
  const orden = [];
  [8, 4, 2, 1].forEach((paso) => {
    for (let i = 0; i < TOTAL; i += paso) if (!orden.includes(i)) orden.push(i);
  });
  orden.forEach((i) => {
    const img = new Image();
    img.onload = () => {
      fotogramas[i] = img;
      if (i === 0) dibujar(0);
    };
    img.src = `media/fotos/pendiente/f_${String(i + 1).padStart(3, '0')}.webp`;
  });

  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger;
  if (sinAnimacion) {
    portada.dataset.animada = 'false';
    return;
  }
  portada.dataset.animada = 'true';
  gsap.registerPlugin(ScrollTrigger);

  /* Suavizado del giro: el fotograma persigue al scroll con inercia, igual a cualquier frecuencia de pantalla */
  let objetivo = 0;
  let actual = 0;
  let previo = performance.now();
  const suavizar = (ahora) => {
    const dt = Math.min(0.1, (ahora - previo) / 1000);
    previo = ahora;
    actual += (objetivo - actual) * (1 - Math.exp(-dt / 0.08));
    dibujar(actual);
    requestAnimationFrame(suavizar);
  };
  requestAnimationFrame(suavizar);

  /* Animación: firma, pendiente, materiales y desaparición de la joya */
  const logoNav = document.querySelector('#logo-nav');
  const mm = gsap.matchMedia();

  mm.add(
    { escritorio: '(min-width: 1024px)', movil: '(max-width: 1023px)' },
    (medios) => {
      const { escritorio } = medios.conditions;

      gsap.set('#pendiente', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.42 });
      gsap.set('#panel-materiales', { autoAlpha: 0, y: 30 });
      gsap.set(logoNav, { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: portada,
          start: 'top top',
          end: '+=200%',
          scrub: 0.4,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => { objetivo = self.progress * (TOTAL - 1); },
        },
      });

      // Paso 1 a 2: la firma pasa al navbar y el pendiente crece
      tl.to('#flecha', { autoAlpha: 0, duration: 0.2 }, 0)
        .to('#madrid', { autoAlpha: 0, duration: 0.2 }, 0)
        .to('#firma', { y: -70, scale: 0.6, autoAlpha: 0, duration: 0.6 }, 0.1)
        .to(logoNav, { autoAlpha: 1, duration: 0.4 }, 0.4)
        .to('#pendiente', { scale: 1, y: escritorio ? '-1svh' : '-2svh', duration: 0.8 }, 0.1);

      // Paso 2 a 3: el pendiente se aparta y entran los materiales
      tl.to('#pendiente', {
          x: escritorio ? () => -window.innerWidth * 0.22 : 0,
          y: escritorio ? '-1svh' : '-18svh',
          scale: escritorio ? 0.9 : 0.55,
          duration: 0.6,
        }, 1.0)
        .to('#panel-materiales', { autoAlpha: 1, y: 0, duration: 0.5 }, 1.2);

      // Paso 3 a 4: salen los materiales, la joya desaparece y sigue la página
      tl.to('#panel-materiales', { autoAlpha: 0, y: -24, duration: 0.4 }, 2.0)
        .to('#pendiente', { autoAlpha: 0, y: escritorio ? '-6svh' : '-23svh', duration: 0.5 }, 2.0)
        .to({}, { duration: 0.3 });
    }
  );
});
