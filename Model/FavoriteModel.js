import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";

// Define the favorite model
const favoriteModel = sequelize.define("favorite", {
    favoritedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mego_users',  // Reference the table name directly
            key: 'id',            // The `id` column of the `mego_users` table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    favoritedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mego_users',  // Reference the table name directly
            key: 'id',            // The `id` column of the `mego_users` table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }
}, {
    tableName: 'user_favorite',
    timestamps: true,
});

export default favoriteModel;



