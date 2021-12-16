const router = require('express').Router();

const authController = require('../controllers/user_auth');

router.post('/resetPassword',authController.userResetPassword);


module.exports = router;