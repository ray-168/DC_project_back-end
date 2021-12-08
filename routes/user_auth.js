require('../common/Oauth2Google');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/user_auth');
const appController = require('../controllers/application');
const {uploadProfileFile} = require('../common/upload_profile');



 
//USER LOGOUT
router.post('/logout',authController.userLogout);

//USER CHANGE PASSWORD
router.put('/changePassword',authController.userChangePassword);

//USER UPLOAD PROFILE
router.post('/upload_profile',uploadProfileFile.single('profile'),authController.userUploadProfile);

//USER GET PROFILE 
router.get('/profile',authController.userGetProfile);

//USER UPDATE PROFILE INFORMATION
router.put('/profile',authController.userUpdateProfile);
module.exports = router;