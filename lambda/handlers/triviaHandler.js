/**
 * Handler para la trivia navideña
 */

const { SOUNDS, wrapSSML, pause, getOrdinal } = require('../utils/speechUtils');
const { getTriviaProgress, saveTriviaProgress } = require('../utils/dynamoDBUtils');
const triviaData = require('../data/trivia.json');

/**
 * Obtiene una pregunta nueva que no haya sido respondida
 */
const getNewQuestion = async (handlerInput) => {
    const progress = await getTriviaProgress(handlerInput);
    const allQuestions = triviaData.questions;

    const unanswered = allQuestions.filter(q => !progress.answeredQuestions.includes(q.id));

    if (unanswered.length === 0) {
        // Reiniciar trivia si respondió todas
        progress.answeredQuestions = [];
        await saveTriviaProgress(handlerInput, progress);
        return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    }

    return unanswered[Math.floor(Math.random() * unanswered.length)];
};

/**
 * Formatea las opciones de respuesta
 */
const formatOptions = (options) => {
    return options.map((opt, index) => `${index + 1}: ${opt}`).join('. ');
};

/**
 * Handler para iniciar la trivia
 */
const TriviaHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TriviaIntent';
    },

    async handle(handlerInput) {
        const question = await getNewQuestion(handlerInput);
        const progress = await getTriviaProgress(handlerInput);

        // Guardar la pregunta actual en sesión
        progress.currentQuestionIndex = question.id;
        await saveTriviaProgress(handlerInput, progress);

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.currentQuestion = question;
        sessionAttributes.playingTrivia = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        let intro = `${SOUNDS.bells} ¡Vamos a jugar trivia navideña! ${pause(300)}`;

        if (progress.questionsAnswered > 0) {
            intro += `Hasta ahora has respondido ${progress.questionsAnswered} preguntas y acertaste ${progress.correctAnswers}. ${pause(300)}`;
        }

        const questionText = `Aquí va tu pregunta: ${pause(400)} ${question.question} ${pause(600)} Las opciones son: ${formatOptions(question.options)}. ${pause(300)} ¿Cuál es tu respuesta? Puedes decir el número de la opción.`;

        const speechText = intro + questionText;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt(`Las opciones son: ${formatOptions(question.options)}. ¿Cuál eliges?`)
            .getResponse();
    }
};

/**
 * Handler para responder a la trivia
 */
const AnswerHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent';
    },

    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (!sessionAttributes.playingTrivia || !sessionAttributes.currentQuestion) {
            const speechText = `No hay ninguna pregunta activa. ${pause(200)} ¿Quieres empezar a jugar trivia? Solo di "jugar trivia".`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Quieres jugar trivia navideña?')
                .getResponse();
        }

        const answerSlot = handlerInput.requestEnvelope.request.intent.slots.answer?.value;
        const answer = parseInt(answerSlot);

        if (isNaN(answer) || answer < 1 || answer > 4) {
            const speechText = `No entendí tu respuesta. Por favor, di un número del 1 al 4.`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Cuál es tu respuesta? Di un número del 1 al 4.')
                .getResponse();
        }

        const question = sessionAttributes.currentQuestion;
        const progress = await getTriviaProgress(handlerInput);
        const isCorrect = answer === question.correctAnswer;

        // Actualizar progreso
        progress.questionsAnswered += 1;
        if (!progress.answeredQuestions.includes(question.id)) {
            progress.answeredQuestions.push(question.id);
        }
        if (isCorrect) {
            progress.correctAnswers += 1;
        }
        await saveTriviaProgress(handlerInput, progress);

        // Limpiar pregunta actual
        sessionAttributes.currentQuestion = null;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        let speechText;

        if (isCorrect) {
            const celebrations = [
                `${SOUNDS.cheer} ¡CORRECTO! ¡Muy bien!`,
                `${SOUNDS.magic} ¡Excelente! ¡Acertaste!`,
                `${SOUNDS.bells} ¡Sí! ¡Esa es la respuesta correcta!`,
                `${SOUNDS.celebration} ¡Increíble! ¡Lo sabías!`
            ];
            speechText = celebrations[Math.floor(Math.random() * celebrations.length)];
        } else {
            speechText = `${SOUNDS.wind} Ohh, no es correcto. ${pause(200)} La respuesta correcta era la opción ${question.correctAnswer}: ${question.options[question.correctAnswer - 1]}.`;
        }

        speechText += ` ${pause(300)} ${question.explanation} ${pause(400)} Tu puntuación es ${progress.correctAnswers} de ${progress.questionsAnswered}. ${pause(300)} ¿Quieres otra pregunta?`;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres otra pregunta de trivia?')
            .getResponse();
    }
};

module.exports = {
    TriviaHandler,
    AnswerHandler
};
