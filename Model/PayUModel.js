import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const PayUModel = sequelize.define("PayUTransaction", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Fixed typo from "autoIncreament" to "autoIncrement"
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "success", "failed"),
        type: DataTypes.STRING,
        allowNull: false,
         defaultValue: "pending",
    },
    paymentMode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productInfo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phonenumber: { // Added phonenumber field
        type: DataTypes.STRING,
        allowNull: true,
    },
    hash: { // Added hash field
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

export default PayUModel;