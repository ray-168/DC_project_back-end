const router = require('express').Router();
const super_adminControler = require('../controllers/super_admin');
const applicationControler  =require('../controllers/application');
const { response } = require('../common/response');




//admin create app
router.post('/app',applicationControler.createApllication);

// get app already approve
router.get('/approve_app',super_adminControler.getApproveApp);

// get none approve app 
router.get('/none_approve_app',super_adminControler.getNoneApproveApp);

// approve app
router.put('/approve/:id',super_adminControler.approveApp);

// deny app request 
router.delete('/deny_app/:id',super_adminControler.denyApp);

// deleted app
router.delete('/delete_app/:id',super_adminControler.deleteApp);

// admin edit app
router.put('/edit_app/:id',super_adminControler.editApp);

module.exports = router;