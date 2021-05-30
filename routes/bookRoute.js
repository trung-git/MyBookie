const express = require("express");
const router = express.Router();
/* const multer = require("multer"); */
/* const path = require("path"); */
/* const fs = require("fs"); */
const Author = require("../models/authors");
const Book = require("../models/books");
const { query } = require("express");
/* const uploadPath = path.join("public", Book.imagePath); */
const imgMimeTyes = ["image/jpeg", "image/png", "image/gif"];
/* const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, imgMimeTyes.includes(file.mimetype));
    },
}); */
// All books
router.get("/", async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title != "") {
        query = query.regex("title", new RegExp(req.query.title, "i"));
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
        query = query.lte("publishDate", req.query.publishedAfter);
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
        query = query.gte("publishDate", req.query.publishedBefore);
    }
    try {
        const books = await query.exec();

        res.render("books/index", {
            books: books,
            searchOptions: req.query,
        });
    } catch (error) {
        res.redirect("/");
    }
});

// New Book
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book());
});
router.post("/", async (req, res) => {
    /* const fileName = req.file != null ? req.file.filename : null; */
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });
    /* console.log(req.body.cover); */
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect("/books");
    } catch (error) {
        /* if (book.coverImage != null) removeBookCover(book.coverImage); */
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book: book,
        };
        if (hasError) params.err = "Error Creating Book";
        res.render("books/new", params);
    } catch (error) {
        res.redirect("/books");
    }
}
/* function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), (err) => {
        if (err) console.log(err);
    });
} */
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    /* console.log("cover in saveCover : ", cover); */
    if (cover != null && imgMimeTyes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverImageType = cover.type;
    }
}
module.exports = router;
