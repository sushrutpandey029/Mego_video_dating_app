import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const blockedmodel = sequelize.define('user_blocked', {

    blockedby: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    blockedto: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        
    }

}, {
    tableName: 'user_blocked',
    timestamps: true,
});

export default blockedmodel;
