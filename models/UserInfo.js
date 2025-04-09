const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserInfo = sequelize.define("UserInfo", {
  kraj: { type: DataTypes.STRING },
  miasto: { type: DataTypes.STRING },
  ulica: { type: DataTypes.STRING },
  nrdomu: { type: DataTypes.STRING },
  telefon: { type: DataTypes.STRING },
});

module.exports = UserInfo;
