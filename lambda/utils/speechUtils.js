/**
 * Utilidades de voz y SSML para el skill de Santa Claus
 */

// Sonidos de la biblioteca de Alexa (funcionan en dispositivos reales)
// Si hay problemas en el simulador, estos se pueden desactivar temporalmente
const SOUNDS = {
    bells: '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_intro_01"/>',
    hohoho: '<audio src="soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01"/>',
    sleighBells: '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02"/>',
    magic: '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_player1_01"/>',
    wind: '<audio src="soundbank://soundlibrary/foley/amzn_sfx_swoosh_fast_1x_01"/>',
    cheer: '<audio src="soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01"/>',
    celebration: '<audio src="soundbank://soundlibrary/musical/amzn_sfx_trumpet_bugle_03"/>'
};

/**
 * Envuelve el texto en etiquetas SSML speak
 */
const wrapSSML = (text) => {
    if (text.startsWith('<speak>')) {
        return text;
    }
    return `<speak>${text}</speak>`;
};

/**
 * Añade la voz de Santa al texto
 * Usa un pitch más bajo y un ritmo un poco más lento para simular a Santa
 */
const santaVoice = (text) => {
    return `<amazon:effect name="whispered"><prosody rate="95%" pitch="-5%">${text}</prosody></amazon:effect>`;
};

/**
 * Añade efectos al texto para hacerlo más festivo
 */
const festiveWrap = (text, addBells = true) => {
    let result = '';
    if (addBells) {
        result += SOUNDS.bells;
    }
    result += text;
    return result;
};

/**
 * Genera un saludo festivo aleatorio
 */
const getRandomGreeting = () => {
    const greetings = [
        '¡Ho Ho Ho!',
        '¡Feliz Navidad!',
        '¡Jo jo jo!',
        '¡Qué alegría verte!',
        '¡Hola, pequeño amigo!'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
};

/**
 * Genera una despedida festiva aleatoria
 */
const getRandomFarewell = () => {
    const farewells = [
        '¡Hasta pronto y feliz Navidad!',
        '¡Ho Ho Ho! ¡Nos vemos pronto!',
        '¡Que tengas un día mágico!',
        '¡Felices fiestas!',
        '¡Hasta la próxima, pequeño amigo!',
        '¡Que la magia de la Navidad te acompañe!'
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
};

/**
 * Añade una pausa SSML
 */
const pause = (milliseconds) => {
    return `<break time="${milliseconds}ms"/>`;
};

/**
 * Enfatiza una palabra o frase
 */
const emphasize = (text, level = 'moderate') => {
    return `<emphasis level="${level}">${text}</emphasis>`;
};

/**
 * Susurra el texto
 */
const whisper = (text) => {
    return `<amazon:effect name="whispered">${text}</amazon:effect>`;
};

/**
 * Genera el SSML completo para una respuesta con efectos de sonido
 */
const buildResponse = (options) => {
    const {
        intro = '',
        mainContent,
        outro = '',
        addBells = false,
        addMagic = false
    } = options;

    let response = '';

    if (addBells) {
        response += SOUNDS.bells;
    }

    if (intro) {
        response += intro + pause(300);
    }

    response += mainContent;

    if (outro) {
        response += pause(300) + outro;
    }

    if (addMagic) {
        response += SOUNDS.magic;
    }

    return wrapSSML(response);
};

/**
 * Formatea una lista de elementos para que suene natural
 */
const formatList = (items) => {
    if (!items || items.length === 0) {
        return 'nada todavía';
    }

    if (items.length === 1) {
        return items[0];
    }

    if (items.length === 2) {
        return `${items[0]} y ${items[1]}`;
    }

    const lastItem = items.pop();
    return `${items.join(', ')}, y ${lastItem}`;
};

/**
 * Genera números ordinales en español
 */
const getOrdinal = (number) => {
    const ordinals = {
        1: 'primera', 2: 'segunda', 3: 'tercera', 4: 'cuarta', 5: 'quinta',
        6: 'sexta', 7: 'séptima', 8: 'octava', 9: 'novena', 10: 'décima',
        11: 'undécima', 12: 'duodécima', 13: 'decimotercera', 14: 'decimocuarta',
        15: 'decimoquinta'
    };
    return ordinals[number] || `número ${number}`;
};

module.exports = {
    SOUNDS,
    wrapSSML,
    santaVoice,
    festiveWrap,
    getRandomGreeting,
    getRandomFarewell,
    pause,
    emphasize,
    whisper,
    buildResponse,
    formatList,
    getOrdinal
};
