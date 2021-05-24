const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
require("dotenv").config();

const indexRoute = require("./routes/indexRoute");

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views/");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

app.use("/", indexRoute);

const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
    console.log(error);
});
db.once("open", () => {
    console.log("Connect to Mongoose");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
