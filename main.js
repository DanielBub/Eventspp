/**
 * Created by barak on 18/08/2017.
 */


var bodyParser = require('body-parser');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static_data'));
app.set('port', (process.env.PORT || 5000));

var currentCookie = 1;
var currentEventID = 1;
var usernamesToPasswords = {};
var usernamesToCookies = {};
var cookiesToUsernames = {};
var usernamesToUsers = {};
var eventIdsToEvents = {};
var maxCookieTime = 3600000;

app.post('/register/:username/:password', function(req,res,next){

    var username = req.params.username;
    var password = usernamesToPasswords[username];

    if (password){
        res.status(500).json({ error: 'the username has already existed' });
    }
    else{
        usernamesToPasswords[username] = req.params.password;
        var user = {name:username, friends:[], friendsRequests:[], events:[], eventsRequests:[]};
        usernamesToUsers[username] = user;
        res.status(200).json({ message: 'the username has registed' });
        console.log("User created");
    }
});

app.post('/login/:username/:password', function(req,res,next){
    var username = req.params.username;
    var password = usernamesToPasswords[username];

    if (password){
        if (password === req.params.password){
            var cookie = currentCookie;
            currentCookie++;
            res.cookie('appId', cookie, { maxAge: maxCookieTime});
            res.status(200);
            res.send();
            usernamesToCookies[username] = cookie;
            cookiesToUsernames[cookie] = username;
            console.log("User logged");
        }
        else{
            res.status(500).json({ error: 'worng username or password' });
        }
    }
    else{
        res.status(500).json({ error: 'worng username or password' });
    }
});

app.use('/',function(req,res,next){

    console.log("Coockie check ");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    if (userName) {
        console.log("Coockie check pass");
        res.cookie('appId', cookie, { maxAge: maxCookieTime});
        next();
    }
    else{
        console.log("Coockie check fail");
        res.json({"error":"true"});
    }
});

app.post('/addFriend/:friendUserName',function (req,res,next) {
    console.log("Trying to add friend")
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var friendUserName = req.params.friendUserName;
    var friendUser = usernamesToUsers[friendUserName];

    friendUser.friendsRequests.push(userName);

    res.status(200).json({ message: 'done' });
});

app.get('/friendRequests',function (req,res) {
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    res.status(200).json(usernamesToUsers[userName].friendsRequests);
});

app.post('/acceptFriend/:friendUserName',function (req,res,next) {
    console.log("ACCEPTING FRIEND");

    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var friendUserName = req.params.friendUserName;

    usernamesToUsers[userName].friends.push(friendUserName);
    usernamesToUsers[friendUserName].friends.push(userName);

    var friendList = usernamesToUsers[userName].friendsRequests;
    var index = friendList.indexOf(friendUserName);

    if (index > -1) {
        friendList.splice(index, 1);
    }
    console.log(usernamesToUsers[userName].friends);
    console.log(usernamesToUsers[friendUserName].friends);

    res.status(200).json({ message: 'done' });
});

app.get('/friends',function (req,res,next) {
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    res.status(200).json(usernamesToUsers[userName].friends);
});

app.post('/createPrivateEvent',function(req,res,next){
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    console.log(req.body);

    if (userName){
        console.log("user name was found");

        var eventName = req.body["name"];
        var eventLocation = req.body["location"];
        var eventDateAndTime = req.body["dateAndTime"];
        var eventParticipants = req.body["participants"];
        var eventImageURL = req.body["imageURL"];
        var eventDescription = req.body["description"];

        var event = {name:eventName, location:eventLocation, dateAndTime:eventDateAndTime,
            participants:eventParticipants, imageURL:eventImageURL, description:eventDescription};

        eventIdsToEvents[currentEventID] = event;
        usernamesToUsers[userName].events.push(currentEventID);

        registerParticipants(eventParticipants,currentEventID, userName);
        currentEventID++;

        res.status(200).json({ message: 'create event is done' });
    }else{
        console.log("user name was not found");
        res.status(500).json({"error":"user name does not found"});
    }
});

function registerParticipants(participants, currentEventID, eventCreatorUserName){

    for(var i = 0; i<  participants.length; i++){
        if(eventCreatorUserName !== participants[i]){
            usernamesToUsers[participants[i]].eventsRequests.push(currentEventID);
        }
    }
}

app.post('/acceptEventRequest/:eventId',function (req,res,next) {
    console.log("Trying to add friend")
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var eventId = req.params.eventId;

    var friendUser = usernamesToUsers[friendUserName];
    friendUser.events.push(eventId);


    var eventsRequests = usernamesToUsers[userName].eventsRequests;
    var index = eventsRequests.indexOf(eventId);

    if (index > -1) {
        eventsRequests.splice(index, 1);
    }

    res.status(200).json({ message: 'done' });
});






app.get('/getPrivateEvent/:eventId',function(req,res,next){
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    //var eventName = req.body["name"];

    if (userName){
        console.log("user name was found");
        if (eventName){
            console.log("event name was found");
            res.status(200).json(usernamesToUsers[userName].events[eventName]);
        }else{
            console.log("event name was not found");
            res.status(500).json({"error":"event name does not found"});
        }
    }else{
        console.log("user name was not found");
        res.status(500).json({"error":"user name does not found"});
    }
});








app.get('/getEvents',function(req,res,next){
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    if (userName){
        console.log("user name was found");
        res.status(200).json(usernamesToUsers[userName].events);

    }else{

        console.log("user name was not found");
        res.status(500).json({"error":"user name does not found"});
    }
});

// from Ex3, do not know if to erase or not
app.set('json spaces', 40);

app.listen(8080);


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function init(){

    for(var i = 0; i < 10; i++){
        createUser("" + i, "" + i);
    }

    addFriends("" + 0);

    addFriends2("" + 1);


}

function createUser(username,password) {
    usernamesToPasswords[username] = password;
    var user = {name:username, friends:[], friendsRequests:[], events:[], eventsRequests:[]};
    usernamesToUsers[username] = user;
}

function addFriends(userName){
    for(var i = parseInt(userName) + 1; i < 10; i++){
        usernamesToUsers[userName].friends.push("" + i);
        usernamesToUsers["" + i].friends.push(userName);
    }
}


function addFriends2(userName){
    for(var i = parseInt(userName) + 5; i < 10; i++){
        usernamesToUsers[userName].friends.push("" + i);
        usernamesToUsers["" + i].friends.push(userName);
    }
}

