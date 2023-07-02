const express = require("express")
const app = express();
const cookieParser = require("cookie-parser");

// using middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

require("dotenv").config({path: "backend/config/config.env"});

const post = require("./routes/post");
const user = require("./routes/user");

//importing routes
app.use("/api/v1", post);
app.use("/api/v1", user);


module.exports = app;