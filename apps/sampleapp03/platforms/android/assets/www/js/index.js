/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    settings: {
        accountId: "90233546", // replace with your account id
        startMessagingConversationButtonId: "start_lp_conversation",
        logoutButtonId: "logout_and_clear_history",
        activeUser:"jwt1",
        deviceToken : ""
    },
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        console.log("@@@ js ... console.log works well");
        if (window.cordova.logger) {
            window.cordova.logger.__onDeviceReady();
        }
        this.receivedEvent('deviceready');
        // initialise LP Messaging SDK here


        // setup click event listener for start messaging button example
        var push = PushNotification.init({
        	android: {
        	},
        	ios: {
        		alert: "true",
        		badge: "true",
        		sound: "true"
        	}
        });

        push.on('registration', function(data) {
        	// data.registrationId
        	console.log('@@@ pushNotification plugin registrationId ...'+data.registrationId);
            app.deviceToken = data.registrationId;
            app.lpMessagingSdkInit(app.deviceToken);


        });

        push.on('error', function(e) {
        	// e.message
        	console.log('@@@ pushNotification plugin error ...'+e.message);
        });


        push.on('notification', function(data) {
        	console.log('@@@ pushNotification on.notification ...'+data.message);
        	//alert('New Message from Agent! ...'+data.message);

        	bootbox.confirm({
                title: "New Message Received",
                message: data.message,
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> View'
                    }
                },
                callback: function (result) {
                    if(result) {
                        console.log("@@@ bootbox --> user asked to view the message...calling startConversation...");
                        app.lpStartMessagingConversation(app.activeUser);
                    }
                    console.log('@@@ bootbox ... This was logged in the callback: ' + result);
                }
            });

//        	console.log('@@@ pushNotification on.notification ...'+data.title);
//        	console.log('@@@ pushNotification on.notification ...'+data.count);
//        	console.log('@@@ pushNotification on.notification ...'+data.sound);
//        	console.log('@@@ pushNotification on.notification ...'+data.image);
        	console.log('@@@ pushNotification on.notification ...'+data.additionalData);
        });

        console.log('@@@ js ... onDeviceReady completed');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        console.log('receivedElement', receivedElement);
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        var buttonElement = document.getElementById(this.settings.startMessagingConversationButtonId);
        buttonElement.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt1'), false);


        var buttonElement2 = document.getElementById("start_lp_conversation_2nd_user");
        buttonElement2.addEventListener("click", this.lpStartMessagingConversation.bind(this, 'jwt2'), false);

