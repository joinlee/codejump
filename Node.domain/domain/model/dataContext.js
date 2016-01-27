/**
 * Created by likecheng on 2015/12/25.
 */

require('linqjs');
var async = require('async');
var mysql = require('mysql');
var queues = require('mysql-queues');
var enObjModel = require('./EntityObjectModel');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'onetwo',
    database:'codejump',
    port: 3306
});

var dataContext = function () {
    var obj = {};

    obj.Account = new enObjModel.Account();
    obj.Person = new enObjModel.Person();

    /**
     *
     * @param entityObject 需要插入的上下文实体对象
     * @param callback 回调函数
     * @constructor
     */
    obj.Create = function (entityObject,callback) {
        queues(conn);
        var trans = conn.startTransaction();

        var sqlQueryFuncList = [];
        var currentTableName = null;
        for(var i in entityObject){
            if(typeof(entityObject[i]) == 'object' && enObjModel.EntityObjectMap.any(function(n){ return (new n()).toString() == i; })){
                var entityObj = entityObject[i];
                var sql = Insert(entityObj);
                currentTableName = i;
                sqlQueryFuncList.push(function(cb){
                    trans.query(sql);
                    trans.query('SELECT LAST_INSERT_ID() as Id;',function(err,results){
                        cb(null,[{pName:currentTableName+'Id',pValue:results[0].Id}]);
                    });
                });
            }
        }

        sqlQueryFuncList.push(function(args,cb){
            if(args) args.forEach(function(r){entityObject[r.pName] = r.pValue;})
            var sql = Insert(entityObject);
            trans.query(sql);
            trans.query('SELECT LAST_INSERT_ID() as Id;',function(err,results){
                cb(null,results[0].Id);
            });
        });

        async.waterfall(sqlQueryFuncList,function(err,result){
            if(err){
                trans.rollback();
                throw err;
            }
            else{
                trans.commit();
                callback(result);
            }
        });
        trans.execute();
    };
    /**
     *
     * @param entityObject 数据上下文对象
     * @param callback 回调函数
     * @param options {OperationType:操作类型'Exclude','Include',Fields:'包含或者不包含的字段列表'}
     * @constructor
     */
    obj.Update = function(entityObject,callback,options){
        var propertyList = analysisEntityObject(entityObject);
        var sqlStr = 'UPDATE `'+ entityObject.toString() +'` ';
        sqlStr += 'SET ';

        var t = [];
        var pushToTArray = function (item) {
            if(IsNum(item.propertyValue))
                t.push(item.propertyName+'='+item.propertyValue);
            else
                t.push(item.propertyName+'=\''+item.propertyValue+'\'');
        };
        if(options){
            propertyList.forEach(function(item){
                if(!item.propertyValue && item.propertyValue!=0) return;
                if(options.OperationType == 'Exclude' && !options.Fields.any(function(n){ return n == item.propertyName; })) {
                    pushToTArray(item);
                }
                if(options.OperationType == 'Include' && options.Fields.any(function(n){ return n == item.propertyName; })){
                    pushToTArray(item);
                }
            });
        }
        else{
            propertyList.forEach(function(item){
                if(!item.propertyValue) return;
                pushToTArray(item);
            });
        }

        sqlStr += t.join(',');
        sqlStr += ' WHERE Id=' + entityObject.Id + ';';

        obj.SubmitQuery([sqlStr],callback);
    };
    obj.Delete = function (entityObject,callback) {
        if(!entityObject) throw '实体对象不能为空！';
        var sqlStr = 'DELETE FROM `'+ entityObject.toString() +'` WHERE Id='+ entityObject.Id;
        obj.SubmitQuery([sqlStr],callback);
    };
    
    /**
     *
     * @param sqlQueryList
     * @param callback
     * @constructor
     */
    obj.SubmitQuery = function(sqlQueryList, callback){
        queues(conn);
        var trans = conn.startTransaction();
        var funcList = [];
        for(var i=0;i<sqlQueryList.length;i++){
            var s = sqlQueryList[i];
            funcList.push(function(cb){
                console.log('sql string:',s);
                trans.query(s, cb);
            });
        }

        async.series(funcList,function(err,results){
            if(err){
                trans.rollback();
                callback(err);
            }
            else{
                trans.commit();
                callback(results);
            }
        });
        trans.execute();
    };

    var analysisEntityObject = function (entityObject) {
        var result = [];
        for(var i in entityObject){
            if(typeof(entityObject[i]) != 'function' && !enObjModel.EntityObjectMap.any(function(n){ return (new n()).toString() == i; })){
                result.push({
                    propertyName:i,
                    propertyValue:entityObject[i]
                });
            }
        }

        return result;
    };
    var Where = function(queryParam){
        var sqlStr = 'SELECT * FROM `' + this.toString() +'` WHERE ' + queryParam + ';';
        this.sqlTemp = sqlStr;
        return this;
    };
    var FirstOrDefault = function (callback) {
        var objName = this.toString();
        var resultData = null;
        var resultFunction = function (results) {
            enObjModel.EntityObjectMap.forEach(function (item) {
                if((new item()).toString() == objName) resultData = new item(results[0][0][0]);
            });
            if(results) callback(resultData);
            else callback(null);
        };
        if(this.sqlTemp){
            console.log(this.sqlTemp);
            obj.SubmitQuery([this.sqlTemp], resultFunction);
        }
        else{
            var sqlStr = 'SELECT * FROM `'+ this.toString() +'` LIMIT 1;';
            obj.SubmitQuery([sqlStr], resultFunction);
        }
    };
    var Any = function (queryParam,callback) {
        var sqlStr = 'SELECT COUNT(*) AS Count FROM `' + this.toString() +'` WHERE ' + queryParam + ';';
        obj.SubmitQuery([sqlStr], function(result){
            var r = false;
            var item = result[0][0][0];
            if(item.Count>0) r = true;
            callback(r);
        });
    };
    var ToList = function(callback){
        obj.SubmitQuery(callback);
    };
    var Insert = function (entityObject) {
        var propertyList = analysisEntityObject(entityObject);
        var sqlStr = 'INSERT INTO `'+ entityObject.toString() +'` (' +
            propertyList
                .where(function (r) {return r.propertyValue!=null || r.propertyValue!=undefined})
                .select(function(r){return r.propertyName;}).join(',')
            + ') VALUES (';
        sqlStr += propertyList
            .where(function (r) {return r.propertyValue!=null || r.propertyValue!=undefined})
            .select(function (r) {var result = '\'' + r.propertyValue + '\'';return result;}).join(',');
        sqlStr += ');';

        console.log(sqlStr);
        return sqlStr;
    };

    for(var i in enObjModel.EntityObjectMap){
        if(!enObjModel.EntityObjectMap[i].prototype) continue;
        enObjModel.EntityObjectMap[i].prototype.Where = Where;
        enObjModel.EntityObjectMap[i].prototype.FirstOrDefault = FirstOrDefault;
        enObjModel.EntityObjectMap[i].prototype.Any = Any;
        enObjModel.EntityObjectMap[i].prototype.ToList = ToList;
    }
    var IsNum = function(s){
        try{
            if(s.length>18) return false;
            parseInt(s);
            return true;
        }
        catch(ex){return false;}
    };

    return obj;
};

module.exports = new dataContext();
