'use strict';

const crypto=require('crypto');

class Util{

    /**
     * 生成hash字符
     * @param str {String}
     */
    static createHash (str){
        crypto.createHash('sha256').update(str).digest('base64').toString();
    }

    /**
     * 去除结果里的callback
     * @param jsonpStr {String}
     * @returns {JSON|string}
     */
    static transformJSONPData(jsonpStr){
        jsonpStr=jsonpStr.replace(/^callback\(/,'');
        return jsonpStr.replace(');','');
    }

    /**
     * 根据用户信息生成session,并保存最后上线时间
     * @param req {Object}
     * @param user {Object}
     * @param [callback] {function}
     * @returns {Promise}
     */
    static generateSession(req,user,callback){
        callback=callback||noop;

        return new Promise(function(resolve,reject){
            req.session.regenerate(function(){
                req.session.user=user._id;
                req.session.account=user.account;
                req.session.nickName=user.nickName;
                req.session.siteAdmin=user.siteAdmin;
                req.session.msg='Authenticated as '+user.nickName;

                user.set('lastOnline',Date.now());

                user.save(function(err){
                    if(err){
                        reject(err);
                        callback(err,undefined);
                    }else{
                        resolve(user);
                        callback(undefined,user);
                    }
                });

            });
        });
    }

    /**
     * 从model上拾取指定的属性
     * @param model {Object}
     * @param props {Array}
     * @returns {Object}
     */
    static pick(model,props){
        let result={};

        props.forEach(function(prop){
            let value=model[prop];
            if(value){
                result[prop]=value;
            }
        });

        return result;
    }

    /**
     * 处理响应错误
     * @param  {[Object]} req [description]
     * @param  {[Object]} res [description]
     * @param  {[Object]} err [错误信息]
     * @return {[undefined]}     [description]
     */
    static handleError(req,res,err){
        logger.error('catch error',err);
        let code=err.code||500;

        res.status(code);

        if(req.xhr){
            res.send(err);
        }else{
            res.render('error', {
                title:err.msg,
                message: err.msg,
                error: err
            });
        }
    }
}

module.exports=Util;
