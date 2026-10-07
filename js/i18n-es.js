/* Thinkora - Spanish language pack (es) */
window.THINKORA_I18N = {
  lang: "es",
  toLight: "Cambiar a modo claro",
  toDark: "Cambiar a modo oscuro",
  light: "Claro",
  dark: "Oscuro",
  ratings: ["Muy superior", "Superior", "Medio-alto", "Medio", "Medio-bajo", "Límite", "Muy bajo"],
  domains: {
    spatial: "Percepción de formas y patrones",
    numerical: "Sentido numérico",
    logical: "Deducción",
    applied: "Resolución de problemas cotidianos",
    verbal: "Razonamiento verbal"
  },
  slider: { higher: "Superior al ", people: " % de las personas", percent: " por ciento" },
  consent: {
    title: "Tus opciones de privacidad",
    body: "<p>Thinkora guarda en tu dispositivo tu elección de modo claro u oscuro. " +
      "Si aceptas los servicios opcionales, también cargamos Google Firebase para que puedas activar las notificaciones del navegador. " +
      'Lee la <a href="/privacy-policy/#cookies">política de privacidad</a> (en inglés).</p>',
    accept: "Aceptar opcionales",
    essential: "Solo esenciales",
    settings: "Ajustes de cookies"
  },
  test: {
    question: function (n, t) { return "Pregunta " + n + " de " + t; },
    skip: "Omitir", next: "Siguiente", finish: "Terminar test",
    option: "Opción", puzzle: "Diagrama del problema",
    min5: "Quedan 5 minutos.", min1: "Queda 1 minuto.",
    unanswered: function (n) {
      return "Tienes " + n + (n === 1 ? " pregunta sin responder" : " preguntas sin responder") +
        ". Pulsa «Terminar test» otra vez para enviar de todos modos, o usa «Atrás» para responderlas.";
    },
    pct: function (p) { return "Has superado aproximadamente al " + p.replace(".", ",") + " % de las personas."; },
    range: function (a, b) { return "Rango probable: de " + a + " a " + b + ". Las estimaciones online pueden variar varios puntos."; },
    time: function (timedOut, right, total, answered, used) {
      return (timedOut ? "Se acabó el tiempo. " : "") + right + " de " + total + " correctas, " +
        answered + " respondidas, " + used + " utilizados.";
    },
    warn: function (a, t) {
      return "Solo respondiste " + a + " de " + t + " preguntas, así que esta estimación no es fiable. Repite el test y responde todas las que puedas.";
    },
    best: function (d) { return "Tu habilidad más fuerte fue: " + d + "."; }
  },
  /* Same order as the English test: numerical 6, logical 6, applied 5, verbal 6, spatial 7. */
  questions: [
    { p: "¿Qué número sigue? 3, 6, 9, 12, ?" },
    { p: "¿Qué número sigue? 4, 7, 8, 11, 12, 15, ?" },
    { p: "¿Qué número sigue? 1, 2, 4, 7, 11, 16, ?" },
    { p: "¿Qué número sigue? 2, 6, 12, 20, 30, ?" },
    { p: "¿Qué número sigue? 3, 5, 9, 17, 33, ?" },
    { p: "Un tren recorre 150 km en 2,5 horas. A la misma velocidad, ¿cuánto tardará en recorrer 240 km?",
      o: ["3,5 horas", "4 horas", "4,5 horas", "5 horas"] },

    { p: "Todos los bloops son razzies. Todos los razzies son lazzies. ¿Son todos los bloops lazzies?",
      o: ["Solo a veces", "Sí, siempre", "No, nunca", "No se puede determinar"] },
    { p: "Sergio llegó antes que Teresa. Úrsula llegó después de Teresa. Víctor llegó antes que Sergio. ¿Quién llegó en segundo lugar?",
      o: ["Víctor", "Teresa", "Úrsula", "Sergio"] },
    { p: "Algunos artistas son músicos. Todos los músicos son creativos. ¿Qué afirmación tiene que ser verdadera?",
      o: ["Todos los artistas son creativos", "Ningún artista es creativo", "Algunos artistas son creativos", "Todas las personas creativas son músicos"] },
    { p: "Si llueve, se cancela el partido. El partido no se canceló. ¿Qué se puede concluir?",
      o: ["Llovió", "No llovió", "El partido se canceló de todos modos", "No se puede concluir nada"] },
    { p: "Exactamente dos de estas tres afirmaciones son verdaderas. A: La caja 1 contiene la llave. B: La caja 1 está vacía. C: La caja 2 contiene la llave. ¿Dónde está la llave?",
      o: ["Caja 1", "Caja 2", "Caja 3", "No se puede determinar"] },
    { p: "Cinco personas (Ana, Beto, Clara, Diego y Elena) hacen fila. Clara está en el extremo derecho. Beto está justo a la izquierda de Ana, y Diego está justo a la derecha de Ana. Elena no está al lado de Clara. ¿Quién está en el extremo izquierdo?",
      o: ["Beto", "Clara", "Diego", "Elena"] },

    { p: "Una receta usa 3 huevos para 12 magdalenas. ¿Cuántos huevos hacen falta para 36 magdalenas?" },
    { p: "El pájaro es al nido como la abeja es a...", o: ["La miel", "El aguijón", "La flor", "La colmena"] },
    { p: "Una camisa cuesta 40 € después de un descuento del 20 %. ¿Cuál era el precio original?",
      o: ["48 €", "50 €", "52 €", "60 €"] },
    { p: "Pablo tarda 6 horas en pintar una valla. Rosa tarda 3 horas en pintar la misma valla. ¿Cuánto tardarán si trabajan juntos?",
      o: ["1,5 horas", "2 horas", "2,5 horas", "4,5 horas"] },
    { p: "Una reunión empieza a las 14:45 y dura 1 hora y 50 minutos. Después hay un descanso de 25 minutos. ¿A qué hora termina el descanso?",
      o: ["16:50", "17:00", "17:10", "17:15"] },

    { p: "¿Qué palabra significa lo contrario de «escaso»?", o: ["Raro", "Abundante", "Caro", "Oculto"], c: 1 },
    { p: "El bisturí es al cirujano como el cucharón es al...", o: ["Cocinero", "Sopa", "Cuchara", "Cocina"], c: 0 },
    { p: "¿Qué palabra no pertenece al grupo?", o: ["Afluente", "Delta", "Estuario", "Meseta"], c: 3 },
    { p: "Elige la palabra que mejor completa la frase: La oradora era tan ______ que incluso quienes no estaban de acuerdo con ella la escucharon hasta el final.",
      o: ["aburrida", "convincente", "vacilante", "descuidada"], c: 1 },
    { p: "Ordena alfabéticamente las letras de la palabra PLANETA. ¿Qué letra queda en cuarto lugar?", o: ["L", "N", "P", "T"], c: 0 },
    { p: "En un código secreto, LUNA se escribe MVOB. ¿Cómo se escribiría SOL con el mismo código?", o: ["TPM", "RNK", "TPN", "SPM"], c: 0 },

    { p: "La figura gira del mismo modo en cada paso. ¿Qué figura sigue?",
      alt: "Una figura girada 0, 90 y 180 grados en el sentido de las agujas del reloj, seguida de un recuadro vacío" },
    { p: "¿Qué opción es la figura objetivo girada, no volteada como en un espejo?",
      alt: "La figura objetivo, una letra F de lado" },
    { p: "Cada recuadro tiene puntos. ¿Qué opción completa el patrón?",
      alt: "Una cuadrícula de tres por tres con puntos y el último recuadro vacío" },
    { p: "Tres de estas figuras son la misma figura girada en distintos ángulos. Una es una imagen en espejo. ¿Cuál es la diferente?" },
    { p: "Cada fila y cada columna contiene cada figura una sola vez. ¿Qué opción va en el recuadro vacío?",
      alt: "Una cuadrícula de tres por tres con círculos, cuadrados y triángulos y el último recuadro vacío" },
    { p: "La figura gira un ángulo mayor en cada paso. ¿Qué figura sigue?",
      alt: "Una figura girada 0, 45, 135 y 270 grados en el sentido de las agujas del reloj, seguida de un recuadro vacío" },
    { p: "Los cuadrados sombreados giran un cuarto de vuelta en el sentido de las agujas del reloj en cada paso. ¿Qué cuadrícula sigue?",
      alt: "Tres cuadrículas de cuadrados sombreados que giran en el sentido de las agujas del reloj, seguidas de un recuadro vacío" }
  ]
};
