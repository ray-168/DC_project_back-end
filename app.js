require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressJwt = require('express-jwt');
const { jwtConfig } = require('./config/config');
const { User, Session} = require('./db/models');

var indexRouter = require('./routes/index');
const authRouter = require('./routes/user_auth');
const apllicationRouter = require('./routes/user_application');
const Oauth2Google = require('./routes/Oauth2Google');
const verifyEmail = require('./routes/verifyEmail');
const user_resetPassword = require('./routes/user_resetPassword');
var app = express();



/* PUBLIC ROUTES */
const WHITE_LIST_URL = [
  '/users/register',
  '/users/login',
  '/users/forget-password',
];
const jwt = () => {
  return expressJwt({ secret: jwtConfig.tokenSecret, algorithms: ['HS256'] }).unless({
      path: WHITE_LIST_URL
  });
};

const sessionAuthenticationMiddleware = (req, res, next) => {
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


/* CHECK AUTH FOR ONLY START WITH /api */
app.use('/users', jwt(), sessionAuthenticationMiddleware);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users',authRouter);
app.use('/users',apllicationRouter);
app.use('/auth',Oauth2Google);
app.use('/',verifyEmail);
app.use('/',user_resetPassword);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// mongodb connection
// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Database sucessfully connected')
// },
//   error => {
//     console.log('Database could not be connected: ' + error) 
//   }
// )

module.exports = app;
