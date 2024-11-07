const { Users } = require("./models")
const sequelize = require("./db")
const { QueryTypes } = require('sequelize');


module.exports = {
    logoStart() { console.log("Bot has been start...") },

    async getUser (chat_id, attributes)  {
        const user = await Users.findOne({
            attributes,
            raw: true,
            where: { chat_id: chat_id.toString() }
        })

        return user
    },

    async setUser(chat_id_user, update) {
        const chat_id = chat_id_user.toString()
        const user = await Users.findOne({
            raw: true,
            where: { chat_id }
        })
    
        return user? 
            ( await Users.update(update, { 
                    returning: true, 
                    plain: true, 
                    raw: true, 
                    where: { chat_id } 
                })
            )[1]:
            ( await Users.create({ ...update , chat_id }) )
                .get({ plain: true })
    }, 

    async getChatIds() {
        const ids = await sequelize.query(
            'SELECT chat_id FROM users',
            {
              type: QueryTypes.SELECT,
            },
        );

        return ids;
    }
}