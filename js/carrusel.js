/* Carrusel: pista con scroll ajustado, flechas, pausa y avance automático */
(function () {
  var raices = document.querySelectorAll('[data-carrusel]');
  if (!raices.length) return;

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  raices.forEach(function (raiz) {
    var pista = raiz.querySelector('[data-carrusel-pista]');
    if (!pista || pista.children.length < 2) return;

    var diapositivas = Array.prototype.slice.call(pista.children);
    var controles = raiz.querySelector('[data-carrusel-controles]');
    var anterior = raiz.querySelector('[data-carrusel-anterior]');
    var siguiente = raiz.querySelector('[data-carrusel-siguiente]');
    var pausa = raiz.querySelector('[data-carrusel-pausa]');
    var pie = raiz.querySelector('[data-carrusel-pie]');
    var cuenta = raiz.querySelector('[data-carrusel-cuenta]');
    var intervalo = Number(raiz.dataset.intervalo) || 5000;

    var actual = 0;
    var reloj = null;
    var asentando = null;
    var pausadoPorUsuario = menosMovimiento.matches;
    var interactuando = false;
    var enPantalla = false;

    function precargar() {
      raiz.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
    }

    function actualizar() {
      if (pie) pie.textContent = diapositivas[actual].dataset.pie || '';
      if (cuenta) cuenta.textContent = (actual + 1) + ' / ' + diapositivas.length;
    }

    function parar() {
      clearTimeout(reloj);
      reloj = null;
    }

    function programar() {
      parar();
      if (pausadoPorUsuario || interactuando || !enPantalla || document.hidden) return;
      reloj = setTimeout(function () {
        ir(actual + 1);
        programar();
      }, intervalo);
    }

    function ir(indice) {
      actual = (indice + diapositivas.length) % diapositivas.length;
      pista.scrollTo({ left: actual * pista.clientWidth, behavior: menosMovimiento.matches ? 'auto' : 'smooth' });
      actualizar();
    }

    function fijarPausa(valor) {
      pausadoPorUsuario = valor;
      if (pausa) {
        pausa.dataset.pausado = String(valor);
        pausa.setAttribute('aria-label', valor ? 'Reanudar el avance automático' : 'Pausar el avance automático');
      }
      if (pie && pie.parentElement) pie.parentElement.setAttribute('aria-live', valor ? 'polite' : 'off');
      programar();
    }

    if (anterior) anterior.addEventListener('click', function () { ir(actual - 1); });
    if (siguiente) siguiente.addEventListener('click', function () { ir(actual + 1); });
    if (pausa) pausa.addEventListener('click', function () { fijarPausa(!pausadoPorUsuario); });

    pista.addEventListener('scroll', function () {
      clearTimeout(asentando);
      asentando = setTimeout(function () {
        var indice = Math.round(pista.scrollLeft / pista.clientWidth);
        indice = Math.max(0, Math.min(diapositivas.length - 1, indice));
        if (indice !== actual) {
          actual = indice;
          actualizar();
        }
        programar();
      }, 100);
    }, { passive: true });

    raiz.addEventListener('mouseenter', function () { interactuando = true; parar(); });
    raiz.addEventListener('mouseleave', function () { interactuando = false; programar(); });
    raiz.addEventListener('focusin', function () { interactuando = true; parar(); });
    raiz.addEventListener('focusout', function () { interactuando = false; programar(); });
    raiz.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') ir(actual - 1);
      else if (e.key === 'ArrowRight') ir(actual + 1);
    });

    window.addEventListener('resize', function () {
      pista.scrollTo({ left: actual * pista.clientWidth, behavior: 'auto' });
    });
    document.addEventListener('visibilitychange', programar);
    if (menosMovimiento.addEventListener) {
      menosMovimiento.addEventListener('change', function () { if (menosMovimiento.matches) fijarPausa(true); });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        enPantalla = entradas[0].isIntersecting;
        if (enPantalla) precargar();
        programar();
      }, { threshold: 0.4 }).observe(raiz);
    } else {
      enPantalla = true;
      precargar();
    }

    if (controles) controles.hidden = false;
    actualizar();
    fijarPausa(pausadoPorUsuario);
  });
})();
