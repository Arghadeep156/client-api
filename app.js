require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");

// API Security
// app.use(helmet());

//Handle CORS error
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only requests from localhost:3000
    methods: "GET,POST,PATCH,DELETE,PUT", // Allow only GET and POST requests (or more as needed)
  })
);

//MongoDb Connection Setup
if (process.env.NODE_ENV !== "production") {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Mongo Db connect is on baby");
      app.listen(port, () => {
        console.log(`Server is running on port ${[port]}`);
      });
    })
    .catch((error) => {
      console.log("Mongo Db Connection error", error.message);
    });
  //Logger
  app.use(morgan("combined"));
}

//Set up body-parser - Set up the response into object so that it can be easily accessible in our code.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Load Router
const userRouter = require("./src/routers/userRouter");
const ticketRouter = require("./src/routers/ticketRouter");
const tokenRouter = require("./src/routers/tokenRouter");

//Use routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokenRouter);
//Load ErrorHandler
const handleError = require("./src/utils/errorHandler");

//Use Error Handler
app.use("*", (req, res, next) => {
  const error = new Error("Resources not found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  handleError(error, res);
});

// app.use("*", (req, res, next) => {
//   res.json({ message: "Resources not found" });
// });

// app.listen(port, () => {
//   console.log(`API is ready on http://localhost:${port}`);
// });
