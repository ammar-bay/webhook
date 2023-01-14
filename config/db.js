const config = require("./config.js");
const mysql = require("mysql2");

// create db if it doesn't already exist
const { host, port, username, password, database } = config["development"];
// const { host, port, user, password, database } = config[process.env.NODE_ENV];

const pool = mysql.createPool({ host, port, user: username, password });

pool.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
