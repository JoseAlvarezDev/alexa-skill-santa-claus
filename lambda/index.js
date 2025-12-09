/**
 * Skill de Alexa: Santa Claus
 * Handler principal que une todas las funcionalidades
 */

const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

// Importar handlers
const { CountdownHandler } = require('./handlers/countdownHandler');
const {
    WriteLetterHandler, AddGiftHandler, ReadLetterHandler,
    ModifyLetterHandler, RemoveGiftHandler, ClearLetterHandler, SendLetterHandler
} = require('./handlers/letterHandler');
const { TellStoryHandler, NextStoryHandler } = require('./handlers/storiesHandler');
const { TriviaHandler, AnswerHandler } = require('./handlers/triviaHandler');
const { SantaTrackerHandler } = require('./handlers/santaTrackerHandler');
const { AdventCalendarHandler } = require('./handlers/adventHandler');
const {
    NaughtyOrNiceHandler, SantaMessageHandler,
    GiftSuggestionHandler, ChristmasSoundsHandler
} = require('./handlers/extrasHandler');

const { SOUNDS, wrapSSML, pause, getRandomGreeting, getRandomFarewell } = require('./utils/speechUtils');
const { updateVisitStats } = require('./utils/dynamoDBUtils');
const { generateCountdownMessage } = require('./handlers/countdownHandler');

// Adaptador de persistencia DynamoDB
const persistenceAdapter = new DynamoDbPersistenceAdapter({
    tableName: 'SantaClausSkillData',
    createTable: true
});

// Handler de Launch
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const stats = await updateVisitStats(handlerInput);
        const countdown = generateCountdownMessage();

        let welcome;
        if (stats.visits === 1) {
            welcome = `${SOUNDS.bells}${SOUNDS.sleighBells} ¡Ho Ho Ho! ¡Bienvenido al mundo mágico de Santa Claus! ${pause(300)} Soy tu asistente navideño y puedo hacer muchas cosas por ti. ${pause(200)}`;
        } else {
            welcome = `${SOUNDS.bells} ¡Ho Ho Ho! ${getRandomGreeting()} ¡Qué alegría verte de nuevo! Esta es tu visita número ${stats.visits}. ${pause(300)}`;
        }

        const countdownBrief = countdown.replace(SOUNDS.bells, '').replace(SOUNDS.sleighBells, '').substring(0, 150);

        const options = `${pause(400)} Puedo ayudarte a escribir tu carta a Santa, contarte cuentos navideños, jugar trivia, abrir el calendario de adviento, rastrear a Santa, y mucho más. ${pause(300)} ¿Qué te gustaría hacer?`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(welcome + countdownBrief + options))
            .reprompt('Puedes decir: escribe mi carta, cuéntame un cuento, jugar trivia, abrir el adviento, o ¿cuánto falta para Navidad?')
            .getResponse();
    }
};

// Handler de Ayuda
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const helpText = `${SOUNDS.bells} ¡Claro! Aquí está todo lo que puedo hacer: ${pause(400)} 
    Cuenta regresiva: pregunta cuánto falta para Navidad. ${pause(200)}
    Carta a Santa: escribe, lee o modifica tu carta. ${pause(200)}
    Cuentos: pídeme que te cuente un cuento navideño. ${pause(200)}
    Trivia: di "jugar trivia" para poner a prueba tus conocimientos. ${pause(200)}
    Calendario de adviento: abre una sorpresa cada día de diciembre. ${pause(200)}
    Seguimiento de Santa: pregunta dónde está Santa ahora. ${pause(200)}
    Sugerencias de regalos: pide ideas para mamá, papá, o cualquier persona. ${pause(200)}
    Lista de buenos: pregunta si estás en la lista de niños buenos. ${pause(400)}
    ¿Qué te gustaría hacer?`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(helpText))
            .reprompt('¿Qué te gustaría hacer?')
            .getResponse();
    }
};

// Handlers de control
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells} ${getRandomFarewell()} ${SOUNDS.sleighBells}`))
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (sessionAttributes.playingTrivia) {
            return TriviaHandler.handle(handlerInput);
        }

        return handlerInput.responseBuilder
            .speak(wrapSSML(`¡Genial! ¿Qué te gustaría hacer? Puedo contarte un cuento, jugar trivia, o ayudarte con tu carta a Santa.`))
            .reprompt('¿Qué prefieres hacer?')
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells} Está bien. Si necesitas algo, aquí estaré. ${getRandomFarewell()}`))
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(wrapSSML(`Hmm, no entendí eso. ${pause(200)} Puedes pedirme la cuenta regresiva, escribir tu carta, un cuento, trivia, o el calendario de adviento. ¿Qué prefieres?`))
            .reprompt('¿Qué te gustaría hacer?')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() { return true; },
    handle(handlerInput, error) {
        console.log(`Error: ${error.message}`);
        return handlerInput.responseBuilder
            .speak(wrapSSML(`${SOUNDS.bells} ¡Ups! Algo salió mal. ¿Puedes intentarlo de nuevo?`))
            .reprompt('¿Qué te gustaría hacer?')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CountdownHandler,
        WriteLetterHandler, AddGiftHandler, ReadLetterHandler,
        ModifyLetterHandler, RemoveGiftHandler, ClearLetterHandler, SendLetterHandler,
        TellStoryHandler, NextStoryHandler,
        TriviaHandler, AnswerHandler,
        SantaTrackerHandler,
        AdventCalendarHandler,
        NaughtyOrNiceHandler, SantaMessageHandler, GiftSuggestionHandler, ChristmasSoundsHandler,
        HelpIntentHandler,
        YesIntentHandler, NoIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
