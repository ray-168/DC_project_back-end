const router = require('express').Router();
const passport = require('passport');
const oauth = require('../common/Oauth2Google');
const {response} =require('../common/response')
require('../common/Oauth2Google');
router.use(passport.initialize());


//USER AUTHENTICATE WITH GOOGLE
router.get('/google', passport.authenticate('google',{ scope:['profile','email']}));

//REDIRECT USER TO HOME PAGE AFTER LOGIN SUCCESSFUL WITH GOOGLE

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/google'}),(req,res)=>{
    const token = (req.user.session.dataValues.accessToken)
    res.redirect(process.env.CLIENT_LOGIN+`?${token}`) 
  } 
)

module.exports = router;

