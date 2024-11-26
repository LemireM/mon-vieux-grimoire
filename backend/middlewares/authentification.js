const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const authMiddleware = function (req, res, next) {
    //TODO: Verficiation de token avec JWT.verify
    const token = req.headers.authorization
    if (!token)
      return res.status(401).end()
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status().end()
      req
    next()
  }
}
module.exports = authMiddleware
