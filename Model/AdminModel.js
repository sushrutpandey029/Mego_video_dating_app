import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const adminModel = sequelize.define('admin', {
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    planePassword: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    accessToken:{
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'admin',
    timestamps: true,
});

export default adminModel;