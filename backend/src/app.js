const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:80",
      "http://localhost",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authroutes = require("./routes/auth.routes");
const interviewroutes = require("./routes/interview.routes");

app.use("/api/auth", authroutes);
app.use("/api/interview", interviewroutes);

module.exports = app;
