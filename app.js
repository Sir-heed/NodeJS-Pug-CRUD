const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");

// Init App
const app = express();

mongoose.connect(config.database, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

let db = mongoose.connection;

// Check Database connection
db.once("open", () => {
  console.log("connected to MonogDB");
});

// Check for Database errors
db.on("error", err => {
  console.log(err);
});

// Load view engines
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cooke: { secure: true }
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Express validator not working
// Express Validator Middleware
// app.use(
//   expressValidator({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Bring in Models
let Article = require("./models/article");

// Setting a global variable
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles
      });
    }
  });
});

// Route Files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);

// Start Server
app.listen(3000, () => {
  console.log("Server started on port 3000!!!");
});

// let articles = [
//   {
//     id: 1,
//     title: "Article One",
//     author: "Ademola",
//     body: "This is article one."
//   },
//   {
//     id: 2,
//     title: "Article Two",
//     author: "Saheed",
//     body: "This is article two."
//   },
//   {
//     id: 1,
//     title: "Article Three",
//     author: "Adedeji",
//     body: "This is article three."
//   }
// ];
//   res.send("Hello World!");
