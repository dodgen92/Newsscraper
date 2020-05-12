var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

//route to article
router.get("/", function (req, res) {
  res.redirect("/articles");
});

router.get("/scrape", function (req, res) {
  request("http://www.barrons.com", function (error, response, html) {
    var $ = cheerio.load(html);
    var titlesArray = [];
    //scrapes from class
    $("article").each(function (i, element) {
      var result = {};

      result.title = $(element).find("a").text();
      result.link = $(element).find("a").attr("href");
      result.summary = $(element).find("p").text();

      //console.log("this is title results" + result.title);
      //console.log("this is link results" + result.link);

      //prevents duplicates
      if (result.title !== "" && result.link !== "") {
        if (titlesArray.indexOf(result.title) == -1) {
          titlesArray.push(result.title);

          Article.count({ title: result.title }, function (err, test) {
            if (test === 0) {
              var entry = new Article(result);

              entry.save(function (err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
            }
          });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }
    });
    res.redirect("/");
  });
});

//articles route
router.get("/articles", function (req, res) {
  Article.find()
    .sort({ _id: -1 })
    .exec(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("index", artcl);
      }
    });
});

//scrapes into json
router.get("/articles-json", function (req, res) {
  Article.find({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

//clears all articles
router.get("/clearAll", function (req, res) {
  Article.remove({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("removed all article");
    }
  });
  res.redirect("/article-json");
});

router.get("/readArticle/:id", function (req, res) {
  var articleId = req.params.id;
  var hbsObj = {
    article: [],
    body: [],
  };

  //finds article by id and grabs from link
  Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function (err, doc) {
      if (err) {
        console.log("Error: " + err);
      } else {
        hbsObj.article = doc;
        var link = doc.link;
        request(link, function (error, response, html) {
          var $ = cheerio.load(html);

          $("article").each(function (i, element) {
            hbsObj.body = $(this)
              .children("a")
              .children("href")
              .text();

            res.render("article", hbsObj);
            return false;
          });
        });
      }
    });
});
router.post("/comment/:id", function (req, res) {
  var user = req.body.name;
  var content = req.body.comment;
  var articleId = req.params.id;

  var commentObj = {
    name: user,
    body: content,
  };

  var newComment = new Comment(commentObj);

  newComment.save(function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log(doc._id);
      console.log(articleId);

      Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: doc._id } },
        { new: true }
      ).exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/readArticle/" + articleId);
        }
      });
    }
  });
});

module.exports = router;
