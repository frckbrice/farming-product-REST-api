"use strict";
require('dotenv').config(); // Load environment variables from .env file
module.exports = {
    // development: {
    //   username: 'root',
    //   password: '',
    //   database: 'food_house',
    //   host: 'localhost',
    //   port: 3306,
    //   dialect: 'mysql',
    // },
    development: {
        username: 'food_house_project', // PostgreSQL username
        password: 'postgres', // PostgreSQL password
        database: 'food_house', // database name
        host: 'localhost', // database host
        dialect: 'postgres',
        pool: {
            max: 10, // Maximum number of connections in the pool
            min: 0, // Minimum number of connections in the pool
            acquire: 30000, // Maximum time (in milliseconds) that a connection can be idle before being released
            idle: 10000, // Maximum time (in milliseconds) that a connection can be idle before being closed
        },
    },
    test: {
        username: process.env.CI_DB_USERNAME,
        password: process.env.CI_DB_PASSWORD,
        database: process.env.CI_DB_NAME,
        host: '127.0.0.1',
        port: 3306,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
        },
    },
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOSTNAME,
        port: process.env.PROD_DB_PORT,
        dialect: 'postgres',
    },
};
