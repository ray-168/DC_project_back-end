require('../common/Oauth2Google');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/user_auth');




//USER REGISTER 
router.post('/register',authController.userRegister);

//USER LOGIN
router.post('/login',authController.userLogin);
 
//USER FORGET PASSWORD
router.post('/forget-password',authController.userForgetPassword);


//FIND USER BY TOKEN
router.post('/find',authController.findUser);

module.exports = router;