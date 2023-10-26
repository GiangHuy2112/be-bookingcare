const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) {
        res.status(403).json("Token is invalid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You're not authenticated");
  }
};

const verifyTokenAndAdminAndDoctor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req?.user?.id === req.query.id || req?.user?.roleId === "R1") {
      next();
    } else {
      res.status(403).json("You're not allowed to delete other");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdminAndDoctor,
};
