/**
 * Utilidades para persistencia con DynamoDB
 */

/**
 * Obtiene los atributos persistentes del usuario
 */
const getPersistentAttributes = async (handlerInput) => {
    const attributesManager = handlerInput.attributesManager;
    try {
        const attributes = await attributesManager.getPersistentAttributes() || {};
        return attributes;
    } catch (error) {
        console.log('Error getting persistent attributes:', error);
        return {};
    }
};

/**
 * Guarda los atributos persistentes del usuario
 */
const savePersistentAttributes = async (handlerInput, attributes) => {
    const attributesManager = handlerInput.attributesManager;
    attributesManager.setPersistentAttributes(attributes);
    await attributesManager.savePersistentAttributes();
};

/**
 * Obtiene la carta del usuario
 */
const getLetter = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.letter || { gifts: [], createdAt: null, sentAt: null };
};

/**
 * Guarda la carta del usuario
 */
const saveLetter = async (handlerInput, letter) => {
    const attributes = await getPersistentAttributes(handlerInput);
    attributes.letter = letter;
    await savePersistentAttributes(handlerInput, attributes);
};

/**
 * Añade un regalo a la carta
 */
const addGiftToLetter = async (handlerInput, gift) => {
    const letter = await getLetter(handlerInput);

    if (!letter.gifts.includes(gift.toLowerCase())) {
        letter.gifts.push(gift.toLowerCase());
        if (!letter.createdAt) {
            letter.createdAt = new Date().toISOString();
        }
        letter.updatedAt = new Date().toISOString();
        await saveLetter(handlerInput, letter);
        return true;
    }
    return false;
};

/**
 * Elimina un regalo de la carta
 */
const removeGiftFromLetter = async (handlerInput, gift) => {
    const letter = await getLetter(handlerInput);
    const giftLower = gift.toLowerCase();
    const index = letter.gifts.findIndex(g => g.includes(giftLower) || giftLower.includes(g));

    if (index > -1) {
        letter.gifts.splice(index, 1);
        letter.updatedAt = new Date().toISOString();
        await saveLetter(handlerInput, letter);
        return true;
    }
    return false;
};

/**
 * Limpia la carta del usuario
 */
const clearLetter = async (handlerInput) => {
    await saveLetter(handlerInput, { gifts: [], createdAt: null, sentAt: null });
};

/**
 * Marca la carta como enviada
 */
const markLetterAsSent = async (handlerInput) => {
    const letter = await getLetter(handlerInput);
    letter.sentAt = new Date().toISOString();
    await saveLetter(handlerInput, letter);
};

/**
 * Obtiene el progreso de la trivia
 */
const getTriviaProgress = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.trivia || {
        questionsAnswered: 0,
        correctAnswers: 0,
        currentQuestionIndex: null,
        answeredQuestions: []
    };
};

/**
 * Guarda el progreso de la trivia
 */
const saveTriviaProgress = async (handlerInput, triviaProgress) => {
    const attributes = await getPersistentAttributes(handlerInput);
    attributes.trivia = triviaProgress;
    await savePersistentAttributes(handlerInput, attributes);
};

/**
 * Obtiene los cuentos leídos
 */
const getStoriesRead = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.storiesRead || [];
};

/**
 * Marca un cuento como leído
 */
const markStoryAsRead = async (handlerInput, storyId) => {
    const attributes = await getPersistentAttributes(handlerInput);
    if (!attributes.storiesRead) {
        attributes.storiesRead = [];
    }
    if (!attributes.storiesRead.includes(storyId)) {
        attributes.storiesRead.push(storyId);
        await savePersistentAttributes(handlerInput, attributes);
    }
};

/**
 * Obtiene las ventanas del adviento abiertas
 */
const getAdventWindowsOpened = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.adventWindows || [];
};

/**
 * Marca una ventana del adviento como abierta
 */
const openAdventWindow = async (handlerInput, day) => {
    const attributes = await getPersistentAttributes(handlerInput);
    if (!attributes.adventWindows) {
        attributes.adventWindows = [];
    }
    if (!attributes.adventWindows.includes(day)) {
        attributes.adventWindows.push(day);
        await savePersistentAttributes(handlerInput, attributes);
        return true; // Nueva ventana abierta
    }
    return false; // Ya estaba abierta
};

/**
 * Obtiene las estadísticas del usuario
 */
const getUserStats = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.stats || {
        visits: 0,
        firstVisit: null,
        lastVisit: null
    };
};

/**
 * Actualiza las estadísticas de visita
 */
const updateVisitStats = async (handlerInput) => {
    const attributes = await getPersistentAttributes(handlerInput);
    if (!attributes.stats) {
        attributes.stats = {
            visits: 0,
            firstVisit: null,
            lastVisit: null
        };
    }

    attributes.stats.visits += 1;
    if (!attributes.stats.firstVisit) {
        attributes.stats.firstVisit = new Date().toISOString();
    }
    attributes.stats.lastVisit = new Date().toISOString();

    await savePersistentAttributes(handlerInput, attributes);
    return attributes.stats;
};

module.exports = {
    getPersistentAttributes,
    savePersistentAttributes,
    getLetter,
    saveLetter,
    addGiftToLetter,
    removeGiftFromLetter,
    clearLetter,
    markLetterAsSent,
    getTriviaProgress,
    saveTriviaProgress,
    getStoriesRead,
    markStoryAsRead,
    getAdventWindowsOpened,
    openAdventWindow,
    getUserStats,
    updateVisitStats
};
