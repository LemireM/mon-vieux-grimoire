const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config()
const { JWT_SECRET } = process.env;

const authMiddleware = function (req, res, next) {
    let token = req.headers.authorization
    if (!token)
      return res.status(401).end()

    token = token.split(' ')[1]    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({message: 'Non autorisé'})
      
      req.userId = decoded._id
      next()
  })
}
module.exports = authMiddleware
