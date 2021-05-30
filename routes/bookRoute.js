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
        res.redirect(`/books/${newBook.id}`);
    } catch (error) {
        /* if (book.coverImage != null) removeBookCover(book.coverImage); */
        renderNewPage(res, book, true);
    }
});
//Show book
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("author")
            .exec();
        res.render("books/show", { book: book });
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});
router.get("/:id/edit", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});
router.put("/:id", async (req, res) => {
    /* const fileName = req.file != null ? req.file.filename : null; */
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.description = req.body.description;
        book.pageCount = req.body.pageCount;
        if (req.body.cover != null && req.body.cover != "") {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (error) {
        console.log(error);
        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect("/");
        }
    }
});
router.delete("/:id", async (req, res) => {
    let book;
    try {
        book = Book.findById(req.params.id);
        await book.remove();
        res.redirect("/books");
    } catch (error) {
        console.log(error);
        if (book != null) {
            res.render("books/show", {
                book: book,
                err: "Can not remove Book",
            });
        } else {
            res.redirect("/");
        }
    }
});
async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, "new", hasError);
}
async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book: book,
        };
        if (hasError) {
            if (form === "edit") {
                params.err = "Error Updating Book";
            } else {
                params.err = "Error Creating Book";
            }
        }
        res.render(`books/${form}`, params);
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
