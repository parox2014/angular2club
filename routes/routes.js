var express=require('express');

module.exports=function(server){
    server.get('/',function(req,res){
        res.render('index',{
            title:'angular2 club'
        });
    });
};