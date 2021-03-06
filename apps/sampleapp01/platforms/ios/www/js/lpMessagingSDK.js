/*global cordova, module
 refer to README for full explanation and documentation
 */
var exec = require('cordova/exec');

//module.exports = {
//    lp_conversation_api: function(action, args, successCallback, errorCallback) {
//        cordova.exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
//    },
//    lp_register_event_callback: function(args, successCallback, errorCallback) {
//        cordova.exec(successCallback, errorCallback, "LPMessagingSDK", "lp_register_event_callback", args);
//    }
//};

exports.lp_conversation_api = function(action, args, successCallback, errorCallback) {
    exec(successCallback, errorCallback, "LPMessagingSDK", action, args);
}

exports.lp_register_event_callback = function(args, successCallback, errorCallback) {
    console.log("999 lp_register_event_callback ");
    exec(successCallback, errorCallback, "LPMessagingSDK", "lp_register_event_callback", args);
}

exports.hello_world = function(action,args,successCallback,errorCallback) {
    console.log("999 HELLO WORLD "+action)
    successCallback("999 HELLO WORLD CALLBACK DATA");
}
