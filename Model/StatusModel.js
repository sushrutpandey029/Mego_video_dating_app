import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

const StatusModel = sequelize.define('status', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Fixed typo from "autoIncreament" to "autoIncrement"
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "mego_users",
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM,
        values: ['enable', 'disable'],
        allowNull: true,
        defaultValue: 'enable'
    },
    totalCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'status',
    timestamps: true
});

// Export the model
export default StatusModel;