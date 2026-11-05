// Modo claro y oscuro y menú móvil a pantalla completa

(() => {
  const html = document.documentElement;
  const interruptor = document.getElementById('interruptor-tema');
  const botonMenu = document.getElementById('menu-boton');
  const menu = document.getElementById('menu-movil');
  const pantallaGrande = window.matchMedia('(min-width: 768px)');

  /* Modo oscuro */
  const marcarTema = () => interruptor.setAttribute('aria-checked', String(html.classList.contains('dark')));
  marcarTema();
  interruptor.addEventListener('click', () => {
    const oscuro = html.classList.toggle('dark');
    try { localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro'); } catch (e) {}
    marcarTema();
  });

  /* Menú móvil */
  const estaAbierto = () => menu.dataset.abierto === 'true';
  const abrirMenu = (abrir) => {
    botonMenu.setAttribute('aria-expanded', String(abrir));
    botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    menu.dataset.abierto = String(abrir);
    menu.inert = !abrir;
    html.classList.toggle('overflow-hidden', abrir);
    if (abrir) menu.querySelector('a').focus({ preventScroll: true });
  };
  botonMenu.addEventListener('click', () => abrirMenu(!estaAbierto()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) abrirMenu(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && estaAbierto()) {
      abrirMenu(false);
      botonMenu.focus();
    }
  });
  pantallaGrande.addEventListener('change', () => { if (estaAbierto()) abrirMenu(false); });
})();
