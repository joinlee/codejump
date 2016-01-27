var express = require('express');
var router = express.Router();

var enObjModel = require('../domain/model/EntityObjectModel');
var authenticationSvr = new require('../services/AuthenticationService')();
var resultJson = require('./model/ResultJson');

/* GET home page. */
router.get('/', function(req, res, next) {

    var person = new enObjModel.Person();
    person.Account.UserName = 'lkc1';
    person.Account.Password = '123';
    person.Account.RegistTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
    person.Name = 'likecheng';

    //authenticationSvr.Login(person.Account, function (accountData) {
    //    res.send(resultJson(accountData));
    //}, function (err) {
    //    res.send(resultJson(null,err,201));
    //});

    //authenticationSvr.Register(person,function(personId){
    //    res.send(resultJson({personId:personId}));
    //},function(err){
    //    res.send(resultJson(null,err,201));
    //});

    authenticationSvr.LogOut(1,function(r){
        res.send(resultJson());
    });

});

module.exports = router;
