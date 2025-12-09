# 🎅 Skill de Alexa: Santa Claus

Un skill completo de Alexa para vivir la magia de la Navidad. Incluye cuenta regresiva, carta a Santa, cuentos navideños, trivial, calendario de adviento, seguimiento de Santa y mucho más.

## ✨ Funcionalidades

### ⏰ Cuenta Regresiva a Navidad
- "Alexa, ¿cuánto falta para Navidad?"
- Mensajes dinámicos según los días restantes
- Actualizaciones especiales en Nochebuena

### ✉️ Carta a Santa Claus
- **Escribir**: "Alexa, quiero escribir mi carta a Santa"
- **Añadir regalos**: "Alexa, añade una bicicleta a mi carta"
- **Leer**: "Alexa, lee mi carta a Santa"
- **Modificar**: "Alexa, quiero cambiar mi carta"
- **Eliminar regalos**: "Alexa, quita la bicicleta de mi lista"
- **Enviar**: "Alexa, envía mi carta a Santa"

### 📚 Cuentos Navideños
- 6 cuentos originales con efectos de sonido
- "Alexa, cuéntame un cuento de Navidad"
- Seguimiento de cuentos ya escuchados

### 🎮 Trivial Navideño
- 15 preguntas sobre tradiciones navideñas
- Sistema de puntuación persistente
- "Alexa, juguemos trivial navideño"

### 🦌 Seguimiento de Santa
- "Alexa, ¿dónde está Santa ahora?"
- Ubicación dinámica según fecha/hora
- Mensajes especiales el 24 de diciembre

### 📅 Calendario de Adviento
- Una sorpresa cada día del 1 al 24 de diciembre
- Chistes, datos curiosos, actividades y villancicos
- "Alexa, abre el calendario de adviento"

### ⭐ Lista de Buenos/Traviesos
- "Alexa, ¿estoy en la lista de niños buenos?"
- Respuestas motivacionales de Santa

### 🎁 Sugerencias de Regalos
- "Alexa, dame ideas de regalos para mamá"
- Sugerencias para: mamá, papá, hermanos, abuelos, amigos, pareja, etc.

### 💬 Mensajes de Santa
- "Alexa, ¿qué dice Santa sobre mí?"
- Mensajes motivacionales personalizados

### 🔔 Sonidos Navideños
- "Alexa, pon sonidos navideños"
- Cascabeles, campanas y más

## 🛠️ Estructura del Proyecto

```
santa-claus-skill/
├── lambda/
│   ├── index.js                    # Handler principal
│   ├── handlers/
│   │   ├── countdownHandler.js     # Cuenta regresiva
│   │   ├── letterHandler.js        # Carta a Santa
│   │   ├── storiesHandler.js       # Cuentos navideños
│   │   ├── triviaHandler.js        # Trivia
│   │   ├── santaTrackerHandler.js  # Seguimiento de Santa
│   │   ├── adventHandler.js        # Calendario de adviento
│   │   └── extrasHandler.js        # Mensajes, sugerencias, sonidos
│   ├── utils/
│   │   ├── speechUtils.js          # Utilidades de SSML
│   │   └── dynamoDBUtils.js        # Persistencia
│   └── data/
│       ├── stories.json            # Cuentos
│       ├── trivia.json             # Preguntas
│       ├── advent.json             # Calendario de adviento
│       ├── giftSuggestions.json    # Sugerencias de regalos
│       └── santaMessages.json      # Mensajes de Santa
├── interactionModels/
│   └── es-ES.json                  # Modelo de interacción español
├── skill.json                      # Manifest del skill
├── package.json
└── README.md
```

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/josealvarezdev/santa-claus-skill.git
cd santa-claus-skill
```

### 2. Instalar dependencias
```bash
cd lambda
npm install
```

### 3. Configurar AWS Lambda
1. Crear una función Lambda en AWS
2. Subir el contenido de la carpeta `lambda/`
3. Configurar el trigger de Alexa Skills Kit

### 4. Crear tabla DynamoDB
El skill creará automáticamente la tabla `SantaClausSkillData`.

### 5. Crear el Skill en Alexa Developer Console
1. Crear nuevo skill custom
2. Copiar el contenido de `interactionModels/es-ES.json`
3. Configurar el endpoint con el ARN de Lambda
4. Actualizar `skill.json` con tu ARN

## 📝 Frases de Ejemplo

| Funcionalidad | Frases |
|---------------|--------|
| Abrir skill | "Alexa, abre Santa Claus" |
| Cuenta regresiva | "¿Cuánto falta para Navidad?" |
| Escribir carta | "Quiero escribir mi carta a Santa" |
| Añadir regalo | "Añade una muñeca a mi carta" |
| Leer carta | "Lee mi carta a Santa" |
| Cuento | "Cuéntame un cuento de Navidad" |
| Trivial | "Juguemos trivial navideño" |
| Adviento | "Abre el calendario de adviento" |
| Rastrear Santa | "¿Dónde está Santa ahora?" |
| Lista buenos | "¿Estoy en la lista de niños buenos?" |
| Sugerencias | "Dame ideas de regalos para papá" |

## 🎵 Efectos de Sonido

El skill utiliza la Sound Library de Alexa:
- 🔔 Campanas navideñas
- 🛷 Cascabeles de trineo
- ✨ Efectos mágicos
- 🌬️ Viento invernal
- 🎉 Celebraciones

## 📊 Persistencia

El skill guarda en DynamoDB:
- ✉️ Carta a Santa (regalos, fecha de envío)
- 📊 Progreso del trivial (puntuación, preguntas respondidas)
- 📚 Cuentos escuchados
- 📅 Ventanas de adviento abiertas
- 📈 Estadísticas de visitas

## 🌍 Idiomas Soportados

- 🇪🇸 Español (España) - es-ES
- 🇲🇽 Español (México) - es-MX

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 👨‍💻 Autor

Jose Alvarez Dev

---

**¡Ho Ho Ho! ¡Feliz Navidad!** 🎄🎅🦌
