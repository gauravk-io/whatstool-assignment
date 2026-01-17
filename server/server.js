require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");

const app = express();

// parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", teamRoutes);

// health check
app.get("/health", (req, res) => {
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
