const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  database: "shop3",
  username: "postgres",
  password: "",
  port: 5432,
});

module.exports = sequelize;
