require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testNumbers = process.env.TEST_NUMBERS.split(',');
const fromNumber = process.env.TWILIO_NUMBER;
const smsMessage = process.env.SMS_MESSAGE;
const retryDelay = parseInt(process.env.RETRY_DELAY, 10);
const maxRetries = parseInt(process.env.MAX_RETRIES, 10);

console.log(`Начинаем непрерывные звонки: ${testNumbers.length} номеров...`);

async function makeCallWithRetryAndSMS(toNumber, attempt = 1) {
  console.log(`Попытка ${attempt} для номера ${toNumber}`);

  try {
    // Инициируем звонок
    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: toNumber,
      from: fromNumber
    });

    // Ждём завершения звонка и проверяем статус
    const completedCall = await client.calls(call.sid).fetch();

    if (completedCall.status === 'completed') {
      console.log(`Звонок на ${toNumber} успешен на попытке ${attempt}`);
    } else if (attempt < maxRetries) {
      // Если не успешно и есть попытки — ждём и звоним снова
      console.log(`Звонок на ${toNumber} не успешен (статус: ${completedCall.status}). Следующая попытка через ${retryDelay / 1000} сек.`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      await makeCallWithRetryAndSMS(toNumber, attempt + 1);
    } else {
      // Если все попытки неудачны — отправляем SMS
      console.log(`Все попытки для ${toNumber} неудачны. Отправляем SMS.`);
      await sendSMS(toNumber);
    }
  } catch (error) {
    console.error(`Ошибка при звонке на ${toNumber}:`, error.message);
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      await makeCallWithRetryAndSMS(toNumber, attempt + 1);
    } else {
      console.log(`Отправляем SMS на ${toNumber} из‑за ошибки.`);
      await sendSMS(toNumber);
    }
  }
}

async function sendSMS(toNumber) {
  try {
    const message = await client.messages.create({
      body: smsMessage,
      from: fromNumber,
      to: toNumber
    });
    console.log(`SMS отправлен на ${toNumber}. SID: ${message.sid}`);
  } catch (error) {
    console.error(`Ошибка отправки SMS на ${toNumber}:`, error.message);
  }
}

// Запускаем звонки для всех номеров
testNumbers.forEach(toNumber => {
  makeCallWithRetryAndSMS(toNumber).catch(error => {
    console.error(`Критическая ошибка для номера ${toNumber}:`, error);
  });
});
