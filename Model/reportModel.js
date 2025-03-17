
import { DataTypes } from "sequelize";
import sequelize  from "../Database/MySql.js";

const reportModel = sequelize.define('user_report', {

    reportedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    reportedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
    },
    reportsCount:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }

}, { 
    tableName: 'user_report',
    timestamps: true,

});

export default reportModel;