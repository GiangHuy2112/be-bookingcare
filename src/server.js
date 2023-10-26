import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

// app.use(cors({ origin: true }));

var username = "username";

app.get("/", function (req, res) {
  res.cookie("user", username, { maxAge: 10800 }).send("cookie set");
});

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    // "X-Requested-With,content-type,token"
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Token, Cookie"
  );

  // // Set to true if you need the website to include cookies in the requests sent
  // // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // // Pass to next layer of middleware
  next();
});
app.use(cookieParser());
// config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
viewEngine(app);
initWebRoutes(app);

connectDB();

let port = 3003;
// let port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log("Backend NodeJS is running on the port: " + port);
});
