const express = require("express");
const app = express();
const Users = require("./models/User");
const cookeiParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const session = require("express-session");
const flash = require("connect-flash");

const dotenv = require("dotenv").config({
  path: "./config/config.env",
});

const { connectDB } = require("./config/dbConfig");
connectDB();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookeiParser());

app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// middleware

const { protect } = require("././middleware/auth");

app
  .route("/login")
  .get((req, res, next) => {
    try {
      const cookies = req.cookies;
      const token = cookies.jwttoken;
      if (token) {
        return res.redirect("/");
      }
    } catch (err) {
      console.log(err);
    }
    res.render("login", { message: req.flash("message") });
  })
  .post(async (req, res, next) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });
    if (!user) {
      req.flash("message", "User not found");
      return res.redirect("/login");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("message", "Password is incorrect");
        return res.redirect("/login");
      } else {
        const token = await user.getJwtToken();
        res.cookie("jwttoken", token, {
          httpOnly: true,
        });
        console.log("token set to ", token);
        res.redirect("/");
      }
    }
  });

app
  .route("/register")
  .get((req, res, next) => {
    res.render("register");
  })
  .post(async (req, res, next) => {
    const { username, password } = req.body;
    await Users.create({ username, password });
    req.flash("message", "User created successfully");
    res.redirect("/login");
  });

app.route("/").get(protect, async (req, res, next) => {
  const users = await Users.find();
  const jwttoken = req.cookies.jwttoken;
  console.log(req.user);
  res.render("home", {
    users: users,
    current: req.user,
    jwttoken: req.cookies.jwttoken,
  });
});

app.listen(3000, () => {
  console.log("Server runnig on port 3000");
});
