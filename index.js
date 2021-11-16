const TelegramBot = require('node-telegram-bot-api');
const token = '2135541440:AAGv_mF90bAVL63TjJR7B8COXq2J9UbQmmE'; // token bot
const bot = new TelegramBot(token, { polling: true });

const users = [
  1178584608, // user
]

let lastLocation = {}

const location = [
  { id: 1, name: 'Куст 1', latitude: 0, longitude: 0 },
  { id: 2, name: 'Куст 2', latitude: 10, longitude: 10 },
  { id: 3, name: 'Куст 3', latitude: 20, longitude: 20 },
]

function middleware (msg) {
  const user = users.find(id => id === msg.from.id)
  if (!user) bot.sendMessage(users[0], 'Не зарегистрированый пользователь \n' + JSON.stringify(msg.from, null, 2))
  return user
}

function getKeyboard () {
  let array = location.map(i => i.id.toString());
  let size = 5;
  let subarray = [];
  for (let i = 0; i < Math.ceil(array.length / size); i++) {
    subarray[i] = array.slice((i * size), (i * size) + size);
  }
  return subarray;
}

function sendKey (msg) {
  console.log(getKeyboard ())
  bot.sendMessage(msg.from.id, "Введите номер бригады: ", {
    reply_markup: {
      keyboard: getKeyboard (),
      resize_keyboard: true
    }
  });
}

bot.setMyCommands([
  {
    command: '/start',
    description: 'Старт'
  }
]);

bot.onText(/\/start/, (msg, match) => {
  if (middleware(msg)) {
    bot.sendMessage(msg.chat.id, 'Доброго времени суток, ' + msg.from.first_name + '. Чем могу помочь?', {
      reply_markup: {
        keyboard: [["Бригады"]],
        resize_keyboard: true,
        hide_keyboard: true
      }
    });
  } else {
    bot.sendMessage(msg.from.id, 'Я приветствую вас ' + msg.from.first_name + ', простите, но я не могу вам ничем помочь, так как вы не зарегистрированы пользователь. Обратитесь к @bondrogeen за информацией.');
  }
});

bot.onText(/Бригады/, (msg, match) => {
  if (!middleware(msg)) return
  sendKey(msg)
});


bot.onText(/^\d+$/, (msg, match) => {
  if (!middleware(msg)) return
  lastLocation = location.find(l => l.id === +msg.text)
  console.log(lastLocation)
  bot.sendMessage(msg.chat.id, "Устойство: ", {
    reply_markup: {
      keyboard: [
        ['Местоположение'],
        ['Бригады']
      ],
      resize_keyboard: true,
      hide_keyboard: true
    }
  });
});

bot.onText(/Местоположение/, (msg) => {
  if (!middleware(msg)) return
  console.log(lastLocation)
  if (lastLocation) {
    bot.sendLocation(msg.chat.id, lastLocation.latitude, lastLocation.longitude);
  }
});

bot.on('message', (msg) => {
  if (!middleware(msg)) return
  console.log(JSON.stringify(msg, null, 2))
});

bot.on('polling_error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});

