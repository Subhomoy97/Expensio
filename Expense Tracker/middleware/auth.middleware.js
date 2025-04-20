const jwt = require("jsonwebtoken");

const AuthCheck = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({
      message: "Token is required to access this resource.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded will contain `id` or whatever payload you added
    console.log("Authenticated user:", req.user);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please login again." });
    }
    return res.status(403).json({ message: "Invalid token. Access denied." });
  }
};

module.exports = AuthCheck;