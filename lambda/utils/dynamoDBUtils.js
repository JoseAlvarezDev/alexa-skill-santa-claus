/**
 * Utilidades de persistencia para Alexa-Hosted (S3)
 */

// Obtener atributos persistentes
async function getPersistentAttributes(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const attributes = await attributesManager.getPersistentAttributes() || {};
    return attributes;
}

// Guardar atributos persistentes
async function savePersistentAttributes(handlerInput, attributes) {
    const attributesManager = handlerInput.attributesManager;
    attributesManager.setPersistentAttributes(attributes);
    await attributesManager.savePersistentAttributes();
}

// ========== CARTA A SANTA ==========

// Obtener carta a Santa
async function getLetter(handlerInput) {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.letter || { gifts: [], createdAt: null, sentAt: null };
}

// Guardar carta a Santa
async function saveLetter(handlerInput, letter) {
    const attributes = await getPersistentAttributes(handlerInput);
    attributes.letter = letter;
    await savePersistentAttributes(handlerInput, attributes);
}

// Añadir regalo a la carta
async function addGiftToLetter(handlerInput, gift) {
    const letter = await getLetter(handlerInput);
    if (!letter.gifts.includes(gift.toLowerCase())) {
        letter.gifts.push(gift.toLowerCase());
        if (!letter.createdAt) {
            letter.createdAt = new Date().toISOString();
        }
        await saveLetter(handlerInput, letter);
        return true;
    }
    return false;
}

// Eliminar regalo de la carta
async function removeGiftFromLetter(handlerInput, gift) {
    const letter = await getLetter(handlerInput);
    const giftLower = gift.toLowerCase();
    const index = letter.gifts.findIndex(g => g.includes(giftLower) || giftLower.includes(g));
    if (index > -1) {
        letter.gifts.splice(index, 1);
        await saveLetter(handlerInput, letter);
        return true;
    }
    return false;
}

// Limpiar carta
async function clearLetter(handlerInput) {
    await saveLetter(handlerInput, { gifts: [], createdAt: null, sentAt: null });
}

// Marcar carta como enviada
async function markLetterAsSent(handlerInput) {
    const letter = await getLetter(handlerInput);
    letter.sentAt = new Date().toISOString();
    await saveLetter(handlerInput, letter);
}

// ========== TRIVIAL ==========

// Obtener progreso del trivial
async function getTriviaProgress(handlerInput) {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.trivia || {
        questionsAnswered: 0,
        correctAnswers: 0,
        currentQuestionIndex: null,
        answeredQuestions: []
    };
}

// Guardar progreso del trivial
async function saveTriviaProgress(handlerInput, progress) {
    const attributes = await getPersistentAttributes(handlerInput);
    attributes.trivia = progress;
    await savePersistentAttributes(handlerInput, attributes);
}

// ========== CUENTOS ==========

// Obtener cuentos leídos
async function getStoriesRead(handlerInput) {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.storiesRead || [];
}

// Marcar cuento como leído
async function markStoryAsRead(handlerInput, storyId) {
    const attributes = await getPersistentAttributes(handlerInput);
    if (!attributes.storiesRead) attributes.storiesRead = [];
    if (!attributes.storiesRead.includes(storyId)) {
        attributes.storiesRead.push(storyId);
    }
    await savePersistentAttributes(handlerInput, attributes);
}

// ========== CALENDARIO DE ADVIENTO ==========

// Obtener ventanas de adviento abiertas
async function getAdventWindowsOpened(handlerInput) {
    const attributes = await getPersistentAttributes(handlerInput);
    return attributes.adventOpened || [];
}

// Abrir ventana de adviento
async function openAdventWindow(handlerInput, day) {
    const attributes = await getPersistentAttributes(handlerInput);
    if (!attributes.adventOpened) attributes.adventOpened = [];
    if (!attributes.adventOpened.includes(day)) {
        attributes.adventOpened.push(day);
        await savePersistentAttributes(handlerInput, attributes);
        return true; // Nueva ventana
    }
    return false; // Ya estaba abierta
}

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
    openAdventWindow
};