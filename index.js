// Подключение и конфигурация переменных окружения
require("dotenv").config();

// Подключение необходимых классов и объектов из библиотеки "grammy"
const {
  Bot,
  Keyboard,
  InlineKeyboard,
  GrammyError,
  HttpError,
} = require("grammy");

// Подключение функций getRandomQuestion и getCorrectAnswer из файла utils.js
const { getRandomQuestion, getCorrectAnswer } = require("./utils");

// Создание экземпляра бота с использованием API-ключа из переменной окружения
const bot = new Bot(process.env.BOT_API_KEY);

// Обработка команды /start
bot.command("start", async (ctx) => {
  console.log("Received /start command");
  // Создание клавиатуры с выбором тем для изучения
  const startKeyboard = new Keyboard()

    .text("HTML")
    .text("CSS")
    .row()
    .text("JS/TS")
    .text("React/Redux")
    .row()
    .text("Web Technologies")
    .text("Случайный вопрос")
    .resized();

  // Приветственное сообщение
  console.log("Sending welcome message");
  await ctx.reply(
    "Привет! Я твой бот-собеседователь по фронтенд-разработке. 🤖 Готов проверить твои знания и помочь с изучением."
  );

  // Отправка сообщения с клавиатурой выбора темы
  console.log("Sending message with keyboard");
  await ctx.reply(
    "Давай начнем с чего-то интересного! Выбери тему вопроса в меню 👇",
    {
      reply_markup: startKeyboard,
      parse_mode: "Markdown",
    }
  );
});

// Обработка сообщений с выбором темы или "Случайный вопрос"
bot.hears(
  [
    "HTML",
    "CSS",
    "JS/TS",
    "React/Redux",
    "Web Technologies",
    "Случайный вопрос",
  ],
  async (ctx) => {
    const topic = ctx.message.text.toLowerCase();

    const { question, questionTopic, error } = getRandomQuestion(topic);

    if (error) {
      // Если есть ошибка, отправляем сообщение с ошибкой в чат
      await ctx.reply(error);
      return;
    }

    let inlineKeyboard;

    if (question && question.hasOptions) {
      const buttonRows = question.options.map((option) => [
        InlineKeyboard.text(
          option.text,
          JSON.stringify({
            type: `${questionTopic}-option`,
            isCorrect: option.isCorrect,
            questionId: question.id,
          })
        ),
      ]);

      inlineKeyboard = InlineKeyboard.from(buttonRows);
    } else {
      inlineKeyboard = new InlineKeyboard().text(
        "Узнать ответ",
        JSON.stringify({
          type: questionTopic,
          questionId: question.id,
        })
      );
    }

    await ctx.reply(question.text, {
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
    });
  }
);

// Обработка колбэк-запроса на кнопке "Узнать ответ" или варианте ответа
bot.on("callback_query:data", async (ctx) => {
  // Парсинг данных из колбэк-запроса
  const callbackData = JSON.parse(ctx.callbackQuery.data);

  // Обработка запроса на получение правильного ответа
  if (!callbackData.type.includes("option")) {
    // Получение правильного ответа по типу вопроса и ID вопроса
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);

    // Отправка правильного ответа в чат
    await ctx.reply(answer, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });

    // Ответ на колбэк-запрос
    await ctx.answerCallbackQuery();
    return;
  }

  // Обработка варианта ответа
  if (callbackData.isCorrect) {
    await ctx.reply("Верно ✅");
    await ctx.answerCallbackQuery();
    return;
  }

  // Получение правильного ответа по типу вопроса и ID вопроса
  const answer = getCorrectAnswer(
    callbackData.type.split("-")[0],
    callbackData.questionId
  );

  // Отправка сообщения с неверным ответом и правильным ответом
  await ctx.reply(`Неверно ❌ Правильный ответ: ${answer}`, {
    parse_mode: "Markdown",
  });

  // Ответ на колбэк-запрос
  await ctx.answerCallbackQuery();
});

// Обработка ошибок бота
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Запуск бота
bot.start();
