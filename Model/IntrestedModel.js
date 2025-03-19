import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";
import usermodel from "./UserModel.js";

const interestedModel = sequelize.define('user_intrested', {
    interestedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mego_users',  // Reference the table name directly
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    interestedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mego_users',  // Reference the table name directly
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'panding'
    },
}, {
    tableName: 'user_interested',
    timestamps: true,
});

// Define associations
// interestedModel belongs to usermodel for both interestedBy and interestedTo
interestedModel.belongsTo(usermodel, { foreignKey: 'interestedBy', as: 'interestedUser' }); // Alias 'interestedUser' for interestedBy
interestedModel.belongsTo(usermodel, { foreignKey: 'interestedTo', as: 'interestedTarget' }); // Alias 'interestedTarget' for interestedTo

// usermodel has many interestedModels where the user is the one interested (interestedBy) or is the one being interested by others (interestedTo)
usermodel.hasMany(interestedModel, { foreignKey: 'interestedBy', as: 'interests' }); // Alias 'interests' for users who have interests
usermodel.hasMany(interestedModel, { foreignKey: 'interestedTo', as: 'beingInteresedBy' }); // Alias 'beingInteresedBy' for users who are targets of interest

export default interestedModel;
