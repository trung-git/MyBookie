const { response } = require("express");
const express = require("express");
const router = express.Router();

const Author = require("../models/authors");
const Books = require("../models/books");
// All author
router.get("/", async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const authors = await Author.find(searchOptions);
        res.render("authors/index", { authors, searchOptions: req.query });
    } catch (error) {
        res.redirect("/");
    }
});

// New Author
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
});
router.post("/", async (req, res) => {
    const author = new Author({
        name: req.body.name,
    });
    try {
        const newAuthor = await author.save();
        res.redirect("/authors");
    } catch (error) {
        res.render("authors/new", {
            author: author,
            err: "Error Creating Author",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Books.find({ author: author.id }).limit(6).exec();
        res.render("authors/show", {
            author,
            booksByAuthor: books,
        });
    } catch (error) {
        res.redirect("/");
    }
});
router.get("/:id/edit", async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render("authors/edit", { author: author });
    } catch (error) {
        res.redirect("/authors");
    }
});
router.put("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch (error) {
        if (author == null) {
            res.redirect("/");
        } else {
            res.render("authors/new", {
                author: author,
                err: "Error Updating Author",
            });
        }
    }
});
router.delete("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id.toString());
        await author.remove();
        res.redirect(`/authors`);
    } catch (error) {
        console.log(error);
        if (author == null) {
            res.redirect("/");
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
});
module.exports = router;
