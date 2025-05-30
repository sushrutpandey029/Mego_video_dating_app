import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql.js";
import favoriteModel from './FavoriteModel.js'; // Import favoriteModel after it is defined

const usermodel = sequelize.define('mego_users', {
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    about: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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
        allowNull: false, 
    },
    // fcm_user_id:{ 
    //     type: DataTypes.STRING,
    //     allowNull: false, 
    //     defaultValue:null
    // },
}, {
    tableName: 'mego_users',
    timestamps: true,
});

// Define associations after models are initialized
usermodel.hasMany(favoriteModel, {
    foreignKey: 'favoritedTo',
    as: 'favoritedByUsers',
});

favoriteModel.belongsTo(usermodel, { 
    foreignKey: 'favoritedTo', 
    as: 'favoritedToUser' 
});

export default usermodel;


