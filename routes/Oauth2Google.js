const router = require('express').Router();
const passport = require('passport');
require('./user_auth');
require('../common/Oauth2Google');
router.use(passport.initialize());

//USER AUTHENTICATE WITH GOOGLE
router.get('/google', passport.authenticate('google',{ scope:['profile','email']}));

//REDIRECT USER TO HOME PAGE

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/google' , successRedirect:'/'})
)

module.exports = router;

