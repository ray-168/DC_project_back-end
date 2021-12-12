const router = require('express').Router();
const super_adminControler = require('../controllers/super_admin');
const applicationControler  =require('../controllers/application');
const {uploadImageFile} = require('../common/upload_appImage');
//admin create app
router.post('/app',applicationControler.createApllication);

//admin get app already approve
router.get('/approve_app',super_adminControler.getApproveApp);

//admin get all user
router.get('/users',super_adminControler.allUser);

//admin get none approve app
router.get('/none_approve_app',super_adminControler.getNoneApproveApp);

//admin approve app
router.put('/approve/:id',super_adminControler.approveApp);

//admin deny app request 
router.delete('/deny_app/:id',super_adminControler.denyApp);

//admin deleted app
router.delete('/delete_app/:id',super_adminControler.deleteApp);

//super admin edit app
router.put('/edit_app/:id',uploadImageFile.single('appImage'),super_adminControler.editApp);

//super admin change role 
router.put('/role/:id',super_adminControler.changeRole);
module.exports = router;