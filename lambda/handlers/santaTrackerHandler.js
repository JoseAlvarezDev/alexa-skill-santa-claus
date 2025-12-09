/**
 * Handler para el seguimiento de Santa Claus
 * Incluye distancias, días restantes y datos divertidos
 */

const { SOUNDS, wrapSSML, pause } = require('../utils/speechUtils');

/**
 * Ubicaciones simuladas para el viaje de Santa
 */
const SANTA_LOCATIONS = {
    beforeChristmas: [
        { location: 'Polo Norte', activity: 'preparando su trineo y revisando la lista de niños buenos', distance: 6200 },
        { location: 'el taller de los elfos', activity: 'supervisando los últimos juguetes', distance: 6200 },
        { location: 'el establo de los renos', activity: 'alimentando a Rodolfo y sus amigos', distance: 6200 },
        { location: 'su oficina', activity: 'leyendo las cartas de los niños', distance: 6200 }
    ],
    christmasEve: [
        { location: 'Nueva Zelanda', activity: 'comenzando su viaje por el Pacífico', distance: 18500 },
        { location: 'Australia', activity: 'entregando regalos a los niños de Sydney', distance: 17100 },
        { location: 'Japón', activity: 'volando sobre el Monte Fuji', distance: 10800 },
        { location: 'China', activity: 'visitando millones de hogares', distance: 9200 },
        { location: 'India', activity: 'dejando regalos en Mumbai', distance: 7500 },
        { location: 'Rusia', activity: 'cruzando Siberia a toda velocidad', distance: 5000 },
        { location: 'Europa del Este', activity: 'volando sobre las capitales europeas', distance: 2800 },
        { location: 'España', activity: '¡está muy cerca de ti! ¡Prepara las galletas!', distance: 0 },
        { location: 'Reino Unido', activity: 'visitando Londres y sus alrededores', distance: 1400 },
        { location: 'el Atlántico', activity: 'cruzando el océano hacia América', distance: 5000 },
        { location: 'Brasil', activity: 'entregando regalos en Sudamérica', distance: 8000 },
        { location: 'Estados Unidos', activity: 'recorriendo de costa a costa', distance: 7500 },
        { location: 'Canadá', activity: 'preparándose para volver al Polo Norte', distance: 7000 }
    ]
};

/**
 * Datos curiosos sobre Santa y su viaje
 */
const FUN_FACTS = [
    'Los renos de Santa pueden viajar a más de 3.000 kilómetros por segundo para entregar todos los regalos.',
    'Santa tiene que visitar aproximadamente 900 millones de hogares en una sola noche.',
    'El trineo de Santa puede transportar regalos para 2.000 millones de niños.',
    'Rodolfo, el reno de la nariz roja, se unió al equipo en 1939.',
    'Los elfos fabrican aproximadamente 1.000 juguetes por segundo durante todo el año.',
    'Santa consume alrededor de 150.000 millones de calorías en galletas cada Nochebuena.',
    'El trineo mágico de Santa no necesita combustible, ¡funciona con espíritu navideño!'
];

/**
 * Calcula los días y horas hasta Nochebuena
 */
const getTimeUntilChristmas = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let christmas = new Date(currentYear, 11, 24, 18, 0, 0); // 24 dic a las 18:00

    if (now > christmas) {
        christmas = new Date(currentYear + 1, 11, 24, 18, 0, 0);
    }

    const diff = christmas - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isChristmasEve: days === 0 && hours <= 24 };
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
        if (hour < 18) {
            return {
                location: 'el Polo Norte',
                activity: 'haciendo los últimos preparativos para su viaje épico',
                distance: 6200,
                isChristmasEve: true,
                isFlying: false
            };
        }

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
                distance: 7000,
                isChristmasEve: true,
                isFlying: true
            };
        }

        return {
            location: 'de vuelta en el Polo Norte',
            activity: 'descansando con una taza de chocolate caliente. ¡Misión cumplida!',
            distance: 6200,
            isChristmasEve: false,
            isFlying: false
        };
    }

    // Después del 25
    return {
        location: 'el Polo Norte',
        activity: 'descansando y planificando el próximo año',
        distance: 6200,
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
        const timeLeft = getTimeUntilChristmas();
        const funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
        let speechText;

        if (santa.isFlying) {
            const distanceText = santa.distance > 0
                ? `Está a unos ${santa.distance} kilómetros de España.`
                : '¡Santa está sobrevolando España ahora mismo!';

            speechText = `${SOUNDS.sleighBells}${SOUNDS.wind} ¡Santa Claus está volando ahora mismo! ${pause(300)} En este momento se encuentra sobre ${santa.location}, ${santa.activity}. ${pause(300)} ${distanceText} ${pause(400)} Los renos van a toda velocidad con Rodolfo liderando el camino. ${pause(300)} Dato curioso: ${funFact} ${pause(300)} ¡Ho Ho Ho!`;
        } else if (santa.isChristmasEve) {
            speechText = `${SOUNDS.bells} ¡Hoy es Nochebuena! ${pause(300)} Santa Claus está en ${santa.location}, ${santa.activity}. ${pause(300)} Faltan solo ${timeLeft.hours} horas y ${timeLeft.minutes} minutos para que despegue. ${pause(400)} Desde España hasta el Polo Norte hay unos ${santa.distance} kilómetros. ¡Pero el trineo mágico los recorre en segundos! ${pause(300)} ¡Prepara las galletas y las zanahorias!`;
        } else {
            // Mensaje ingenioso basado en los días que faltan
            let countdownMessage;
            if (timeLeft.days > 20) {
                countdownMessage = `Todavía faltan ${timeLeft.days} días para Nochebuena. ¡Santa tiene tiempo de sobra!`;
            } else if (timeLeft.days > 10) {
                countdownMessage = `¡Solo faltan ${timeLeft.days} días! Los elfos ya están a tope de trabajo.`;
            } else if (timeLeft.days > 5) {
                countdownMessage = `¡Atención! Solo ${timeLeft.days} días para Nochebuena. El taller está a máxima capacidad.`;
            } else if (timeLeft.days > 1) {
                countdownMessage = `¡Solo ${timeLeft.days} días! Puedo escuchar a los renos calentando motores.`;
            } else {
                countdownMessage = `¡Mañana es Nochebuena! Santa está repasando la lista por última vez.`;
            }

            speechText = `${SOUNDS.bells} ${pause(200)} Ahora mismo, Santa Claus está en ${santa.location}, ${santa.activity}. ${pause(400)} ${countdownMessage} ${pause(300)} Él está a unos ${santa.distance} kilómetros de distancia, en el Polo Norte. ${pause(300)} Dato curioso: ${funFact} ${pause(300)} ¿Quieres saber algo más?`;
        }

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres saber más sobre Santa o hacer otra cosa?')
            .getResponse();
    }
};

module.exports = {
    SantaTrackerHandler,
    getSantaLocation
};
