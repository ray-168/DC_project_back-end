const {User} = require('../db/models');
const {Oauth20Config} =require('../config/config');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user.emails);
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
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({where:{ email: profile.emails }}, function (err, user) {
      return done(err, user);
    });
    console.log(profile.emails);
  }
));