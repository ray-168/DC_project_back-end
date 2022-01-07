require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport')
const expressJwt = require('express-jwt');
const session = require('express-session');
const { jwtConfig } = require('./config/config');
const { User, Session} = require('./db/models');
const {response} = require('./common/response');
const {ROLE_USER,ROLE_ADMIN,ROLE_SUPER_ADMIN} = require('./common/constant');

var indexRouter = require('./routes/index');
const authRouter = require('./routes/user_auth');
const apllicationRouter = require('./routes/application');
const Oauth2Google = require('./routes/Oauth2Google');
const verifyEmail = require('./routes/verifyEmail');
const user_resetPassword = require('./routes/user_resetPassword');
const adminRouter = require('./routes/admin');
const moderatorRouter= require('./routes/moderator');
const publishRoutes = require('./routes/publishRoutes');
const app = express();




/* PUBLIC ROUTES */
const WHITE_LIST_URL = [
  '/users/find',
  '/users/register',
  '/users/login',
  '/users/forget-password',
];

const jwt = () => {
  return expressJwt({ secret: jwtConfig.tokenSecret, algorithms: ['HS256'] }).unless({
      path: WHITE_LIST_URL
  });
};

const sessionAuthenticationMiddleware = (req, res,next) => {
  if (WHITE_LIST_URL.indexOf(req.originalUrl) >= 0) {
  return next();
  }
  return User.findOne({
      attributes: ['id'],
      where: { id: req.user.id },
      include: [{
      model: Session,
      as: 'session',
      attributes: [], 
      where: {
      accessToken: req.headers['authorization'].split(' ')[1]

  }
  }],
  }).then((results) => {
  return results === null ? next(createError.Unauthorized()) : next();
  
  }).catch(() => {
  return next(createError.Unauthorized());
  });
  };

// ROLE BASE MANAGE

const checkRole = function(Role){
  return (req,res,next)=>{
    const roleArray = req.user.role.split(' & ')
    if(!roleArray.includes(Role)){
      return res.status(401).send(response(`Unauthorized!!, only for ${Role}`))
    }
    next()
  }
}

/* CHECK AUTH FOR ONLY START WITH /api */
// app.use(['/users','/super_admin','/admin','/test'], jwt(), sessionAuthenticationMiddleware);

/* SET BASE DIR TO UPLOAD FILE */
global.__basedir = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cors())

app.use(passport.initialize());
// app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'Data_center_2.0',
  saveUninitialized: true,
  resave: true
}));






// static file
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'public/images')));

//prevent defualt express get request from favicon file
app.get('/favicon.ico', (req, res) => res.status(204));


app.use('/',verifyEmail);
app.use('/',user_resetPassword);
app.use('/auth',Oauth2Google);
app.use('/api/users',publishRoutes);
app.use('/users',jwt(),sessionAuthenticationMiddleware,checkRole('ROLE_USER'),authRouter);
app.use('/users',jwt(),sessionAuthenticationMiddleware,checkRole('ROLE_USER'),apllicationRouter);
app.use('/moderator',jwt(),sessionAuthenticationMiddleware,checkRole('ROLE_MODERATOR'),moderatorRouter);
app.use('/admin',jwt(),sessionAuthenticationMiddleware,checkRole('ROLE_ADMIN'),adminRouter); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'production' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error")
  console.log(err.message)
 
  
});

module.exports = app;
