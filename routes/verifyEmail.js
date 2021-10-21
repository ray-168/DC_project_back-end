const router = require('express').Router();
const authController= require('../controllers/user_auth');

router.get('/verification/:token',authController.verifyEmail);

module.exports = router;