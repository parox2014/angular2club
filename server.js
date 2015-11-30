'use strict';

const log4js = require('log4js');
global.logger = log4js.getLogger();
global.noop=function(){};

const express=require('express');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const expressValidator=require('express-validator');
const MongoStore=require('connect-mongo')(session);
const mongoose=require('mongoose');
const path=require('path');
const config=require('./config');
const routes=require('./routes');
const morgan=require('morgan');
const favicon=require('serve-favicon');
const middleware=require('./middlewares');

const server=express();

server.set('view engine',config.VIEW_ENGINE);


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(expressValidator());

server.use(express.static(path.join(__dirname, 'static')));

server.use(cookieParser());

server.use(favicon(__dirname+'/static/images/favicon.ico'));

server.use(session({
    secret:config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:config.COOKIE_MAX_AGE},
    store:new MongoStore({ mongooseConnection: mongoose.connection })
}));

server.use(middleware.handleError);

server.use(middleware.handleSession)

routes(server);

server.use(morgan('dev'));

// catch 404 and forward to error handler
server.use(function(req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});


// 错误处理
// 开发环镜
if (server.get('env') === 'development') {
    server.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title:err.message,
            message: err.message,
            error: err
        });
    });

}

// 生产环境错误处理
server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.locals.config=config;

server.listen(config.PORT,function(){
    logger.info('server start success at port:'+config.PORT);
});

module.exports=server;
