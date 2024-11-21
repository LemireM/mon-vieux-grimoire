const authMiddleware = function (req, res, next) {
    //TODO: Verficiation de token avec JWT.verify
    res.status(401).end()    
    next()
  }

module.exports = authMiddleware