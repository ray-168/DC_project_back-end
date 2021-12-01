const router = require('express').Router();

const authController = require('../controllers/user_auth');

router.post('/reset-password/:token',authController.userResetPassword);


module.exports = router;