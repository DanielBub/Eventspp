/**
 * Created by barak on 18/08/2017.
 */

var express = require('express');
var bodyParser = require('body-parser');
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
var eventIdsToEvents = {}
var maxCookieTime = 3600000;

app.post('/register/:username/:password', function(req,res,next){
    console.log("try to register");
    var username = req.params.username;
    var password = usernamesToPasswords[username];

    if (password){
        console.log("User already exists");
        res.status(500).json({ error: 'the username has already existed' });
    }
    else{
        usernamesToPasswords[username] = req.params.password;
        var user = {name:username, friends:[], friendsRequests:[], events:[]};

        usernamesToUsers[username] = user;
        res.status(200).json({ message: 'the username has registed' });
        console.log("User created");
    }
});

app.post('/login/:username/:password', function(req,res,next){
    console.log("try to login");
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
            console.log("User loggedIn");
        }
        else{
            console.log("User loggedIn fail");
            res.status(500).json({ error: 'worng username or password' });
        }
    }
    else{
        console.log("User loggedIn fail");
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
        res.status(500).json({"error":"true"});
    }
});

app.get('/authenticate',function(req,res,next){
    res.status(200).json({ message: 'pass' });
});

app.post('/addFriend/:friendUserName',function (req,res,next) {
    console.log("Trying to add friend");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var friendUserName = req.params.friendUserName;
    var friendUser = usernamesToUsers[friendUserName];

    friendUser.friendsRequests.push(userName);

    res.status(200).json({ message: 'done' });
});

app.get('/friendRequests',function (req,res,next) {
    console.log("get friends Request");

    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    res.status(200).json(usernamesToUsers[userName].friendsRequests);
});


app.post('/acceptFriend/:friendUserName',function (req,res,next) {
    console.log("try to ACCEPTING FRIEND");

    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var friendUserName = req.params.friendUserName;

    var friendList = usernamesToUsers[userName].friendsRequests;
    var index = friendList.indexOf(friendUserName);

    if (index > -1) {
        console.log("friend user name is my friend");
        friendList.splice(index, 1);

        usernamesToUsers[userName].friends.push(friendUserName);
        usernamesToUsers[friendUserName].friends.push(userName);

        console.log("accepting friend is done");
    }

    // console.log(usernamesToUsers[userName].friends);
    // console.log(usernamesToUsers[friendUserName].friends);

    res.status(200).json({ message: 'done' });
});

app.get('/friends',function (req,res,next) {
    console.log("get friends");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    res.status(200).json(usernamesToUsers[userName].friends);
});

app.post('/createPrivateEvent',function(req,res,next){
    console.log("create private event");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    console.log(req.body);

    if (userName){
        console.log("user name was found");

        var eventName = req.body["name"];
        var eventLocation = req.body["location"];
        var eventDateAndTime = req.body["dateAndTime"];
        var eventParticipants = req.body["participants"];
        var eventImageURL = req.body["imgURL"];
        var eventDescription = req.body["description"];

        eventParticipants.push(userName);

        var event = {name:eventName, location:eventLocation, dateAndTime:eventDateAndTime,
            participants:eventParticipants, imgURL:eventImageURL, description:eventDescription,
            attendingUsers:[], noResponseUsers:[],notGoingUsers:[]};


        eventIdsToEvents[currentEventID] = event;
        event.attendingUsers.push(userName);
        usernamesToUsers[userName].events.push(currentEventID);

        console.log(eventParticipants);
        registerParticipants(eventParticipants,currentEventID, userName, event);
        currentEventID++;

        console.log("event is created");
        res.status(200).json({ message: 'create event is done' });
    }else{
        console.log("user name was not found");
        res.status(500).json({"error":"user name does not found"});
    }
});

function registerParticipants(participants, currentEventID, eventCreatorUserName, event){

    for(var i = 0; i<  participants.length; i++){
        if(eventCreatorUserName !== participants[i]){
            usernamesToUsers[participants[i]].events.push(currentEventID);
            event.noResponseUsers.push(participants[i]);
        }
    }
}

