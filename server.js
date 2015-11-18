var express=require('express');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var expressValidator=require('express-validator');
var MongoStore=require('connect-mongo')(session);
var mongoose=require('mongoose');
var path=require('path');
var config=require('./config');
var routes=require('./routes/routes');
var morgan=require('morgan');
var favicon=require('serve-favicon');
var db=mongoose.connect(config.DATABASE,{
    poolSize:20
},function(err){
    if(!err){
        console.log('database connect success');
    }else{
        console.log(err.message);
    }
});



var server=express();


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
/*server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});*/

server.locals.config=config;

server.listen(config.PORT,function(){
    console.log('server start success at port:'+config.PORT);
});

server.on('close',function(){
    console.log('server closed');
    mongoose.disconnect();
});

module.exports=server;
