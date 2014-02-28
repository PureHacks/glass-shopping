
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var googleapis = require('googleapis');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var config = {
    displayName: "devlist update",
    clientID: "755482469248-q08tbvotf1f62fd4guhv7riqo9bnhth7.apps.googleusercontent.com",
    clientSecret: "mst-lDnj43oI4yj50sw1obtQ",
    host: "localhost:5000"
}
if (process.env.NODE_ENV == "prod") {
    var config = {
        displayName: "shoppinglist update",
        clientID: "716645361625-j2vb7jg318uo6nu44rkjgu8b7letfvjc.apps.googleusercontent.com",
        clientSecret: "iUG7BPRnAy_NNE8BDmdp5n_8",
        host: "glass-shopping.herokuapp.com/"
    }
}

var oauth2Client = new googleapis.OAuth2Client(config.clientID, config.clientSecret, "http://" + config.host + "/oauth2callback");

app.get('/', function(req,res){
    if (!oauth2Client.credentials){
        // generates a url that allows offline access and asks permissions
        // for Mirror API scope.
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/glass.location'
        });
        res.redirect(url);
    } else {
        gotToken();
    }
    res.render('index', { title: 'Hello World' });
    res.end();
});

app.post('/notify/timeline', function(req, res){
    var notification = req.body;
    var itemId = notification.itemId;
    console.log(notification);
    switch (notification.userActions[0].type) {
        case "SHARE":
        	getTimelineItem(function(data){
        		console.log("got item", data.attachments[0].contentUrl);
        		var img = data.attachments[0].contentUrl;

        		insertImgTimelineItem(img, failure, success)
        	});

            // perform share
            break;
        case "REPLY":
            // perform reply
            break;
        case "DELETE":
            // perform delete
            break;
        case "LAUNCH":
            // perform launch

            break;
        case "CUSTOM":
            // perform custom
            break;
    };
    res.end();
});

app.get('/oauth2callback', function(req, res){
    // if we're able to grab the token, redirect the user back to the main page
    getToken(oauth2Client, req.query.code, failure, function(){ res.redirect('/'); });
});




var gotToken = function() {
    console.log("Got token, w00t!");
    listTimeline(failure, success);
    insertContact(failure, success);
    insertTimelineItem(failure, success);
    clearTimeline(failure, success);
    subscribeToNotifications(failure, success);
};


var getToken = function(oauth2Client, code, errorCallback, successCallback) {
    oauth2Client.getToken(code, function(err, tokens){
        if (!!err){
            errorCallback(err);
        } else {
            console.log('tokens', tokens);
            oauth2Client.credentials = tokens;
            successCallback();
        }
    });
};

var success = function(data) { console.log('success',data); };
var failure = function(data) { console.log('failure',data); };


var mirror;
googleapis.discover('mirror', 'v1').execute(function(err, client) {
    if (!!err){
        failure();
        return;
    }
    mirror = client.mirror;
});


var listTimeline = function(errorCallback, successCallback){
    mirror.timeline.list()
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
};

var insertContact = function(errorCallback, successCallback){
    mirror.contacts.insert(
        {
            "id": "harold",
            "displayName": config.displayName,
            "priority": 7,
            "acceptCommands": [
                {"type": "POST_AN_UPDATE"},
                {"type": "TAKE_A_NOTE"}
            ]
        }
    )
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
};


var insertTimelineItem = function(errorCallback, successCallback){
    var date = new Date();
    mirror.timeline.insert(
        {
            //"bundleId": "main",
            "html": "<article>\n <b>" + date.toLocaleTimeString() + "<br/>durp</b></article>",
            "speakableText": "Hellooooo duurp",
            "menuItems": [{"action": "DELETE"}],
            "notification": { "level": "DEFAULT" }
        }
    )
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
};


var insertImgTimelineItem = function(img, errorCallback, successCallback){
    var date = new Date();
    mirror.timeline.insert(
        {
            //"bundleId": "main",
            "html": "<article>\n test </br><img src=\"" + img + "\" /></article>",
            "menuItems": [{"action": "DELETE"}],
            "notification": { "level": "DEFAULT" }
        }
    )
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
};


var clearTimeline = function(errorCallback, successCallback){
    mirror.timeline.list()
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err) {
            errorCallback(err);
        }
        else {
            for (var i = 0; i < data.items.length; i++) {
                var itemId = data.items[i].id;
                console.log("ITEM ID: ", itemId);
                deleteTimelineItem(itemId, errorCallback, successCallback);
            }
        } 
    });
};




var deleteTimelineItem = function(itemId, errorCallback, successCallback) {
    mirror.timeline.delete({
        id: itemId
    })
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
};


var subscribeToNotifications = function(errorCallback, successCallback) {
    mirror.subscriptions.insert(
        {
            "collection": "timeline",
            "userToken": "harold_penguin",
            "verifyToken": "abc123",
            "callbackUrl": "https://mirrornotifications.appspot.com/forward?url=http://" + config.host + "/notify/timeline"
        }
    )
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        if (!!err)
            errorCallback(err);
        else
            successCallback(data);
    });
}



var getTimelineItem = function(itemId, onSuccess) {
    mirror.timeline.get({"id": itemId})
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
        console.log("GOT TIMELINE ITEM");
        if (!!err)
            failure(err);
        else
           	onSuccess(data);
    });
};



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});