app.post('/acceptEventRequest/:eventId',function (req,res,next) {
    console.log("Trying to accept event Request");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var eventId = req.params.eventId;

    if(eventIdsToEvents[eventId]){
        console.log("event was found");
        var eventIndex = usernamesToUsers[userName].events.indexOf(parseInt(eventId));
        if(eventIndex> -1){
            console.log("attend to event");
            changeEventStatus("attend",eventIdsToEvents[eventId],userName );
        }else {
            console.log("not going to event");
            res.status(500).json({error:"event ID does not found"});
        }
    }else {
        console.log("event was not found");
        res.status(500).json({error:"event ID does not found"});
    }});

app.post('/rejectEventRequest/:eventId',function (req,res,next) {
    console.log("Trying to reject Event Request")
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var eventId = req.params.eventId;

    if(eventIdsToEvents[eventId]){
        console.log("event was found");
        var eventIndex = usernamesToUsers[userName].events.indexOf(parseInt(eventId));
        if(eventIndex> -1){
            console.log("not going to event");
            changeEventStatus("reject",eventIdsToEvents[eventId],userName );
        }else {
            console.log("event was not found");
            res.status(500).json({error:"event ID does not found"});
        }
    }else {
        console.log("event was not found");
        res.status(500).json({error:"event ID does not found"});
    }});

function changeEventStatus(status, event, userName) {

    console.log("change status");
    if(status === "attend"){
        console.log("attend to event");
        var eventIndex = event.attendingUsers.indexOf(userName);
        if(!(eventIndex > -1)){
            eventIndex = event.noResponseUsers.indexOf(userName);

            if(eventIndex > -1){
                event.noResponseUsers.splice(eventIndex, 1);
                event.attendingUsers.push(userName);
            }else{
                event.notGoingUsers.splice(eventIndex, 1);
                event.attendingUsers.push(userName);
            }
        }
    }
    else{
        console.log("not going to event");
        var eventIndex = event.notGoingUsers.indexOf(userName);
        if(!(eventIndex > -1)){
            eventIndex = event.noResponseUsers.indexOf(userName);

            if(eventIndex > -1){
                event.noResponseUsers.splice(eventIndex, 1);
                event.notGoingUsers.push(userName);
            }else{
                event.attendingUsers.splice(eventIndex, 1);
                event.notGoingUsers.push(userName);
            }
        }
    }
}

app.get('/getPrivateEvent/:eventId',function(req,res,next){

    console.log("get private event");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];
    var eventId = req.params.eventId;

    if (eventIdsToEvents[eventId]){
        console.log("event was found");
        console.log(usernamesToUsers[userName].events);
        var eventIndex = usernamesToUsers[userName].events.indexOf(parseInt(eventId));
        if(eventIndex > -1){
            console.log("succeed to get private event");
            res.status(200).json(eventIdsToEvents[eventId]);
        }else{
            console.log("the user does not has this event");
            res.status(500).json({error:"the user does not has this event"});
        }
    }else{
        console.log("event was not found");
        res.status(500).json({error: "event does not found"});
    }
});

app.get('/getEvents',function(req,res,next){
    console.log("try to get events");
    var cookie = req.cookies.appId;
    var userName = cookiesToUsernames[cookie];

    if (userName){
        console.log("user name was found");

        var userEvents = [];

        for(var i = 0; i<usernamesToUsers[userName].events.length ;i++){
            userEvents.push(eventIdsToEvents[usernamesToUsers[userName].events[i]]);
            console.log(eventIdsToEvents[usernamesToUsers[userName].events[i]]);
        }
        console.log("retrun all events");
        res.status(200).json(userEvents);
    }else{
        console.log("user name was not found");
        res.status(500).json({"error":"user name does not found"});
    }
});

// from Ex3, do not know if to erase or not
app.set('json spaces', 40);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


init();

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