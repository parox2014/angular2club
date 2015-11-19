'use strict';
const SIGNIN_URL='./signin';


exports.signinRequired=function (req,res,next) {
    if(req.session.user){
        next();
    }else{
        console.log(req.xhr);
        if(req.xhr){
            res.set('X-Error','signin required');
            res.status(403).send({msg:'signin required'})
        }else{
            res.redirect(SIGNIN_URL);
        }
    }
};

exports.adminRequired=function (req,res,next) {
    if(req.session.siteAdmin){
        next()
    }else{
        logger.warn('需要管理员权限');
        if(req.xhr){
            res.set('X-Error','admin required');
            res.status(403).send({msg:'admin required'})
        }else{
            res.redirect('/');
        }
    }
};


