const router = require('express').Router();
const adminControler = require('../controllers/admin');
const applicationControler  =require('../controllers/application');
const {uploadImageFile} = require('../common/upload_appImage');


//admin create app
router.post('/app',uploadImageFile.single('appImage'),applicationControler.createApllication);

//admin get app already approve
router.get('/approve_app',adminControler.getApproveApp);

//admin get all user
router.get('/users',adminControler.allUser);

//admin get none approve app
router.get('/none_approve_app',adminControler.getNoneApproveApp);

//admin approve app
router.put('/approve/:id',adminControler.approveApp);

//admin deny app request 
router.delete('/deny_app/:id',adminControler.denyApp);

//admin deleted app
router.delete('/delete_app/:id',adminControler.deleteApp);

//super admin edit app
router.put('/edit_app/:id',uploadImageFile.single('appImage'),adminControler.editApp);

//super admin change role 
router.put('/role/:id',adminControler.changeRole);
module.exports = router;