/* Horario: marca la tienda como abierta o cerrada según la hora de Madrid */
(function () {
  var insignia = document.getElementById('estado-tienda');
  if (!insignia) return;

  var tarde = [[600, 840], [1020, 1200]];
  var franjas = { 1: tarde, 2: tarde, 3: tarde, 4: tarde, 5: tarde, 6: [[600, 840]] };
  var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function estaAbierto() {
    var partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    var dato = {};
    partes.forEach(function (parte) { dato[parte.type] = parte.value; });
    var minutos = Number(dato.hour) * 60 + Number(dato.minute);
    return (franjas[dias[dato.weekday]] || []).some(function (franja) {
      return minutos >= franja[0] && minutos < franja[1];
    });
  }

  function pintar() {
    var abierto = estaAbierto();
    insignia.dataset.estado = abierto ? 'abierto' : 'cerrado';
    insignia.textContent = abierto ? 'Abierto ahora' : 'Cerrado ahora';
    insignia.hidden = false;
  }

  pintar();
  setInterval(pintar, 60000);
})();
