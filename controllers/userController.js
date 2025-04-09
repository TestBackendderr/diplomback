const userService = require("../services/userService");

class UserController {
  async getUser(req, res) {
    try {
      const user = await userService.getUser(req.userId);
      res.json({ success: true, userData: user });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching user data" });
    }
  }

  async getUserInfo(req, res) {
    try {
      const userInfo = await userService.getUserInfo(req.userId);
      res.json({ success: true, userInfo });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching user info" });
    }
  }

  async updateUserInfo(req, res) {
    try {
      const userInfo = await userService.updateUserInfo(req.userId, req.body);
      res.json({ success: true, message: "User info updated successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error updating user info" });
    }
  }
}

module.exports = new UserController();
