const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const compressImage = async (file) => {
    const fileDest = path.resolve(file.destination,'resized',file.filename)
    await sharp(file.path)
    //await sharp(req.file.path)
    .resize(500)
    .png({quality: 50})
    .toFile(
        fileDest
    )
    fs.unlinkSync(file.path)
    return file.filename
}

module.exports = {
    compressImage
}