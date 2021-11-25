const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');


//USER GET ALL APPLICATION 
router.get('/app',appController.getApplication);

//USER ADD NEW APPLICATION
router.post('/app',appController.createApllication);




module.exports = router;