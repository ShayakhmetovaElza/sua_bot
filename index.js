const TelegramApi = require("node-telegram-bot-api")
require("dotenv").config()
const helper = require("./helper")
const sequelize = require("./db")
const questions = require("./questions")
const { CronJob } = require("cron");



const bot = new TelegramApi(process.env.TOKEN,  { polling: true })

const sendMsg = async(chat_id, text, keyboard) => {
    await bot.sendMessage(chat_id, text, {
        parse_mode: "Markdown",
        reply_markup : {
            inline_keyboard: keyboard
        }
    })
}

const editMsg = async(chat_id, text, keyboard, message_id) => {
    await bot.editMessageText(text, {
        chat_id,
        message_id,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard }
    })
}



const getQuestionMsg = (index) => {
    const item = questions[index]
    const text = item?.text

    switch (item.type) {
        case "text": { return { text, keyboard: [] } }
        case "radiogroup": { return { text, keyboard: item.choices } }
    }
}


const start = async() => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()

    } catch(e) {
        console.log("Не удалось подключиться к БД")
        console.log(e)
    }

    helper.logoStart()

    bot.setMyCommands([
        { command: "/start", description: "Начать" },
    ])

    bot.on( "message", async msg => {
        const chat_id = msg.chat.id
        const msg_text = msg.text

        try {

            if ( msg_text === "/start" ) {
                const first_name = msg.from.first_name ?? 'Пользователь';

                const textHello = `Рады приветствовать тебя, ${first_name}! Благодарим, что выбрала наш бренд!\n` +
                    'Мы подготовили специально для тебя подарок: образы от профессиональных стилистов на каждый день.\n';
                    
                await helper.setUser(chat_id, {name_user: first_name})
                await sendMsg( chat_id, textHello);

                return sendMsg(
                    chat_id, 
                    'Нажимай на кнопку, чтобы получить свой подарок 🤍', 
                    [[{ text: "Получить подарок", callback_data: "q_0" }]]
                )
            }

            if ( msg_text === "/send_msg" && chat_id == process.env.ADMIN_ID ) {
                await helper.setUser(chat_id, { status: 1 });
                return sendMsg( chat_id, 'Напишите текст для рассылки:');
            }

            const user = await helper.getUser(chat_id);
            const statusUser = user?.status

            if ( statusUser == 1 && chat_id == process.env.ADMIN_ID ) {

                const text = msg.text;
                const entities = msg.entities

                await sendMsg( chat_id, 'Проверьте текст:');

                try {

                    await bot.sendMessage(chat_id, text, {
                        entities,
                        reply_markup : {
                            inline_keyboard: [
                                [{ text: 'Отправить', callback_data: "admin_send"}],
                                [{ text: 'Не отправлять', callback_data: "admin_no"}],
                            ]
                        }
                    })

                } catch {
                    await sendMsg(chat_id, "Ошибка текста, проверьте закрывающиеся символы!")
                    await bot.sendPhoto(chat_id, './rule.png')
                }

                return console.log("Текст для рассылки создан!");
            }

            return console.log("нет действий") 

        } catch (e) {
            console.log(e)
            return bot.sendMessage(
                chat_id, 
                "_Произошла какая-то ошибка..._\n\nДля продолжения нажмите /start",
                { parse_mode: "Markdown" }
            )
        }
    })

    
    bot.on("callback_query", async query => {
        const chat_id = query.message.chat.id
        const message_id = query.message.message_id
        const data = query.data

        try { 

            if ( data == 'admin_send' && chat_id == process.env.ADMIN_ID ) {
                await editMsg(chat_id, '*Начался процесс рассылки сообщений...*', [], message_id);
                await helper.setUser(chat_id, {status: 3})

                const sendText = query.message.text;
                const entities = query.message.entities;
                const usersByDelivered = await helper.getChatIds() ?? [];
                let count = 0;

                const job = CronJob.from({
                    cronTime: '*/3 * * * *',
                    onTick: async () => {
                        if (!usersByDelivered?.length) {
                            job.stop();
                            return;
                        }

                        const sendJob = CronJob.from({
                            cronTime: '*/1 * * * * *',
                            onTick: async () => {
                                const rangeUsers = usersByDelivered.splice(0,20);
                                count++;
                                
                                for await ( item of rangeUsers ) {
                                    const userId = item.chat_id
                                    try {
                                        await bot.sendMessage(userId, sendText, {entities})
                                    } catch(e) {
                                        console.log(`Сообщение не отправлено - ${userId}`)
                                    }
                                }
        
                                if (count == 60 || !usersByDelivered.length) {
                                    sendJob.stop();
                                    count = 0;
                                    return;
                                }
                            },
                            onComplete: async() => {
                                await sendMsg(chat_id, 'Итерация завершена...');
                            },
                            start: true,
                        });
                    },
                    onComplete: async() => {
                        await sendMsg(chat_id, '📩 *Отправка сообщений завершена!*');
                    },
                    start: true,
                });

                return console.log('Рассылка завершилась!')
            }

            if ( data == 'admin_no' && chat_id == process.env.ADMIN_ID ) {
                await helper.setUser(chat_id, {status: 2})
                return await editMsg(chat_id, '❌ *Вы отменили отправку*', [], message_id);
            }
            
            if ( data === "q_0") {
                const { text, keyboard } = getQuestionMsg(data);
                await editMsg(chat_id, text, keyboard, message_id);

                await bot.sendDocument(chat_id, './file.pdf')

                const { text: t1, keyboard: k1} = getQuestionMsg("q_1");
                return sendMsg( chat_id, t1, k1);
            }


            if (questions.hasOwnProperty(data)) {
                const msgText = query.message.text;
                const { text, keyboard } = getQuestionMsg(data);

                await editMsg(chat_id, msgText, [], message_id);
                return await sendMsg(chat_id, text, keyboard);
            }       
     
            return console.log("нет действий")

        } catch(e) {
            console.log(e)
            return bot.sendMessage(
                chat_id, 
                "_Произошла какая-то ошибка..._\n\nДля продолжения нажмите /start",
                { parse_mode: "Markdown" }
            )
        }
    })

}

start()

