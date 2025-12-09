/**
 * Handler para el Calendario de Adviento
 */

const { SOUNDS, wrapSSML, pause } = require('../utils/speechUtils');
const { getAdventWindowsOpened, openAdventWindow } = require('../utils/dynamoDBUtils');
const adventData = require('../data/advent.json');

const AdventCalendarHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AdventCalendarIntent';
    },

    async handle(handlerInput) {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();

        if (month !== 11) {
            return handlerInput.responseBuilder
                .speak(wrapSSML(`${SOUNDS.bells} El calendario de adviento comienza el 1 de diciembre. ¡Vuelve pronto!`))
                .reprompt('¿Qué te gustaría hacer?')
                .getResponse();
        }

        if (day > 24) {
            return handlerInput.responseBuilder
                .speak(wrapSSML(`${SOUNDS.bells} El calendario de adviento ya terminó. ¡Feliz Navidad!`))
                .reprompt('¿Qué te gustaría hacer?')
                .getResponse();
        }

        const todayContent = adventData.calendar.find(item => item.day === day);
        const isNewWindow = await openAdventWindow(handlerInput, day);

        let intro = isNewWindow
            ? `${SOUNDS.magic} ¡Día ${day}! Abriendo ventana... ${pause(400)}`
            : `${SOUNDS.bells} Ya abriste el día ${day}: ${pause(300)}`;

        const speechText = intro + todayContent.content;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Hay algo más?')
            .getResponse();
    }
};

module.exports = { AdventCalendarHandler };
