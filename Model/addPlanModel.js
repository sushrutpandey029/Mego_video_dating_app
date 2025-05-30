import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const Subscription = sequelize.define("Subscription_Plan", {
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  planType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default Subscription;
