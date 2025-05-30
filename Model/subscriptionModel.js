
import { DataTypes}  from "sequelize";
import sequelize  from "../Database/MySql.js";

const SubscriptionModel = sequelize.define("Subscription", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "mego_users",
            key: "id",
        },
    },
    planeName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("active", "expired"),
        allowNull: false,
        defaultValue: "active",
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,              
    },
});

export default SubscriptionModel;