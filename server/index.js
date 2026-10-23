const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authorsRoutes = require("./routes/authors.routes");
const withdrawalsRoutes = require("./routes/withdrawals.routes");

const errorHandler = require("./middleware/errorHandler");
const { login } = require("./controllers/auth.controller");
const authenticate = require("./middleware/auth");

require("dotenv").config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    process.env.CORS_URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Royalty Management API is running",
    endpoints: {
      authors: "/authors",
      authorDetails: "/authors/:id",
      authorSales: "/authors/:id/sales",
      createWithdrawal: "POST /withdrawals",
      authorWithdrawals: "/authors/:id/withdrawals",
      login: "POST /auth/login",
      health: "/health",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Authentication
app.post("/auth/login", login);

// API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});
app.use(authenticate)
app.use("/authors", authorsRoutes);
app.use("/withdrawals", withdrawalsRoutes);
app.use("/books", require("./routes/books.routes"));
app.use("/tickets", require("./routes/tickets.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Royalty API running on port ${PORT}`);
});

module.exports = app;