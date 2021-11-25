const router = require('express').Router();
const passport = require('passport');
const oauth = require('../common/Oauth2Google');

require('../common/Oauth2Google');
router.use(passport.initialize());


//USER AUTHENTICATE WITH GOOGLE
router.get('/google', passport.authenticate('google',{ scope:['profile','email']}));

//REDIRECT USER TO HOME PAGE

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/google' , successRedirect:'/users/app'}) 
)

module.exports = router;

