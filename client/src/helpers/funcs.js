function getTimeGreeting() {
    const h = (new Date()).getHours();
    if (h > 23 || h < 7) return ('Доброй ночи');
    if (h > 6 && h < 12) return ('Доброе утро');
    if (h > 11 && h < 19) return ('Добрый день');
    if (h > 18 && h < 24) return ('Добрый вечер');
}

const accesslevelNames = {
    0: "пользователь",
    2: "кассир",
    3: "модератор",
    4: "администратор",
    10: "суперпользователь"
};

const paymentTypes = 
{
    1: "Перевод",
    2: "Зачисление зарплаты",
    21: "Штраф",
    3: "Покупка",
    31: "Возврат"
}

export { getTimeGreeting, accesslevelNames, paymentTypes }