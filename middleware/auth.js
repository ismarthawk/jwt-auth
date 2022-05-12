const flash = require("connect-flash/lib/flash");
const { cookie } = require("express/lib/response");
const jwt = require("jsonwebtoken");
const Users = require("../models/User");

module.exports.protect = async (req, res, next) => {
  var cookies = req.cookies;
  var token = cookies.jwttoken;
  // console.log(token);
  // console.log(req.cookies);
  if (!token) {
    req.flash("message", "You are not logged in");
    return res.redirect("/login");
  } else {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log(decoded.id);
      req.user = await Users.findById(decoded.id);
      console.log(req.user);
      next();
    } catch (err) {
      req.flash("message", "Please login Again");
      return res.redirect("/login");
    }
  }
};
