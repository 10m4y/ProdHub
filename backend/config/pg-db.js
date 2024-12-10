const {sequelize, Sequelize} = require('sequelize');

const sequelize =new Sequelize('prodhub','username','password',{
    host:'localhost',
    dialect:'postgres'
});


sequelize.authenticate()
    .then(()=>console.log('Connected to Postgres'))
    .catch(err=>console.log('Error in connection to Postgres',err));

module.exports = sequelize;
