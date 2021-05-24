const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT || 3000;
// Require Router
const indexRoute = require("./routes/indexRoute");
const authorRoute = require("./routes/authorRoute");
// Set up Views, Layouts
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views/");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

//Set up body parser
app.use(express.json());
app.use(express.urlencoded());

// Set up Router
app.use("/", indexRoute);
app.use("/authors", authorRoute);

// Set up DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
    console.log(error);
});
db.once("open", () => {
    console.log("Connect to Mongoose");
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});

// App listen
