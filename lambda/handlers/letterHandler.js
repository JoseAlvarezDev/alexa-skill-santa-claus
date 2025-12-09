/**
 * Handler para la carta a Santa Claus
 * Incluye: escribir, leer, modificar, añadir/eliminar regalos, y enviar carta
 */

const { SOUNDS, wrapSSML, pause, formatList, getRandomGreeting } = require('../utils/speechUtils');
const {
    getLetter,
    addGiftToLetter,
    removeGiftFromLetter,
    clearLetter,
    markLetterAsSent
} = require('../utils/dynamoDBUtils');

/**
 * Handler para iniciar a escribir una carta
 */
const WriteLetterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WriteLetterIntent';
    },

    async handle(handlerInput) {
        const letter = await getLetter(handlerInput);
        let speechText;

        if (letter.gifts && letter.gifts.length > 0) {
            speechText = `${SOUNDS.bells} ¡Hola! Veo que ya tienes una carta empezada con ${letter.gifts.length} ${letter.gifts.length === 1 ? 'regalo' : 'regalos'}. ${pause(300)} ¿Quieres añadir más regalos a tu lista? Solo dime qué te gustaría pedir a Santa.`;
        } else {
            speechText = `${SOUNDS.bells} ¡Qué emocionante! ${pause(200)} Vamos a escribir tu carta a Santa Claus. ${pause(300)} Dime qué regalo te gustaría pedir. Puedes decir algo como: "quiero una bicicleta" o "añade un videojuego". ${pause(300)} ¿Qué le pedirás a Santa?`;
        }

        // Guardar estado de sesión para saber que estamos escribiendo la carta
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.writingLetter = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Qué regalo te gustaría añadir a tu carta para Santa?')
            .getResponse();
    }
};

/**
 * Handler para añadir un regalo a la carta
 */
const AddGiftHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddGiftIntent';
    },

    async handle(handlerInput) {
        const gift = handlerInput.requestEnvelope.request.intent.slots.gift?.value;

        if (!gift) {
            return handlerInput.responseBuilder
                .speak(wrapSSML('No entendí qué regalo quieres añadir. ¿Puedes decírmelo de nuevo?'))
                .reprompt('¿Qué regalo te gustaría pedir a Santa?')
                .getResponse();
        }

        const added = await addGiftToLetter(handlerInput, gift);
        const letter = await getLetter(handlerInput);

        let speechText;
        if (added) {
            const confirmations = [
                `¡Perfecto! He añadido "${gift}" a tu carta.`,
                `¡Excelente elección! "${gift}" ahora está en tu lista.`,
                `¡Ho ho ho! Santa tomó nota de "${gift}".`,
                `¡Genial! He apuntado "${gift}" en tu carta.`
            ];
            const randomConfirm = confirmations[Math.floor(Math.random() * confirmations.length)];

            speechText = `${SOUNDS.magic} ${randomConfirm} ${pause(300)} Ahora tienes ${letter.gifts.length} ${letter.gifts.length === 1 ? 'regalo' : 'regalos'} en tu lista. ¿Quieres añadir algo más, o prefieres que lea tu carta?`;
        } else {
            speechText = `Parece que "${gift}" ya está en tu carta. ¿Quieres añadir otro regalo diferente?`;
        }

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres añadir otro regalo o leer tu carta?')
            .getResponse();
    }
};

/**
 * Handler para leer la carta
 */
const ReadLetterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReadLetterIntent';
    },

    async handle(handlerInput) {
        const letter = await getLetter(handlerInput);

        if (!letter.gifts || letter.gifts.length === 0) {
            const speechText = `${SOUNDS.bells} Todavía no has escrito nada en tu carta a Santa. ${pause(300)} ¿Quieres empezar ahora? Solo dime qué regalo te gustaría pedir.`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Qué regalo te gustaría pedir a Santa?')
                .getResponse();
        }

        const giftsList = formatList([...letter.gifts]);

        let statusMessage = '';
        if (letter.sentAt) {
            statusMessage = `Esta carta ya fue enviada a Santa. ${pause(200)}`;
        }

        const speechText = `${SOUNDS.bells}${SOUNDS.magic} Aquí está tu carta a Santa Claus: ${pause(500)} "Querido Santa, este año me he portado muy bien y me gustaría pedir: ${pause(300)} ${giftsList}. ${pause(200)} Con mucho cariño y feliz Navidad." ${pause(500)} ${statusMessage} Tu carta tiene ${letter.gifts.length} ${letter.gifts.length === 1 ? 'regalo' : 'regalos'}. ¿Quieres modificar algo, añadir más regalos, o enviar tu carta a Santa?`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres modificar tu carta, añadir algo más, o enviarla a Santa?')
            .getResponse();
    }
};

