/**
 * Created by likecheng on 2015/12/29.
 */

var Account = function (obj) {
    this.Id = null;
    this.UserName = null;
    this.Password = null;
    this.LastLoginTime = null;
    this.RegistTime = null;
    this.AccountStatus = 0;
    this.IsOnline = null;

    this.toString = function(){
        return 'Account';
    };

    clone(obj,this);
};
var Person = function (obj) {
    this.Id = null;
    this.Name = null;
    this.AccountId = null;
    this.Account = new Account();

    this.toString = function () {
        return "Person";
    };

    clone(obj,this);
};

var EntityObjectModel = function () {
    this.Account = Account;
    this.Person = Person;

    this.EntityObjectMap = [
        Account,
        Person
    ];
};
function clone(obj,resultObj){
    if(!obj) return;
    for(var i in obj){
        for(var j in resultObj){
            if(j == i && j != 'function'){
                resultObj[j] = obj[i];
            }
        }
    }
    return resultObj;
}

module.exports = new EntityObjectModel();
