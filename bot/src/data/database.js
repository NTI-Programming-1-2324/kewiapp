const { env } = require("../env");
const { Sequelize } = require('sequelize');
//import * as path from "path"

const Database = new Sequelize({
    
    /*dialect: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME*/

    dialect: 'sqlite',
    storage: '../../db/database.sqlite'
});

(async () => {
    try {
        await Database.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
    }
})();

module.exports = Database;
