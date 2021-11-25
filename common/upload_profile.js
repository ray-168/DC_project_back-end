
const multer = require('multer');
const mkdirp = require('mkdirp');
const { User } = require('../db/models');

/* MULTER FILE UPLOAD MIDDLEWARE */
// define empty array to get originalAvatarName
const originalProfileName = [];
// -> Multer Upload Avatar Storage
const multerUploadAvatarStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const uploadPath = `${__basedir}/public/userprofile/userId${userId}`;
        mkdirp.sync(uploadPath);
        console.log(uploadPath);
        return cb(null, uploadPath);
    },
    filename: async (req, file, cb) => {
        // get file extension
        const fileExtension = `.${file.originalname.split('.').reverse()[0]}`;

        // get userId from token
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        // get avatarName
        const profileName = `${Date.now()}-${userId}-${user.username}${fileExtension}`;

        // pop before push
        originalProfileName.pop();
        // push after pop
        originalProfileName.push(profileName);

        // Show avatarName in our server
        cb(null, profileName);
    },
});

//  -> Filter file types
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//  -> Upload Image Avatar File
const uploadProfileFile = multer({
    storage: multerUploadAvatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1000 * 1000 }
});

module.exports = {
    uploadProfileFile,
    originalProfileName
};