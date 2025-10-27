const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // remove "Bearer " part
    const token = authHeader.replace("Bearer ", "").trim();

    // verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // assign userId from token payload
    req.userId = decoded.id || decoded._id;

    next();
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
