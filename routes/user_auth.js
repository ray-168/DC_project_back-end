require('../common/Oauth2Google');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/user_auth');
const passport = require('passport');


router.use(passport.initialize());

//USER REGISTER 
router.post('/register',authController.userRegister);

//USER LOGIN
router.post('/login',authController.userLogin);
 
//USER LOGOUT
router.post('/logout',authController.userLogout);

//USER CHANGE PASSWORD
router.post('/changePassword',authController.userChangePassword);

//USER FORGET PASSWORD
router.post('/forget-password',authController.userForgetPassword);



module.exports = router;