// 1. Подключаем библиотеку dotenv для работы с секретами из .env
require('dotenv').config();

// 2. Подключаем Twilio SDK
const twilio = require('twilio');

// 3. Получаем данные из переменных окружения (из файла .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const testNumber = process.env.TEST_NUMBER; // Номер, который вы тестируете
const fromNumber = process.env.TWILIO_NUMBER; // Ваш купленный номер Twilio

// 4. Создаём клиент Twilio
const client = twilio(accountSid, authToken);

// 5. Функция для совершения одного звонка
async function makeCall(callId) {
  try {
    // Создаём вызов. URL указывает на стандартный TwiML (голос робота)
    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // Аудиофайл по умолчанию
      to: testNumber,
      from: fromNumber
    });
    console.log(`Звонок ${callId} начат. SID: ${call.sid}`);
  } catch (error) {
    console.error(`Ошибка при звонке \${callId}:`, error.message);
  }
}

// 6. Основная функция для массового дозвона
async function startMassCalling(totalCalls = 10) {
  console.log(`Начинаем массовый дозвон: \${totalCalls} звонков...`);
  
  // Собираем массив обещаний (Promises) для всех звонков
  const promises = [];
  for (let i = 0; i < totalCalls; i++) {
    promises.push(makeCall(i + 1));
  }

  // Запускаем все звонки параллельно
  await Promise.all(promises);
  console.log('Все звонки инициированы!');
}

// 7. Запуск скрипта
// Число 10 можно заменить на нужное вам количество (например, 50 или 100)
startMassCalling(10);
