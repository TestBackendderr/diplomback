const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const UserInfo = require("./UserInfo");
const Cart = require("./Cart");

const models = {
  User,
  Product,
  Order,
  OrderItem,
  UserInfo,
  Cart,
};

// Определение ассоциаций
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

User.hasOne(UserInfo, { foreignKey: "user_id" });
UserInfo.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });
Product.hasMany(Cart, { foreignKey: "product_id" });
Cart.belongsTo(Product, { foreignKey: "product_id" });

// Экспорт
module.exports = {
  sequelize,
  Sequelize,
  User,
  Product,
  Order,
  OrderItem,
  UserInfo,
  Cart,
};
