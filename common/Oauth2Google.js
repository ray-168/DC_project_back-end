const {User,Session} = require('../db/models');
const {Oauth20Config} =require('../config/config');
const {response}  = require('../common/response');
const {getUserRole}  =require('./util');
const jwt = require('jsonwebtoken')
const {jwtConfig} = require('../config/config')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser(function(user, done) {
  done(null,user)
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: Oauth20Config.Client_ID,
    clientSecret: Oauth20Config.Client_Secret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate({where:{ email: profile.emails }}, function (err, user) {
    //   return done(err, user);
    // });
    try{
      const user = await User.findOne({where:{
        email:profile._json.email
      },include:{
        model:Session,
        as:'session'
      }});
      // check if user already sign in before no need to create again
      if (user){
        if (!user.session.accessToken){
        // generate new accesstoken and refreshToken for already exist user sign in from google
        const payload ={
          id:user.id,
          email:user.email,
          role:user.role
        }
        const accessToken = jwt.sign(payload,jwtConfig.tokenSecret,{expiresIn:jwtConfig.tokenExpire});
        const refreshToken = jwt.sign(payload,jwtConfig.refreshTokenSecret,{expiresIn:jwtConfig.refreshTokenExpire});
        
        // update user again with token and user id 
        await Session.update({ 
          accessToken:accessToken,
          refreshToken:refreshToken
        },{where:{
          id:user.session.id
        }})
        }
        return done(null,user); 
      }
      //if user not create yet 
      else{
        // insert user into db
        const createUser = await User.create({
          username:profile.displayName,
          email:profile._json.email,
          profile:profile._json.picture,
          role:getUserRole(),
          isConfirm:true,
          session:{
            accessToken:null,
            refreshToken:null
          }
        },{
          include:[{
            model:Session,
            as:'session'
          }]
        });

        // payload importane data
        const payload = {
          id:createUser.id,
          email:createUser.email,
          role:createUser.role
        }
        const accessToken = jwt.sign(payload,jwtConfig.tokenSecret,{expiresIn:jwtConfig.tokenExpire});
        const refreshToken = jwt.sign(payload,jwtConfig.refreshTokenSecret,{expiresIn:jwtConfig.refreshTokenExpire});
        
        // update user again with token and user id 
        await Session.update({ 
          accessToken:accessToken,
          refreshToken:refreshToken
        },{where:{
          id:createUser.session.id
        }})
        return done(null,createUser);
      }
    }
    catch(err){
      console.log(err.message);
    } 
  }
));