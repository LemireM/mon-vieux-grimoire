const multer = require('multer')
const mime = require('mime-types')

const uploader = function () {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './static/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + "." + mime.extension(file.mimetype))
    }
  })
  
    const upload = multer({ storage })
    return upload.single('image')
  }

module.exports = uploader()