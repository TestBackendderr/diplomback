const sequelize = require("../config/db");

class AdminController {
  // Общая статистика
  async getStats(req, res) {
    try {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      ] = await Promise.all([
        sequelize.query('SELECT COUNT(*) as count FROM "Users"'),
        sequelize.query('SELECT COUNT(*) as count FROM cake'),
        sequelize.query('SELECT COUNT(*) as count FROM "Orders"'),
        sequelize.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM "Orders" WHERE status = \'completed\'')
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers: totalUsers[0][0].count,
          totalProducts: totalProducts[0][0].count,
          totalOrders: totalOrders[0][0].count,
          totalRevenue: parseFloat(totalRevenue[0][0].total)
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
      
      // Построение WHERE условий
      let whereConditions = [];
      let replacements = {};

      if (search) {
        whereConditions.push(`(imie ILIKE :search OR nazwisko ILIKE :search OR email ILIKE :search)`);
        replacements.search = `%${search}%`;
      }

      if (role !== 'all') {
        whereConditions.push(`role = :role`);
        replacements.role = role;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Построение ORDER BY
      let orderBy = '';
      switch (sortBy) {
        case 'newest':
          orderBy = 'ORDER BY "createdAt" DESC';
          break;
        case 'oldest':
          orderBy = 'ORDER BY "createdAt" ASC';
          break;
        case 'name':
          orderBy = 'ORDER BY imie ASC';
          break;
        case 'email':
          orderBy = 'ORDER BY email ASC';
          break;
        default:
          orderBy = 'ORDER BY "createdAt" DESC';
      }

      // Получение общего количества
      const countQuery = `
        SELECT COUNT(*) as total
        FROM "Users"
        ${whereClause}
      `;
      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      // Получение пользователей с пагинацией
      const offset = (page - 1) * limit;
      const usersQuery = `
        SELECT 
          user_id as id,
          imie as name,
          nazwisko as surname,
          email,
          role,
          "createdAt",
          "updatedAt"
        FROM "Users"
        ${whereClause}
        ${orderBy}
        LIMIT :limit OFFSET :offset
      `;

      const allUsers = await sequelize.query(usersQuery, {
        replacements: { ...replacements, limit: parseInt(limit), offset: parseInt(offset) },
        type: sequelize.QueryTypes.SELECT
      });

      // Статистика по ролям
      const roleStats = await sequelize.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM "Users"
        ${whereClause}
        GROUP BY role
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        users: allUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(countResult[0].total / limit),
          totalUsers: countResult[0].total,
          limit: parseInt(limit)
        },
        stats: {
          roleStats,
          totalUsers: countResult[0].total
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
      
      const userDetails = await sequelize.query(`
        SELECT 
          u.user_id as id,
          u.imie as name,
          u.nazwisko as surname,
          u.email,
          u.role,
          u."createdAt",
          u."updatedAt",
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM "Users" u
        LEFT JOIN "Orders" o ON u.user_id = o.user_id
        WHERE u.user_id = :userId
        GROUP BY u.user_id, u.imie, u.nazwisko, u.email, u.role, u."createdAt", u."updatedAt"
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (userDetails.length === 0) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
      }

      // Получить последние заказы пользователя
      const recentOrders = await sequelize.query(`
        SELECT 
          id,
          total_amount,
          status,
          "createdAt"
        FROM "Orders"
        WHERE user_id = :userId
        ORDER BY "createdAt" DESC
        LIMIT 5
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        user: userDetails[0],
        recentOrders
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
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
      const user = await sequelize.query(`
        SELECT user_id as id, role FROM "Users" WHERE user_id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
      }

      // Нельзя удалить последнего админа
      const adminCount = await sequelize.query(`
        SELECT COUNT(*) as count FROM "Users" WHERE role = 'admin'
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      if (user[0].role === 'admin' && adminCount[0].count <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nie można usunąć ostatniego administratora' 
        });
      }

      // Удаляем пользователя
      await sequelize.query(`
        DELETE FROM "Users" WHERE user_id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.DELETE
      });

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
