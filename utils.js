// Подключение вопросов из файла questions.json
const questions = require("./questions.json");

// Подключение класса Random из библиотеки "random-js"
const { Random } = require("random-js");

// Функция для получения случайного вопроса по выбранной теме
const getRandomQuestion = (topic) => {
  const random = new Random();

  let questionTopic = topic.toLowerCase();

  if (questionTopic === "случайный вопрос") {
    questionTopic =
      Object.keys(questions)[
        random.integer(0, Object.keys(questions).length - 1)
      ];
  }

  // Проверка на существование темы в объекте questions
  if (!questions[questionTopic]) {
    return { error: "Тема не найдена" };
  }

  const topicQuestions = questions[questionTopic];

  // Проверка на наличие вопросов в выбранной теме
  if (!topicQuestions || topicQuestions.length === 0) {
    return { error: "Вопросы по выбранной теме отсутствуют" };
  }

  const randomQuestionIndex = random.integer(0, topicQuestions.length - 1);
  const randomQuestion = topicQuestions[randomQuestionIndex];

  // Возврат случайного вопроса и темы
  return {
    question: randomQuestion,
    questionTopic,
  };
};

// Функция для получения правильного ответа по типу вопроса и ID вопроса
const getCorrectAnswer = (topic, id) => {
  const question = questions[topic].find((question) => question.id === id);

  // Если у вопроса нет вариантов ответов, возвращается текст ответ
  if (!question.hasOptions) {
    return question.answer;
  }

  // Возвращается текст правильного ответа из вариантов ответов
  return question.options.find((option) => option.isCorrect).text;
};

// Экспорт функций getRandomQuestion и getCorrectAnswer для использования в других модулях
module.exports = { getRandomQuestion, getCorrectAnswer };
