const express = require("express");
const router = express.Router();

// Article Model
let Article = require("../models/article.js");

// User Model
let User = require("../models/user.js");

// Add Route
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("add_article", {
    title: "Add Article"
  });
});

// Add Submit Post Route
router.post("/add", (req, res) => {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.user._id;
  // article.author = req.body.author;
  article.body = req.body.body;
  article.save(err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Added");
      res.redirect("/");
    }
  });
});
// Express validator not working
// req.checkBody("title", "Title is required.").notEmpty();
// req.checkBody("author", "Author is required.").notEmpty();
// req.checkBody("body", "Body is required.").notEmpty();
// Get Errors
// let errors = req.validationErrors();
// if (errors) {
//   res.render("add_articlle", {
//     title: "Add Article",
//     errors: errors
//   });
// } else {
//   let article = new Article();
//   article.title = req.body.title;
//   article.author = req.body.author;
//   article.body = req.body.body;
//   article.save(err => {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       req.flash("success", "Article Added");
//       res.redirect("/");
//     }
//   });
// }

// Load Edit Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author == req.user._id) {
      res.render("edit_article", {
        title: "Edit Article",
        article: article
      });
    } else {
      // console.log("Problem");
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    }
  });
});

// Update Single Article
router.post("/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  let query = { _id: req.params.id };
  Article.updateOne(query, article, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

// Get Single Article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("article", {
        article: article,
        author: user.name
      });
    });
  });
});

// Delete Single Article
router.delete("/:id", (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, function(err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;
