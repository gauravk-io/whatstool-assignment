require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");

const app = express();





/**
 * this block of code is only for the allowing CORS in production.
 * otherwise simple app.use(cors()); is sufficient for development.
 */

// CORS configuration
const allowedOrigins = ["http://localhost:5173"];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.MODE !== "production") {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));







// parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", teamRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Running" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

// Error handling
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});
