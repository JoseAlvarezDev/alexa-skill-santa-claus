/**
 * Handler para cuentos navideños
 */

const { SOUNDS, wrapSSML, pause } = require('../utils/speechUtils');
const { getStoriesRead, markStoryAsRead } = require('../utils/dynamoDBUtils');
const storiesData = require('../data/stories.json');

/**
 * Obtiene un cuento que el usuario no haya escuchado
 */
const getUnreadStory = async (handlerInput) => {
    const storiesRead = await getStoriesRead(handlerInput);
    const allStories = storiesData.stories;

    // Buscar un cuento no leído
    const unreadStories = allStories.filter(story => !storiesRead.includes(story.id));

    if (unreadStories.length > 0) {
        // Devolver uno aleatorio de los no leídos
        return unreadStories[Math.floor(Math.random() * unreadStories.length)];
    }

    // Si ya los leyó todos, devolver uno aleatorio
    return allStories[Math.floor(Math.random() * allStories.length)];
};

/**
 * Handler para contar un cuento
 */
const TellStoryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TellStoryIntent';
    },

    async handle(handlerInput) {
        const story = await getUnreadStory(handlerInput);
        await markStoryAsRead(handlerInput, story.id);

        // Guardar en sesión para saber qué cuento se contó
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.lastStoryId = story.id;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const intro = `${SOUNDS.magic} Hoy te voy a contar la historia de ${story.title}. ${pause(500)} Ponte cómodo y escucha... ${pause(800)}`;
        const outro = `${pause(800)} Y colorín colorado, este cuento se ha acabado. ${pause(300)} ¿Te gustó? Puedo contarte otro cuento, o hacer algo diferente. ¿Qué prefieres?`;

        const speechText = intro + story.content + outro;

        return handlerInput.responseBuilder
            .speak(wrapSSML(speechText))
            .reprompt('¿Quieres escuchar otro cuento, o prefieres hacer otra cosa?')
            .getResponse();
    }
};

/**
 * Handler para pedir otro cuento
 */
const NextStoryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NextStoryIntent';
    },

    async handle(handlerInput) {
        const storiesRead = await getStoriesRead(handlerInput);
        const allStories = storiesData.stories;

        // Verificar cuántos cuentos quedan
        const unreadCount = allStories.filter(s => !storiesRead.includes(s.id)).length;

        if (unreadCount === 0) {
            const speechText = `${SOUNDS.bells} ¡Vaya! Ya has escuchado todos los cuentos que tengo. ${pause(200)} Pero no te preocupes, los cuentos son como la Navidad: siempre es bonito volver a disfrutarlos. ¿Quieres que te cuente uno de nuevo?`;

            return handlerInput.responseBuilder
                .speak(wrapSSML(speechText))
                .reprompt('¿Quieres escuchar un cuento otra vez?')
                .getResponse();
        }

        // Reutilizar el handler de TellStory
        return TellStoryHandler.handle(handlerInput);
    }
};

module.exports = {
    TellStoryHandler,
    NextStoryHandler
};
