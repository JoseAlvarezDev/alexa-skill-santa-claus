/**
 * Handler para lista buenos/traviesos, mensajes de Santa, sugerencias y sonidos
 */

const { SOUNDS, wrapSSML, pause } = require('../utils/speechUtils');
const santaMessages = require('../data/santaMessages.json');
const giftSuggestions = require('../data/giftSuggestions.json');

const NaughtyOrNiceHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NaughtyOrNiceIntent';
    },
    handle(handlerInput) {
        const responses = santaMessages.niceListResponses;
        const msg = responses[Math.floor(Math.random() * responses.length)];
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells}${SOUNDS.magic} ${msg}`))
            .reprompt('¿Hay algo más?')
            .getResponse();
    }
};

const SantaMessageHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SantaMessageIntent';
    },
    handle(handlerInput) {
        const msgs = santaMessages.messages;
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells} ${msg}`))
            .reprompt('¿Quieres otro mensaje de Santa?')
            .getResponse();
    }
};

const GiftSuggestionHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GiftSuggestionIntent';
    },
    handle(handlerInput) {
        const person = handlerInput.requestEnvelope.request.intent.slots.person?.value || 'amigo';
        const suggestions = giftSuggestions.suggestions[person] || giftSuggestions.suggestions['amigo'];
        const selected = [];
        const copy = [...suggestions];
        for (let i = 0; i < 3 && copy.length > 0; i++) {
            const idx = Math.floor(Math.random() * copy.length);
            selected.push(copy.splice(idx, 1)[0]);
        }
        const list = selected.join(`, ${pause(200)}`);
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells} Ideas de regalos para ${person}: ${pause(300)} ${list}. ${pause(300)} ¿Te gustan estas ideas?`))
            .reprompt('¿Quieres más sugerencias?')
            .getResponse();
    }
};

const ChristmasSoundsHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ChristmasSoundsIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.sleighBells}${SOUNDS.bells} ¡Ho Ho Ho! ${pause(300)} ${SOUNDS.magic} ¡Feliz Navidad!`))
            .reprompt('¿Qué más te gustaría escuchar?')
            .getResponse();
    }
};

module.exports = {
    NaughtyOrNiceHandler,
    SantaMessageHandler,
    GiftSuggestionHandler,
    ChristmasSoundsHandler
};