//        var buttonElement3 = document.getElementById("init_lp_sdk");
//        buttonElement3.addEventListener("click",this.lpMessagingSdkInit.bind(this),false);


        var logoutElement = document.getElementById(this.settings.logoutButtonId);
        logoutElement.addEventListener("click", this.clearDeviceHistoryAndLogout.bind(this), false);

    },
    clearDeviceHistoryAndLogout: function() {
        console.log("@@@ clearDeviceHistoryAndLogout ***");
        lpMessagingSDK.lp_conversation_api(
            "lp_clear_history_and_logout", [this.settings.accountId],
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique clearDeviceHistoryAndLogout SDK callback ...data => "+data);
                console.log("@@@ js ... post logout...now auto reinitialise the SDK for next user to save button press in demo!");
                app.lpMessagingSdkInit();

            },
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique clearDeviceHistoryAndLogout SDK error callback ...data => "+data);
            }
        );

    },
    successCallback: function(data) {

        console.log("@@@ successCallback fired! " + data);

        var eventData = JSON.parse(data);

        if (eventData.eventName == "LPMessagingSDKConnectionStateChanged") {
            console.log("@@@ ************************************* LPMessagingSDKConnectionStateChanged callback fired! ", eventData.isReady)
        }

        if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
            console.log("@@@ authenticated token has expired...refreshing...");
            this.lpGenerateNewAuthenticationToken();
        }

        console.log('@@@ successCallback fired ' + eventData.eventName);

    },
    globalAsyncEventsSuccessCallback: function(data) {
        var eventData = JSON.parse(data);
        console.log(
            '@@@ globalAsyncEventsSuccessCallback --> ' + data
        );
        if (eventData.eventName == 'LPMessagingSDKTokenExpired') {
            console.log("@@@ authenticated token has expired...refreshing...");
            app.lpGenerateNewAuthenticationToken();
        }
    },
    globalAsyncEventsErrorCallback: function(data) {
        var eventData = JSON.parse(data);
        console.log(
            '@@@ globalAsyncEventsErrorCallback --> ' + data
        );
    },
    lpGenerateNewAuthenticationToken: function() {
        // code to generate new fresh JWT would go here...
        // TODO -- implement auth0 API call for refresh token via AJAX/jQuery etc to get a new token
        var jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0yMS1BUFItMjAxNy0xNTEwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTUzODE4MTksImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjEwMCJ9fSx7InR5cGUiOiJwZXJzb25hbCIsInBlcnNvbmFsIjp7ImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImJvYkB0YWxrdGFsay5jby51ayJ9XSwiZ2VuZGVyIjoiTUFMRSJ9fV19.kLCTLwct8A-LJLsjU3Vc_8BrLWMX5oqzdqJ04W7lBOOnkG3Kq0Al2Yol_MdCrWB3LKz98f861tOhKlngP5zJBxdPTL4TNI8Z9PFagZWehYxJudHrVBxrRvqWkZo9n5lFA9Gr-zUcmQ2NuKf1snbJSqXhnVOk2bHsRfUGPiq4pns";
        lpMessagingSDK.lp_conversation_api(
            "reconnect_with_new_token", [jwt],
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique reconnect_with_new_token SDK callback");
            },
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique reconnect_with_new_token SDK error callback");
            }
        );
        console.log('lpGenerateNewAuthenticationToken completed --> new jwt -->  ', jwt);
    },
    lpMessagingSdkInit: function(token) {
        // lp_sdk_init


        var brandingOptions = {
            "remoteUserBubbleBackgroundColor": "purple",
            "remoteUserBubbleBorderColor": "purple",
            "remoteUserBubbleTextColor": "white",
            "brandName": "TalkTalk"
        };

        var windowOptions = {
            "useCustomViewController": "true"
        };

        var sdkConfig = {
            "branding": brandingOptions,
            "window": windowOptions
        };
        //here2
        lpMessagingSDK.lp_conversation_api(
            "lp_sdk_init", [this.settings.accountId, sdkConfig],
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique lp_sdk_init SDK callback");
                lpMessagingSDK.lp_conversation_api(
                    "register_pusher", [app.settings.accountId,app.deviceToken],
                    function(data) {
                        //var eventData = JSON.parse(data);
                        console.log("@@@ js ... unique register_pusher SDK callback .."+data);
                    },
                    function(data) {
                       // var eventData = JSON.parse(data);
                        console.log("@@@ js ... unique register_pusher SDK error callback ..."+data);
                    }
                );
            },
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique lp_sdk_init SDK error callback");
            }
        );

        lpMessagingSDK.lp_conversation_api(
            "set_lp_user_profile", [
                this.settings.accountId,
                "Drew",
                "H",
                "NickName:DH",
                "https://s-media-cache-ak0.pinimg.com/564x/a2/c7/ee/a2c7ee8982de3bae503a730fe4562cf9.jpg",
                "tel:555-333-4444"
            ],
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique set_lp_user_profile SDK callback");
            },
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique set_lp_user_profile SDK error callback");
            }
        );


        lpMessagingSDK.lp_register_event_callback(
            [this.settings.accountId],
            this.globalAsyncEventsSuccessCallback,
            this.globalAsyncEventsErrorCallback
        );

        console.log('@@@ js lpMessagingSdkInit completed -- '+ this.settings.accountId);
    },
    lpStartMessagingConversation: function(customerId) {

        // HERE is where you would write your code to call your IDP and return your JWT token for an authenticated customer
        // in this sample app the token is hardcoded for this specific account.
        console.log('lpStartMessagingConversation customerId ' + customerId);
        // sub TALKTALK-04-APR-2017-1120
        var JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTg4MTc0MTAsImlhdCI6MTQ4NzE1OTMzNywicGhvbmVfbnVtYmVyIjoiKzEtMTAtMzQ0LTM3NjUzMzMiLCJscF9zZGVzIjpbeyJ0eXBlIjoiY3RtcmluZm8iLCJpbmZvIjp7ImNzdGF0dXMiOiJjYW5jZWxsZWQiLCJjdHlwZSI6InZpcCIsImN1c3RvbWVySWQiOiJUQUxLVEFMSy0wNC1BUFItMjAxNy0xMTIwIiwiYmFsYW5jZSI6LTQwMC45OSwic29jaWFsSWQiOiIxMTI1NjMyNDc4MCIsImltZWkiOiIzNTQzNTQ2NTQzNTQ1Njg4IiwidXNlck5hbWUiOiJ1c2VyMDAwIiwiY29tcGFueVNpemUiOjUwMCwiYWNjb3VudE5hbWUiOiJiYW5rIGNvcnAiLCJyb2xlIjoiYnJva2VyIiwibGFzdFBheW1lbnREYXRlIjp7ImRheSI6MTUsIm1vbnRoIjoxMCwieWVhciI6MjAxNH0sInJlZ2lzdHJhdGlvbkRhdGUiOnsiZGF5IjoyMywibW9udGgiOjUsInllYXIiOjIwMTN9fX0seyJ0eXBlIjoicGVyc29uYWwiLCJwZXJzb25hbCI6eyJmaXJzdG5hbWUiOiJKb2huOTkiLCJsYXN0bmFtZSI6IkJlYWRsZTk5IiwiYWdlIjp7ImFnZSI6MzQsInllYXIiOjE5ODAsIm1vbnRoIjo0LCJkYXkiOjE1fSwiY29udGFjdHMiOlt7ImVtYWlsIjoiamJlYWRsZTk5QGxpdmVwZXJzb24uY29tIiwicGhvbmUiOiIrMSAyMTItNzg4LTg4NzcifV0sImdlbmRlciI6Ik1BTEUifX1dfQ.MjKbOowTgC-bmDnaZT05UAYUBanSZ3-6CYU0Qlstx_E3KzZr0IHmhxsj0acFAA0GZmK88ZsM2LN8ehuFDLecBluMC9TQMcrVyJJrSzcrd7_8pw0FXi2sp9wjB9WMjH62evV5Yo8h0yoZ3HKurLTluVNWlhbDOBwRbIKWiFlnRjQ";

        //talktalk jwt expires 1626
//        var JWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjE1YjVjMzAyYzk0MTY2YWM5MjViYTVlOWMyNTBlYmM3In0.eyJpc3MiOiJodHRwczpcL1wvd3d3LnRhbGt0YWxrLmNvLnVrIiwiZXhwIjoxNDk1NTUyODY5LCJpYXQiOjE0OTU1NDkyNjksInN1YiI6IjEtMDAwMDA1LTY3MzA1NS0wIn0.JAVMouf5xPj3rmIdCvaps2EmWaS4zhL8U4I750jeuMOTT36r39lQEZpUXicMVEucpErr-wOq0htluUaI_nRnAZ-m2twf6rTflnw5ql4K2Bg73i5prX2S9mKo2g3SojYLvPzmFQslJ9RGqwghOh6HErbCectJlLNntIZnCMsuwj5Ar_ozuHPOLtGOFLcyLMp9giMLNiXXuWoCYRiIrEIbq1fRKOUHo4nOQ__gCrmwYYVyF1pKG5q6ku1qfWPlTrKf3OF4uE7pJOkf__KdeVgVMRkBSoRh216letxWvPboZU-zJ8T_wlDKW5qEihmrcbIlWHuwmE8H0jmACBt1DQfikA";


        // sub TALKTALK-21-APR-2017-1510
        /* 1492788319
           Is equivalent to: 04/21/2017 @ 3:15pm (UTC)
          */
        var JWT2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUQUxLVEFMSy0yMS1BUFItMjAxNy0xNTEwIiwiaXNzIjoiaHR0cHM6Ly93d3cubGl2ZXBlcnNvbi5jb20iLCJleHAiOjE0OTI3ODk4MTksImlhdCI6MTQ4NzE1OTMzNywibHBfc2RlcyI6W3sidHlwZSI6ImN0bXJpbmZvIiwiaW5mbyI6eyJjc3RhdHVzIjoibmV3IiwiY3R5cGUiOiJ2aXAiLCJjdXN0b21lcklkIjoiVEFMS1RBTEstMTItQVBSLTIwMTctMjEwMCJ9fSx7InR5cGUiOiJwZXJzb25hbCIsInBlcnNvbmFsIjp7ImFnZSI6eyJhZ2UiOjM0LCJ5ZWFyIjoxOTgwLCJtb250aCI6NCwiZGF5IjoxNX0sImNvbnRhY3RzIjpbeyJlbWFpbCI6ImJvYkB0YWxrdGFsay5jby51ayJ9XSwiZ2VuZGVyIjoiTUFMRSJ9fV19.yvaQ7h9JuCdqTJHfrtbaGkk3hlUg6rifzqDc0S84auM5aJtXjlOGUksu4xOLcumlyE3fRgvZpGqfz4yx0kZkzUuQO79GrZWkhkF9US1u6ihweQ1MprFoRwXnesr881ou5zfliR2ZdJIK2ZsdXT7Gde-1qc2VPq4E9wsdBJQ-bg4";

        lpMessagingSDK.lp_conversation_api(
            "start_lp_conversation", [
                this.settings.accountId,
                customerId == "jwt1" ? JWT : JWT2
            ],
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique start_lp_conversation SDK callback");
            },
            function(data) {
                var eventData = JSON.parse(data);
                console.log("@@@ js ... unique start_lp_conversation SDK error callback");
            }
        );

        console.log('lpStartMessagingConversation completed ', JWT);
    }
};

app.initialize();