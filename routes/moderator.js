const router = require('express').Router();
const adminControler = require('../controllers/admin');
const applicationControler  =require('../controllers/application');
const { response } = require('../common/response');
const {uploadImageFile} = require('../common/upload_appImage')



//admin create app
router.post('/app',uploadImageFile.single('appImage'),applicationControler.createApllication);

// get app already approve
router.get('/approve_app',adminControler.getApproveApp);

// get none approve app 
router.get('/none_approve_app',adminControler.getNoneApproveApp);

// approve app
router.put('/approve/:id',adminControler.approveApp);

// deny app request 
router.delete('/deny_app/:id',adminControler.denyApp);

// deleted app
router.delete('/delete_app/:id',adminControler.deleteApp);

// admin edit app
router.put('/edit_app/:id',uploadImageFile.single('appImage'),adminControler.editApp);

module.exports = router;