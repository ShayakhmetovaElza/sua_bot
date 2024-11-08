module.exports = {
    "q_0": {
        type: "text",
        text: "Отправляем ниже подарок от нашего бренда - каталог образов с ссылками 👇",
    },
    "q_1": {
        type: "radiogroup",
        text: "Также у нас есть скидка 10% на следующую покупку. Если хочешь получить, нажимай кнопку",
        choices: [
            [{ callback_data: "q_2", text: "Получить скидку 10%"}],
        ],
    },
    "q_2": {
        type: "radiogroup",
        text: "Для того, чтобы получить скидку 10% на следующую покупку, следуй инструкции ниже:\n1) Пройди опрос по ссылке: https://sua-beleza.ru/survey и получили промокод\n2) Напиши в [телеграме](https://t.me/shayakhmetovae) данный промокод\n3) После проверки твоего опроса, тебе расскажут, как заказать следующее изделие со скидкой\n\n\nЕсли ты прошла данный опрос, кликай на кнопку",
        choices: [
            [{ callback_data: "q_3", text: "Опрос пройден"}],
        ],
    },
    "q_3": {
        type: "radiogroup",
        text: "Отлично. Если ты хочешь получить скидку 20% на следующую покупку, необходимо поделиться с нами обратной связью по изделию, которое было приобретено.\n\nНа данный момент мы работаем над улучшением товара для вас: упаковка, качество изделия, внешний вид.\n\nМы были бы благодарны, если бы вы помогли стать нам еще лучше. Для этого предлагаем провести небольшой созвон на 15-30 мин, на котором бы вы поделились впечатлениями от нашего бренда, что понравилось, а что нет.\n\nВремя выбираете вы, когда вам удобно, чтобы ответить на несколько вопросов. Если согласны поделиться обратной связью, нажимай кнопку ниже",
        choices: [
            [{ callback_data: "q_4", text: "Получить скидку 20%"}],
        ],
    },
    "q_4": {
        type: "text",
        text: "Благодарим тебя. Напиши в [телеграм](https://t.me/shayakhmetovae) фразу: ОБРАТНАЯ СВЯЗЬ. Ответь на вопросы и скидка твоя %\n\nТакже у нас есть скидки на услуги персонального стилиста, приготовленную специально для тебя. Подобранные образы и информацию о стилистах ты найдешь на нашем сайте: https://sua-beleza.ru\n\nБлагодарим за уделенное время! В данном чате, мы будем анонсировать новинки, которые уже готовим и другие полезности. Рады, что ты с нами!",
    },
}
