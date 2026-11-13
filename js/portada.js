// Animación de scroll del pendiente: la portada se queda fija y el scroll dirige el giro, el recorrido y las escenas

document.addEventListener('DOMContentLoaded', () => {
  const portada = document.querySelector('#portada');
  const lienzo = document.querySelector('#secuencia-pendiente');
  if (!portada || !lienzo) return;

  const SCROLL_POR_UNIDAD = 48; // % de pantalla de scroll por unidad de animación: súbelo para alargarla
  const ctx = lienzo.getContext('2d');
  const LADO = lienzo.width;
  const TOTAL = 144; // fotogramas de una vuelta completa; el último enlaza con el primero
  const FRENTE = 18; // fotograma en el que la joya mira de frente (0 grados)
  const FIN_PLANO = 360;
  const fotogramas = new Array(TOTAL).fill(null);
  let cargadas = 0;
  let ultimaClave = '';

  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger;

  /* Borde difuminado: se aplica al pintar, así el cuadro de la imagen no se ve */
  const borde = document.createElement('canvas');
  borde.width = LADO;
  borde.height = LADO;
  const bordeCtx = borde.getContext('2d');
  const centro = LADO / 2;
  const degradado = bordeCtx.createRadialGradient(centro, centro, 0, centro, centro, centro * 1.05);
  degradado.addColorStop(0, '#000');
  degradado.addColorStop(0.88, '#000');
  degradado.addColorStop(1, 'rgba(0,0,0,0)');
  bordeCtx.fillStyle = degradado;
  bordeCtx.fillRect(0, 0, LADO, LADO);

  /* Pintar la joya según su ángulo de giro.
     La secuencia es una vuelta completa (360 grados = TOTAL fotogramas) y 0 grados es de frente.
     Entre dos fotogramas se mezcla un poco para que el giro vaya suave aunque el scroll sea lento. */
  const buscar = (k, margen = 12) => {
    for (let d = 0; d <= margen; d++) {
      if (fotogramas[(k - d + TOTAL) % TOTAL]) return fotogramas[(k - d + TOTAL) % TOTAL];
      if (fotogramas[(k + d) % TOTAL]) return fotogramas[(k + d) % TOTAL];
    }
    return null;
  };
  const dibujar = (grados) => {
    const pos = ((((FRENTE + (grados / 360) * TOTAL) % TOTAL) + TOTAL) % TOTAL);
    const clave = `${Math.round(pos * 20)}:${cargadas}`;
    if (clave === ultimaClave) return;
    const i0 = Math.floor(pos);
    const mezcla = pos - i0;
    const a = buscar(i0);
    const b = buscar((i0 + 1) % TOTAL);
    if (!a) return;
    ultimaClave = clave;

    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, LADO, LADO);
    ctx.drawImage(a, 0, 0, LADO, LADO);
    if (b && b !== a && mezcla > 0.02) {
      ctx.globalAlpha = mezcla;
      ctx.drawImage(b, 0, 0, LADO, LADO);
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(borde, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  };

  /* Carga de la secuencia: primero uno de cada 8 empezando por los fotogramas de frente, luego los intermedios */
  const orden = [];
  [8, 4, 2, 1].forEach((paso) => {
    const grupo = [];
    for (let i = 0; i < TOTAL; i += paso) if (!orden.includes(i)) grupo.push(i);
    const dist = (i) => Math.min(Math.abs(i - FRENTE), TOTAL - Math.abs(i - FRENTE));
    grupo.sort((a, b) => dist(a) - dist(b));
    orden.push(...grupo);
  });
  orden.forEach((i) => {
    const img = new Image();
    img.onload = () => {
      fotogramas[i] = img;
      cargadas++;
      if (sinAnimacion) dibujar(0);
    };
    img.src = `media/fotos/pendiente/f_${String(i + 1).padStart(3, '0')}.webp`;
  });

  if (sinAnimacion) {
    portada.dataset.animada = 'false';
    return;
  }
  portada.dataset.animada = 'true';
  gsap.registerPlugin(ScrollTrigger);

  /* Giro con inercia: el ángulo que se pinta persigue al que marca el scroll */
  const estado = { giro: 0 };
  let objetivo = 0;
  let actual = 0;
  let primera = true;
  let previo = performance.now();
  const suavizar = (ahora) => {
    const dt = Math.min(0.1, (ahora - previo) / 1000);
    previo = ahora;
    actual += (objetivo - actual) * (1 - Math.exp(-dt / 0.06));
    dibujar(actual);
    requestAnimationFrame(suavizar);
  };
  requestAnimationFrame(suavizar);

  /* Las cinco escenas: cada texto entra, se queda un buen rato quieto y sale */
  const logoNav = document.querySelector('#logo-nav');
  const mm = gsap.matchMedia();

  mm.add(
    { escritorio: '(min-width: 1024px)', movil: '(max-width: 1023px)' },
    (medios) => {
      const { escritorio } = medios.conditions;
      const pos = escritorio
        ? { inicio: '-1svh', izq: '-22vw', der: '22vw', base: '-1svh', alto: '-8svh', menor: 0.9, mayor: 1.2 }
        : { inicio: '-2svh', izq: '-16vw', der: '16vw', base: '-18svh', alto: '-26svh', menor: 0.55, mayor: 0.8 };

      gsap.set('#pendiente', { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.42, rotation: 0 });
      gsap.set(['#panel-materiales', '#panel-cierres'], { autoAlpha: 0, y: 30 });
      gsap.set('.llamada-linea', { scaleX: 0 });
      gsap.set('.llamada-texto', { autoAlpha: 0, y: 6 });
      gsap.set(logoNav, { autoAlpha: 0 });
      estado.giro = 0;

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
        onUpdate: () => {
          objetivo = estado.giro;
          if (primera) {
            actual = objetivo;
            primera = false;
          }
        },
      });

      // Escena 1: la firma se queda un momento, pasa al navbar y la joya crece siempre de frente
      tl.to('#flecha', { autoAlpha: 0, duration: 0.3 }, 0.1)
        .to('#madrid', { autoAlpha: 0, duration: 0.3 }, 0.1)
        .to('#firma', { y: -70, scale: 0.6, autoAlpha: 0, duration: 0.7 }, 0.4)
        .to(logoNav, { autoAlpha: 1, duration: 0.4 }, 0.8)
        .to('#pendiente', { scale: 1, y: pos.inicio, duration: 1.1 }, 0.1);

      // Escena 2: la joya se va a la izquierda y empieza a girar; el material se queda mientras gira
      tl.to('#pendiente', { x: pos.izq, y: pos.base, scale: pos.menor, rotation: -6, duration: 1.2 }, 1.7)
        .to(estado, { giro: 40, duration: 1.2, ease: 'none' }, 1.7)
        .to('#panel-materiales', { autoAlpha: 1, y: 0, duration: 0.5 }, 2.5)
        .to(estado, { giro: 90, duration: 2.0, ease: 'none' }, 2.9)
        .to('#panel-materiales', { autoAlpha: 0, y: -24, duration: 0.4 }, 4.9);

      // Escena 3: la joya da una vuelta cruzando la pantalla; el cierre se queda mientras gira despacio
      tl.to(estado, { giro: FIN_PLANO, duration: 2.0, ease: 'power1.inOut' }, 5.0)
        .to('#pendiente', { x: 0, y: pos.alto, scale: pos.mayor, rotation: 0, duration: 1.0, ease: 'power1.inOut' }, 5.0)
        .to('#pendiente', { x: pos.der, y: pos.base, scale: pos.menor, rotation: 8, duration: 1.0, ease: 'power1.inOut' }, 6.0)
        .to('#panel-cierres', { autoAlpha: 1, y: 0, duration: 0.5 }, 6.6)
        .to(estado, { giro: 400, duration: 2.0, ease: 'none' }, 7.0)
        .to('#panel-cierres', { autoAlpha: 0, y: -24, duration: 0.4 }, 8.9);

      // Escena 4: la joya vuelve al centro de frente y las llamadas señalan sus partes
      tl.to(estado, { giro: 720, duration: 1.5, ease: 'power2.inOut' }, 9.0)
        .to('#pendiente', { x: 0, y: 0, scale: 1, rotation: 0, duration: 1.5, ease: 'power2.inOut' }, 9.0)
        .to('.llamada-linea', { scaleX: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, 10.5)
        .to('.llamada-texto', { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.15 }, 10.8)
        .to(['.llamada-texto', '.llamada-linea'], { autoAlpha: 0, duration: 0.3 }, 13.3);

      // Escena 5: la joya gira sobre sí misma, se aleja y desaparece
      tl.to(estado, { giro: 1440, duration: 2.0, ease: 'power2.in' }, 13.3)
        .to('#pendiente', { y: pos.alto, scale: 0.55, autoAlpha: 0, duration: 1.2, ease: 'power2.in' }, 14.1)
        .to({}, { duration: 0.2 });

      ScrollTrigger.create({
        animation: tl,
        trigger: portada,
        start: 'top top',
        end: `+=${Math.round(tl.duration() * SCROLL_POR_UNIDAD)}%`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
      });
    }
  );
});
