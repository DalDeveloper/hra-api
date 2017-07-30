
module.exports = function(Employees, mongoose){
  var express = require('express');
  var session = require('express-session');
  //var MongoStore = require('connect-mongo')(session);
  var MongoStore = require('connect-mongo');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var Employees1 = {};
  var index = require('./routes/index')(Employees);
  var api_mongo = require('./routes/api-mongo')(Employees);
 // var api_mssql = require('./routes/api-mssql')();
  //var apiRoutes = require('./routes/api');

  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  //app.set('view engine', 'jade');
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(bodyParser.urlencoded({ extended: true, limit: '5mb', parameterLimit: 1000000 }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  /*
  app.use(session({
    secret: 'Super Secret Session Key',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({url: 'mongodb://daadmin:admin123@ds143151.mlab.com:43151/hra'})
  }));
  */
  // Use express session support since OAuth2orize requires it
  app.use(session({
    secret: 'Super Secret Session Key',
    saveUninitialized: true,
    resave: true
  }));
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
 
  app.use('/api/v1/', api_mongo);
  //app.use('/api/v2/', api_mssql);
  
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    err.msg = 'Invalid request';
    res.json(err);
  });

  return app;
}