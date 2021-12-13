const router = require('express').Router();
const passport = require('passport');
const oauth = require('../common/Oauth2Google');
const {response} =require('../common/response')
require('../common/Oauth2Google');
router.use(passport.initialize());


//USER AUTHENTICATE WITH GOOGLE
router.get('/google', passport.authenticate('google',{ scope:['profile','email']}));

//REDIRECT USER TO HOME PAGE

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/google'}),(req,res)=>{
    const token = (req.user.session.dataValues.accessToken)
    res.redirect(`http://127.0.0.1:5500/DC_project_front-end/login.html?${token}`)

    
  } 
)

module.exports = router;

