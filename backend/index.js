const express = require("express");
const mongoose = require("mongoose");
const rootRouter = require("./routes/index");
const jwt = require("jsonwebtoken")
const cors = require('cors')
require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/v1", rootRouter);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