/**
 * Handler para modificar la carta
 */
const ModifyLetterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ModifyLetterIntent';
    },

    async handle(handlerInput) {
        const letter = await getLetter(handlerInput);

        if (!letter.gifts || letter.gifts.length === 0) {
            const speechText = `Tu carta está vacía todavía. ¿Quieres empezar a añadir regalos? Solo dime qué te gustaría pedir.`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Qué regalo quieres añadir?')
                .getResponse();
        }

        const giftsList = formatList([...letter.gifts]);

        const speechText = `${SOUNDS.bells} ¡Claro! Vamos a modificar tu carta. ${pause(300)} Actualmente tienes: ${giftsList}. ${pause(400)} Puedes decir "añade" seguido de un regalo para agregar algo nuevo, o "quita" seguido del regalo que ya no quieras. También puedes decir "borrar todo" para empezar de nuevo. ¿Qué te gustaría hacer?`;

        // Guardar estado de sesión
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.modifyingLetter = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Qué cambio quieres hacer en tu carta?')
            .getResponse();
    }
};

/**
 * Handler para eliminar un regalo
 */
const RemoveGiftHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveGiftIntent';
    },

    async handle(handlerInput) {
        const gift = handlerInput.requestEnvelope.request.intent.slots.gift?.value;

        if (!gift) {
            return handlerInput.responseBuilder
                .speak(wrapSSML('No entendí qué regalo quieres quitar. ¿Puedes decírmelo de nuevo?'))
                .reprompt('¿Qué regalo quieres quitar de tu lista?')
                .getResponse();
        }

        const removed = await removeGiftFromLetter(handlerInput, gift);
        const letter = await getLetter(handlerInput);

        let speechText;
        if (removed) {
            if (letter.gifts.length > 0) {
                speechText = `${SOUNDS.magic} ¡Listo! He quitado "${gift}" de tu carta. ${pause(200)} Te quedan ${letter.gifts.length} ${letter.gifts.length === 1 ? 'regalo' : 'regalos'} en tu lista. ¿Quieres hacer más cambios?`;
            } else {
                speechText = `He quitado "${gift}". Tu carta ahora está vacía. ¿Quieres añadir nuevos regalos?`;
            }
        } else {
            speechText = `No encontré "${gift}" en tu carta. ${pause(200)} ¿Quizás lo escribiste de otra manera? Dime exactamente qué regalo quieres quitar.`;
        }

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres hacer algo más con tu carta?')
            .getResponse();
    }
};

/**
 * Handler para borrar toda la carta
 */
const ClearLetterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ClearLetterIntent';
    },

    async handle(handlerInput) {
        await clearLetter(handlerInput);

        const speechText = `${SOUNDS.magic} He borrado tu carta completamente. ${pause(300)} Ahora tienes una carta nueva y vacía. ¿Quieres empezar a escribir tu nueva lista de regalos?`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres añadir regalos a tu nueva carta?')
            .getResponse();
    }
};

/**
 * Handler para enviar la carta a Santa
 */
const SendLetterHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SendLetterIntent';
    },

    async handle(handlerInput) {
        const letter = await getLetter(handlerInput);

        if (!letter.gifts || letter.gifts.length === 0) {
            const speechText = `Tu carta está vacía. Primero necesitas añadir algunos regalos antes de enviarla a Santa. ¿Qué te gustaría pedir?`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Qué regalo quieres añadir a tu carta?')
                .getResponse();
        }

        if (letter.sentAt) {
            const speechText = `${SOUNDS.bells} Tu carta ya fue enviada a Santa Claus. Los elfos la están revisando en este momento. ${pause(300)} Si quieres hacer cambios, puedes modificar tu carta y enviarla de nuevo.`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Quieres modificar tu carta?')
                .getResponse();
        }

        await markLetterAsSent(handlerInput);

        const giftsList = formatList([...letter.gifts]);

        const speechText = `${SOUNDS.sleighBells}${SOUNDS.magic} ¡Tu carta ha sido enviada! ${pause(300)} Los renos mensajeros la llevarán volando hasta el Polo Norte. ${pause(200)} Santa Claus recibirá tu carta con tu lista de ${letter.gifts.length} ${letter.gifts.length === 1 ? 'regalo' : 'regalos'}: ${giftsList}. ${pause(400)} ${SOUNDS.bells} ¡Ho Ho Ho! Santa revisará tu carta con mucho cariño. ¡Recuerda seguir portándote bien!`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Hay algo más en lo que pueda ayudarte?')
            .getResponse();
    }
};

module.exports = {
    WriteLetterHandler,
    AddGiftHandler,
    ReadLetterHandler,
    ModifyLetterHandler,
    RemoveGiftHandler,
    ClearLetterHandler,
    SendLetterHandler
};
