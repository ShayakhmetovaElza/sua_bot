const sequelize = require("./db")
const { DataTypes } = require("sequelize")

const Users = sequelize.define( "users", {
        chat_id: { type: DataTypes.STRING(50), unique: true, primaryKey: true },
        name_user: { type: DataTypes.STRING },
        status: { type: DataTypes.INTEGER }
    }
)

module.exports = { Users }