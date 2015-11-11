var express=require('express');

module.exports=function(server){
    var controllers=require('../controllers/controllers');

    server.get('/',function(req,res){
        res.render('index',{
            title:'angular2 club'
        });
    });

    server.get('/unique',controllers.userCtrl.unique);
};