const express = require('express');
const router = express.Router();
const user_application = require('../controllers/user_application');

//USER GET ALL APPLICATION 
router.get('/application',user_application.userGetApplication);

//USER ADD NEW APPLICATION
router.post('/application',user_application.userAddNewApllication);




module.exports = router;