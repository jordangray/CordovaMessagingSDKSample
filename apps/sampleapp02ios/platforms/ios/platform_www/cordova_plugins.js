cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "com.liveperson.messagingSDK.lpMessagingSDK",
        "file": "plugins/com.liveperson.messagingSDK/www/lpMessagingSDK.js",
        "pluginId": "com.liveperson.messagingSDK",
        "clobbers": [
            "lpMessagingSDK"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.liveperson.messagingSDK": "0.1.0",
    "cordova-plugin-whitelist": "1.3.2"
};
// BOTTOM OF METADATA
});