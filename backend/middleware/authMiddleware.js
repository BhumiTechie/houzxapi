// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");
//     if (!authHeader) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const token = authHeader.replace("Bearer ", "").trim();
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("✅ Decoded token payload:", decoded);

//     // ✅ Make sure token has id & email
//     if (!decoded.id || !decoded.email) {
//       return res.status(400).json({ error: "Invalid token payload" });
//     }

//     // ✅ Attach user data to req for later use
//     req.userId = decoded.id;
//     req.user = decoded;

//     next();
//   } catch (error) {
//     console.error("Auth error:", error.message);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ✅ IMPORTANT
    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
