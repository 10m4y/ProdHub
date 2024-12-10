const {DataTypes} = require('sequelize');
const sequelize = require('../../config/pg-db');
const Repository=require('../mongo/Repository.mongo');
const { version } = require('mongoose');

const File=sequelize.define('File',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    version:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    path:{
        type:DataTypes.STRING,
        allowNull:false  //local path or url of flp
    },
    repositoryId:{
        type:DataTypes.STRING, //Mongo Db Id as string
        allowNull:flase
    },
},{timestamps:true});   

module.exports = File;