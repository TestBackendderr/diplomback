const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  opis: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image_url: { type: DataTypes.STRING },
});

module.exports = Product;
