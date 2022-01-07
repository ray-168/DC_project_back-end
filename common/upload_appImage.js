
const multer = require("multer");
const mkdirp = require('mkdirp');
const { User } = require('../db/models');
const path = require('path')
/* MULTER FILE UPLOAD MIDDLEWARE */
// define empty array to get originalImgName
const originalImgName = [];
// -> Multer Upload Avatar Storage
const multerUploadImgStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const uploadPath = `${__basedir}/public/appImage/userId${userId}`;
        mkdirp.sync(uploadPath);
        console.log(uploadPath);
        return cb(null, uploadPath);
    },
    filename: async (req, file, cb) => {
        // get userId from token
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        // get file name
        const fileImgName = `${Date.now()}-${user.username}-${file.originalname}`; 

        // pop before push
        originalImgName.pop();
        // push after pop
        originalImgName.push(fileImgName);

        // Show FileImgName in our server
        cb(null, fileImgName);
    },
});

//  -> Filter file types
const imageFilter = (req, file, cb) => {
    const imageList =['.png','.jpg','.gif','.jpeg','.PNG','.JPG','.GIF','.JPEG']
    const ext = path.extname(file.originalname)
    if (imageList.includes(ext)){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//  -> Upload Image File
const uploadImageFile = multer({
    storage: multerUploadImgStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1000 * 1000 }
});

module.exports = {
    uploadImageFile,
    originalImgName
};