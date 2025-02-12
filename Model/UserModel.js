import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const usermodel = sequelize.define('mego_users', {
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: { 
        type: DataTypes.INTEGER, // Use INTEGER if it's a number
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    looking_for: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    interest: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    profileimage: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    Imageone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Imagetwo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Imagethree: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Imagefour: { 
        type: DataTypes.STRING,
        allowNull: true,
    },
    Imagefive: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    longitude: { 
        type: DataTypes.STRING,
        allowNull: false, // Ensure longitude is not nullable if that's your requirement
    },
}, {
    tableName: 'mego_users',
    timestamps: true,
});

export default usermodel;
