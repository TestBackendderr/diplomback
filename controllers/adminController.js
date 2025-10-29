const sequelize = require("../config/db");
const { Op } = require("sequelize");
const User = require("../models/User");

class AdminController {
  // Общая статистика
  async getStats(req, res) {
    try {
      const Order = require("../models/Order");
      const OrderItem = require("../models/OrderItem");
      const Product = require("../models/Product");

      const [
        totalUsers,
        totalProducts,
        totalOrders,
        orders,
        orderItems
      ] = await Promise.all([
        User.count(),
        Product.count(),
        Order.count(),
        Order.findAll({ attributes: ['totalPrice', 'status'] }),
        OrderItem.findAll({ attributes: ['quantity'] })
      ]);

      // Подсчет выручки от завершенных заказов
      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);

      // Подсчет общего количества купленных тортов
      const totalCakesSold = orderItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

      res.json({
        success: true,
        stats: {
          totalUsers: totalUsers,
          totalProducts: totalProducts,
          totalOrders: totalOrders,
          totalRevenue: totalRevenue,
          totalCakesSold: totalCakesSold
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Статистика заказов по месяцам
  async getOrdersStats(req, res) {
    try {
      const ordersStats = await sequelize.query(`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as orders_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM "Orders" 
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `);

      res.json({
        success: true,
        ordersStats: ordersStats[0]
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Топ продуктов
  async getTopProducts(req, res) {
    try {
      const topProducts = await sequelize.query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          COUNT(oi.id) as orders_count,
          COALESCE(SUM(oi.quantity), 0) as total_quantity
        FROM cake p
        LEFT JOIN "OrderItems" oi ON p.id = oi.product_id
        GROUP BY p.id, p.name, p.price
        ORDER BY orders_count DESC, total_quantity DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        topProducts: topProducts[0]
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Статистика пользователей
  async getUsersStats(req, res) {
    try {
      const usersStats = await sequelize.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM "Users"
        GROUP BY role
      `);

      const newUsers = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM "Users"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `);

      res.json({
        success: true,
        usersStats: {
          byRole: usersStats[0],
          newUsersLastMonth: newUsers[0][0].count
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // История всех пользователей
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50, search = '', role = 'all', sortBy = 'newest' } = req.query;
      
      // Построение условий WHERE для Sequelize
      const whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [
          { imie: { [Op.iLike]: `%${search}%` } },
          { nazwisko: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (role !== 'all') {
        whereConditions.role = role;
      }

      // Построение ORDER BY
      let order = [];
      switch (sortBy) {
        case 'newest':
          order = [['createdAt', 'DESC']];
          break;
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'name':
          order = [['imie', 'ASC']];
          break;
        case 'email':
          order = [['email', 'ASC']];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }

      // Получение пользователей с пагинацией
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { count, rows } = await User.findAndCountAll({
        where: whereConditions,
        order: order,
        limit: parseInt(limit),
        offset: offset,
        attributes: ['user_id', 'imie', 'nazwisko', 'email', 'role', 'createdAt', 'updatedAt']
      });

      // Преобразование данных для фронтенда
      const allUsers = rows.map(user => ({
        id: user.user_id,
        name: user.imie,
        surname: user.nazwisko,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      // Статистика по ролям
      const allUsersForStats = await User.findAll({
        where: whereConditions,
        attributes: ['role'],
        raw: true
      });
      
      const roleStatsMap = {};
      allUsersForStats.forEach(user => {
        roleStatsMap[user.role] = (roleStatsMap[user.role] || 0) + 1;
      });
      
      const roleStats = Object.keys(roleStatsMap).map(role => ({
        role,
        count: roleStatsMap[role]
      }));

      res.json({
        success: true,
        users: allUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalUsers: count,
          limit: parseInt(limit)
        },
        stats: {
          roleStats: roleStats,
          totalUsers: count
        }
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Получить детальную информацию о пользователе
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      
      // Получить пользователя по ID
      const user = await User.findByPk(userId, {
        attributes: ['user_id', 'imie', 'nazwisko', 'email', 'role', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
      }

      // Подсчитать заказы и общую сумму через Sequelize
      const Order = require("../models/Order");
      const orders = await Order.findAll({
        where: { userId: parseInt(userId) },
        attributes: ['id', 'totalPrice', 'status', 'createdAt']
      });

      const total_orders = orders.length;
      const total_spent = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);

      // Преобразовать данные пользователя для фронтенда
      const userData = {
        id: user.user_id,
        name: user.imie,
        surname: user.nazwisko,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        total_orders,
        total_spent
      };

      res.json({
        success: true,
        user: userData,
        recentOrders: orders.slice(0, 5).map(order => ({
          id: order.id,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt
        }))
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Получить корзину пользователя
  async getUserCart(req, res) {
    try {
      const { userId } = req.params;
      const cartService = require("../services/cartService");
      
      const cartItems = await cartService.getCart(parseInt(userId));
      
      res.json({
        success: true,
        cart: cartItems
      });
    } catch (err) {
      console.error('Error fetching user cart:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Обновить роль пользователя
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nieprawidłowa rola. Dozwolone: admin, user' 
        });
      }

      const [updatedRows] = await sequelize.query(`
        UPDATE "Users" 
        SET role = :role, "updatedAt" = NOW()
        WHERE user_id = :userId
      `, {
        replacements: { role, userId },
        type: sequelize.QueryTypes.UPDATE
      });

      if (updatedRows === 0) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
      }

      res.json({
        success: true,
        message: 'Rola użytkownika została zaktualizowana'
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Удалить пользователя
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Проверяем, что пользователь существует
      const user = await User.findByPk(userId, {
        attributes: ['user_id', 'role']
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
      }

      // Нельзя удалить последнего админа
      const adminCount = await User.count({ where: { role: 'admin' } });

      if (user.role === 'admin' && adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nie można usunąć ostatniego administratora' 
        });
      }

      // Удаляем пользователя
      await user.destroy();

      res.json({
        success: true,
        message: 'Użytkownik został usunięty'
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AdminController();
