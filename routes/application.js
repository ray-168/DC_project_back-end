const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');
const {uploadImageFile} = require('../common/upload_appImage');

//USER GET ALL APPLICATION 
router.get('/app',appController.getApplication);

//USER ADD NEW APPLICATION
router.post('/app',uploadImageFile.single('appImage'),appController.createApllication);

//USER UPLOAD IMAGE
// router.post('/upload',uploadImageFile.single('appImage'),appController.uploadImage);


module.exports = router;