
import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const StatusModel = sequelize.define('status', {

    userId: {
        type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey : true,
         refrerences: {
            model: "mego_users",
            key: "id"
         }
    },

    status: {
        type: DataTypes.ENUM,
        values: ['enable', 'disable'],
        allownNull: false,
        defaultValue:  'enable'
    }
}, {
    tableName: 'status',
    timestamps: "true"

});

export default StatusModel;
