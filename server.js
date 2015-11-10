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

var db=mongoose.connect(config.DATABASE,function(err,e){
    if(!err){
        console.log('数据库连接成功');
    }else{
        console.log(err.message);
    }
});



var server=express();

routes(server);

server.set('view engine',config.VIEW_ENGINE);


server.use(morgan('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(expressValidator());

server.use(express.static(path.join(__dirname, 'static')));

server.use(cookieParser());

server.use(session({
    secret:config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:config.COOKIE_MAX_AGE},
    store:new MongoStore({ mongooseConnection: mongoose.connection })
}));


// catch 404 and forward to error handler
server.use(function(req, res, next) {
    console.log('fuck');
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

server.listen(config.PORT,function(){
    console.log('server start success at port:'+config.PORT);
});

module.exports=server;
