/**
 * Created by likecheng on 2015/12/28.
 */
var ctx = require('../domain/model/dataContext');
var md5 = require('md5');

var AuthenticationService = function () {
    var svr = {};

    /**
     * 用户登录
     * @param account
     * @param callback
     * @constructor
     */
    svr.Login = function(account,callback,err){
        ctx.Account.Where('UserName=\''+ account.UserName +'\'').FirstOrDefault(function(accountData){
            var mdPwd = md5(account.Password).toUpperCase();
            if(accountData.Password == mdPwd){
                accountData.LastLoginTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
                accountData.IsOnline = 1;
                ctx.Update(accountData,function(){
                    callback(accountData);
                },{OperationType:'Exclude',Fields:['Id','RegistTime','Password','UserName']});
            }
            else{
                err('登录失败，用户名或密码错误！');
            }
        });
    };
    /**
     * 用户注册
     * @param personData
     * @param cb
     * @constructor
     */
    svr.Register = function (personData,cb,err) {
        ctx.Account.Any('UserName=\''+personData.Account.UserName+'\'',function(r){
            if(!r){
                personData.Account.Password = md5(personData.Account.Password).toUpperCase();
                ctx.Create(personData,function(personId){
                    cb(personId);
                });
            }
            else{
                err('注册失败，已经存在的用户！');
            }
        });
    };

    svr.LogOut = function (accountId, cb, err) {
        ctx.Account.Where('Id='+ accountId).FirstOrDefault(function(accountData){
            console.log(accountData);
            accountData.IsOnline = 0;
            ctx.Update(accountData,function(){
                cb(accountData);
            },{OperationType:'Include',Fields:['IsOnline']});
        });
    };

    return svr;
};

module.exports = AuthenticationService;
