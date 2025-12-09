/**
 * Handler para la cuenta regresiva hasta Navidad
 */

const { SOUNDS, wrapSSML, pause, getRandomGreeting } = require('../utils/speechUtils');

/**
 * Calcula el tiempo restante hasta Nochebuena (24 de diciembre a las 20:00)
 */
const calculateCountdown = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Nochebuena: 24 de diciembre a las 20:00 (hora típica de la cena)
    let christmasEve = new Date(currentYear, 11, 24, 20, 0, 0);

    // Si ya pasó este año, calcular para el próximo
    if (now > christmasEve) {
        christmasEve = new Date(currentYear + 1, 11, 24, 20, 0, 0);
    }

    const diff = christmasEve - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isChristmasEve: days === 0 && hours <= 24 };
};

/**
 * Genera el mensaje de cuenta regresiva
 */
const generateCountdownMessage = () => {
    const { days, hours, minutes, seconds, isChristmasEve } = calculateCountdown();

    // Es Nochebuena o justo después
    if (days === 0 && hours === 0 && minutes === 0) {
        return `${SOUNDS.bells}${SOUNDS.celebration} ¡ES NOCHEBUENA! ${pause(300)} ¡La noche más mágica del año ha llegado! Santa Claus ya está preparando su trineo para volar por todo el mundo. ${pause(300)} ¡Ho Ho Ho! ¡Feliz Navidad! ${SOUNDS.sleighBells}`;
    }

    if (isChristmasEve && hours > 0) {
        return `${SOUNDS.sleighBells} ¡Hoy es Nochebuena! ${pause(300)} Faltan solo ${hours} horas y ${minutes} minutos para que Santa Claus comience su viaje mágico. ${pause(300)} ¡Prepara las galletas y la leche! ¡Ho Ho Ho! ${SOUNDS.magic}`;
    }

    // Mensajes especiales según cuánto falte
    let message = '';

    if (days === 1) {
        message = `${SOUNDS.bells} ¡Falta solo un día para Nochebuena! ${pause(300)} Los elfos están trabajando sin parar en el taller. ${pause(200)} En exactamente ${hours} horas y ${minutes} minutos, Santa Claus estará listo para volar. ${pause(300)} ¿Ya escribiste tu carta? ¡Ho Ho Ho!`;
    } else if (days <= 3) {
        message = `${SOUNDS.bells} ¡La Navidad está muy cerca! ${pause(300)} Faltan ${days} días, ${hours} horas y ${minutes} minutos para Nochebuena. ${pause(200)} Los renos ya están practicando sus vuelos. ¡Ho Ho Ho!`;
    } else if (days <= 7) {
        message = `${SOUNDS.sleighBells} ¡Solo queda una semana! ${pause(200)} Faltan exactamente ${days} días, ${hours} horas y ${minutes} minutos para Nochebuena. ${pause(300)} Santa está revisando su lista de niños buenos. ¿Estás en ella? ¡Ho Ho Ho!`;
    } else if (days <= 14) {
        message = `${SOUNDS.bells} Faltan ${days} días, ${hours} horas y ${minutes} minutos para Nochebuena. ${pause(300)} Los elfos están trabajando muy duro en los juguetes. ${pause(200)} ¡La magia de la Navidad se siente en el aire!`;
    } else if (days <= 24) {
        message = `Quedan ${days} días para Nochebuena. ${pause(200)} También quedan ${hours} horas y ${minutes} minutos. ${pause(300)} ¡Es el momento perfecto para empezar a decorar y escribir tu carta a Santa!`;
    } else {
        message = `Faltan ${days} días para Nochebuena. ${pause(300)} Parece mucho tiempo, ¡pero para Santa Claus pasa volando! ${pause(200)} Los elfos ya empezaron a preparar los telescopios para ver quién se porta bien. ¡Ho Ho Ho!`;
    }

    return message;
};

const CountdownHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CountdownIntent';
    },

    handle(handlerInput) {
        const speechText = wrapSSML(generateCountdownMessage());

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('¿Quieres saber algo más sobre la Navidad? Puedo contarte un cuento, jugar trivia, o ayudarte a escribir tu carta a Santa.')
            .getResponse();
    }
};

module.exports = {
    CountdownHandler,
    calculateCountdown,
    generateCountdownMessage
};
