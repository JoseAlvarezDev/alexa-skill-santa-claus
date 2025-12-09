/**
 * Handler para el seguimiento de Santa Claus
 * Usa datos simulados y datos de NORAD cuando está disponible
 */

const { SOUNDS, wrapSSML, pause } = require('../utils/speechUtils');

/**
 * Ubicaciones simuladas para el viaje de Santa
 */
const SANTA_LOCATIONS = {
    beforeChristmas: [
        { location: 'Polo Norte', activity: 'preparando su trineo y revisando la lista de niños buenos' },
        { location: 'el taller de los elfos', activity: 'supervisando los últimos juguetes' },
        { location: 'el establo de los renos', activity: 'alimentando a Rodolfo y sus amigos' },
        { location: 'su oficina', activity: 'leyendo las cartas de los niños' }
    ],
    christmasEve: [
        { location: 'Nueva Zelanda', activity: 'comenzando su viaje por el Pacífico' },
        { location: 'Australia', activity: 'entregando regalos a los niños de Sydney' },
        { location: 'Japón', activity: 'volando sobre el Monte Fuji' },
        { location: 'China', activity: 'visitando millones de hogares' },
        { location: 'India', activity: 'dejando regalos en Mumbai' },
        { location: 'Rusia', activity: 'cruzando Siberia a toda velocidad' },
        { location: 'Europa del Este', activity: 'volando sobre las capitales europeas' },
        { location: 'España', activity: '¡está muy cerca de ti!' },
        { location: 'Reino Unido', activity: 'visitando Londres y sus alrededores' },
        { location: 'el Atlántico', activity: 'cruzando el océano hacia América' },
        { location: 'Brasil', activity: 'entregando regalos en Sudamérica' },
        { location: 'Estados Unidos', activity: 'recorriendo de costa a costa' },
        { location: 'Canadá', activity: 'preparándose para volver al Polo Norte' }
    ]
};

/**
 * Obtiene la ubicación de Santa basada en la fecha y hora
 */
const getSantaLocation = () => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();

    // Si no es diciembre o es antes del 24
    if (month !== 11 || day < 24) {
        const locations = SANTA_LOCATIONS.beforeChristmas;
        const random = Math.floor(Math.random() * locations.length);
        return {
            ...locations[random],
            isChristmasEve: false,
            isFlying: false
        };
    }

    // Es 24 de diciembre
    if (day === 24) {
        // Antes de las 18:00, aún está preparándose
        if (hour < 18) {
            return {
                location: 'el Polo Norte',
                activity: 'haciendo los últimos preparativos para su viaje',
                isChristmasEve: true,
                isFlying: false
            };
        }

        // A partir de las 18:00, está volando
        // Simular ubicación basada en la hora
        const flyingHours = hour - 18;
        const locationIndex = Math.min(flyingHours, SANTA_LOCATIONS.christmasEve.length - 1);

        return {
            ...SANTA_LOCATIONS.christmasEve[locationIndex],
            isChristmasEve: true,
            isFlying: true
        };
    }

    // Es 25 de diciembre
    if (day === 25) {
        if (hour < 8) {
            return {
                location: 'terminando las últimas entregas',
                activity: 'llegando a los últimos hogares de América',
                isChristmasEve: true,
                isFlying: true
            };
        }

        return {
            location: 'de vuelta en el Polo Norte',
            activity: 'descansando después de su largo viaje. ¡Los renos están agotados pero felices!',
            isChristmasEve: false,
            isFlying: false
        };
    }

    // Después del 25
    const locations = SANTA_LOCATIONS.beforeChristmas;
    return {
        location: 'el Polo Norte',
        activity: 'descansando y preparándose para el próximo año',
        isChristmasEve: false,
        isFlying: false
    };
};

/**
 * Handler para rastrear a Santa
 */
const SantaTrackerHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SantaTrackerIntent';
    },

    handle(handlerInput) {
        const santa = getSantaLocation();
        let speechText;

        if (santa.isFlying) {
            speechText = `${SOUNDS.sleighBells}${SOUNDS.wind} ¡Santa Claus está volando ahora mismo! ${pause(300)} En este momento se encuentra sobre ${santa.location}, ${santa.activity}. ${pause(400)} Los renos van a toda velocidad, liderados por Rodolfo y su nariz brillante. ${pause(300)} ${SOUNDS.bells} ¡Ho Ho Ho! ¡Que la magia de la Navidad llegue a tu hogar!`;
        } else if (santa.isChristmasEve) {
            speechText = `${SOUNDS.bells} ¡Hoy es Nochebuena! ${pause(300)} Santa Claus está en ${santa.location}, ${santa.activity}. ${pause(400)} Muy pronto comenzará su viaje mágico alrededor del mundo. ${pause(300)} ¡Recuerda preparar las galletas y las zanahorias para los renos!`;
        } else {
            speechText = `${SOUNDS.bells} Ahora mismo, Santa Claus está en ${santa.location}, ${santa.activity}. ${pause(400)} Los elfos trabajan sin parar para tener todos los juguetes listos. ${pause(300)} ¿Sabías que el 24 de diciembre podrás seguir el viaje de Santa en tiempo real? ¡Es muy emocionante!`;
        }

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Hay algo más que quieras saber sobre Santa?')
            .getResponse();
    }
};

module.exports = {
    SantaTrackerHandler,
    getSantaLocation
};
