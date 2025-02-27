import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const messageModel = sequelize.define('user_message', {

    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    message: {
        type: DataTypes.STRING,
        allowNull: false,
        
    }

}, {
    tableName: 'user_message',
    timestamps: true,
});

export default messageModel;
