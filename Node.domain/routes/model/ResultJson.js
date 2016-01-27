/**
 * Created by lee on 2016/1/5.
 */

var ResultJson = function(objData,message,code){
    return {
        Code:code?code:200,
        Message:message?message:'success',
        Data:objData
    };
};
module.exports = ResultJson;
