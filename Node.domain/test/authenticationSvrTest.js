/**
 * Created by lee on 2016/1/5.
 */

var assert = require('assert');
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

var enObjModel = require('../domain/model/EntityObjectModel');
var authenticationSvr = new require('../services/AuthenticationService')();

describe("authenticationSvrTest",function(){
    it("注册用户的单元测试", function () {

        var person = new enObjModel.Person();
        person.Account.UserName = 'lkc1';
        person.Account.Password = '123';
        person.Account.RegistTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
        person.Name = 'likecheng';

        try{
            authenticationSvr.Register(person,function(personId){
                console.log(personId);
            });
        }
        catch(ex){
            console.log(444);
        }
    })
});