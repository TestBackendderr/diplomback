const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  async register({ name, surname, email, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      imie: name,
      nazwisko: surname,
      email,
      password: hashedPassword,
      role: role,
    });
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign(
      { userId: user.user_id, userName: user.imie, role: user.role },
      "your-secret-key",
      { expiresIn: "1h" }
    );
    return { token };
  }
}

module.exports = new AuthService();
