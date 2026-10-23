
const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;

    console.log('auth header data', authHeader?.slice(0, 20));


    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Issued at:", new Date(decoded.iat * 1000));
    console.log("Expires at:", new Date(decoded.exp * 1000));
    console.log("Current time:", new Date());

    const user = await User.findById(decoded.id);
    console.log('user data', user);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      authorId: user.authorId,
    };
    console.log("USER BEFORE NEXT:", req.user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
