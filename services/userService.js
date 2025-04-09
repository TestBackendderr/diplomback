const User = require("../models/User");
const UserInfo = require("../models/UserInfo");

class UserService {
  async getUser(userId) {
    return await User.findByPk(userId, {
      attributes: ["imie", "nazwisko", "email"],
    });
  }

  async getUserInfo(userId) {
    return await User.findOne({
      where: { user_id: userId },
      include: UserInfo,
    });
  }

  async updateUserInfo(userId, info) {
    const [userInfo, created] = await UserInfo.findOrCreate({
      where: { user_id: userId },
      defaults: { ...info, user_id: userId },
    });
    if (!created) {
      await userInfo.update(info);
    }
    return userInfo;
  }
}

module.exports = new UserService();
