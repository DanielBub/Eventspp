/**
 * Created by barak on 18/08/2017.
 */

var currentCookie = 1;
var currentEventID = 1;
var userNamesToPasswords = {};
var userNamesToCookies = {};
var cookiesToUserNames = {};
var userNamesToUsers = {};
var eventIdsToEvents = {};
var publicEventsCategories = ["Sport", "Lan-Party", "Board-Game", "Other"];
var maxCookieTime = 3600000;
var defaultPort = 5000;
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('static_data'));
app.set('port', (process.env.PORT || defaultPort));

app.post('/register', function(req, res, next) {
    console.log("try to register");
    var userName = req.body.username;
    var password = userNamesToPasswords[userName];

    if (password){
        console.log("User already exists");
        res.status(500).json({ error: 'The user name already exists' });
    }
    else{
        var userEmail = req.body.email;
        var userBirthday = req.body.birthday;
        var userSex = req.body.sex;
        var userImage = req.body.image;
        var user = { name: userName, email: userEmail, birthday: userBirthday, age: calculateMyAge(userBirthday),
            sex: userSex, image: userImage, friends:[], friendsRequests:[], events:[] };

        userNamesToPasswords[userName] = req.body.password;
        userNamesToUsers[userName] = user;
        res.status(200).json({ message: 'The user has been registered' });
        console.log("User was created");
    }
});

// app.post('/register/:userName/:password', function(req,res,next){
//     console.log("try to register");
//     var userName = req.params.userName;
//     var password = userNamesToPasswords[userName];
//
//     if (password){
//         console.log("User already exists");
//         res.status(500).json({ error: 'The user name has already existed' });
//     }
//     else{
//         var user = {name:userName, friends:[], friendsRequests:[], events:[]};
//
//         userNamesToPasswords[userName] = req.params.password;
//         userNamesToUsers[userName] = user;
//         res.status(200).json({ message: 'The user has been registered' });
//         console.log("User was created");
//     }
// });

app.post('/login', function(req, res,next) {
    console.log("try to login");
    var userName = req.body.username;
    var password = userNamesToPasswords[userName];

    if (password){
        if (password === req.body.password){
            var cookie = currentCookie;
            userNamesToCookies[userName] = cookie;
            cookiesToUserNames[cookie] = userName;
            var user = userNamesToUsers[userName];
            user["age"] = calculateMyAge(user.birthday);
            currentCookie++;
            res.cookie('appId', cookie, { maxAge: maxCookieTime});
            // res.status(200).json({ message: 'The user loggedIn' });
            console.log("User loggedIn");
            res.redirect("/public/AfterLogin.html")
        }
        else{
            console.log("User loggedIn fail");
            res.status(500).json({ error: 'Wrong user name or password' });
        }
    }
    else{
        console.log("User loggedIn fail");
        res.status(500).json({ error: 'Wrong user name or password' });
    }
});

function calculateMyAge(birthday) {
    var birthdayDate = new Date(birthday);
    var ageDifferenceByMiliSeconds = Date.now() - birthdayDate.getTime();
    var ageDate = new Date(ageDifferenceByMiliSeconds);

    return Math.abs(ageDate.getUTCFullYear() - 1970);
}


// app.post('/login/:userName/:password', function(req,res,next){
//     console.log("try to login");
//     var userName = req.params.userName;
//     var password = userNamesToPasswords[userName];
//
//     if (password){
//         if (password === req.params.password){
//             var cookie = currentCookie;
//             userNamesToCookies[userName] = cookie;
//             cookiesToUserNames[cookie] = userName;
//             currentCookie++;
//             res.cookie('appId', cookie, { maxAge: maxCookieTime});
//             res.status(200);
//             res.send();
//             console.log("User loggedIn");
//         }
//         else{
//             console.log("User loggedIn fail");
//             res.status(500).json({ error: 'Wrong user name or password' });
//         }
//     }
//     else{
//         console.log("User loggedIn fail");
//         res.status(500).json({ error: 'Wrong user name or password' });
//     }
// });

app.use('/',function(req,res,next){
    console.log("Cookie check ");
    var cookie = req.cookies.appId;
    var userName = cookiesToUserNames[cookie];

    if (userName) {
        console.log("Cookie check pass");
        res.cookie('appId', cookie, { maxAge: maxCookieTime });
        next();
    }
    else{
        console.log("Cookie check fail");
        res.status(500).json({ error: 'Cookie check fail' });
    }
});

function getUserName(req){
    var cookie = req.cookies.appId;
    var userName = cookiesToUserNames[cookie];

    return userName;
}

app.get('/authenticate',function(req,res,next){
    res.status(200).json({ message: 'Pass' });
});

app.post('/addFriend/:friendUserName',function (req,res,next) {
    console.log("Trying to add friend");
    var userName = getUserName(req);
    var friendUserName = req.params.friendUserName;
    var friendUser = userNamesToUsers[friendUserName];

    if(friendUser){
        friendUser.friendsRequests.push(userName);
        res.status(200).json({ message: userName + ' send friend request to ' + friendUserName});
    }
    else{
        res.status(500).json({ error: friendUserName + ' does not exist' });
    }
});

app.get('/friendRequests',function (req,res,next) {
    console.log("get friends Request");
    var userName = getUserName(req);

    res.status(200).json(userNamesToUsers[userName].friendsRequests);
});

app.post('/acceptFriend/:friendUserName',function (req,res,next) {
    console.log("try to ACCEPTING FRIEND");
    var userName = getUserName(req);
    var friendUserName = req.params.friendUserName;
    var friendsRequests = userNamesToUsers[userName].friendsRequests;
    var indexOfFriend = friendsRequests.indexOf(friendUserName);

    if (indexOfFriend > -1) {
        console.log("friend user name is my friend");
        friendsRequests.splice(indexOfFriend, 1);
        userNamesToUsers[userName].friends.push(friendUserName);
        userNamesToUsers[friendUserName].friends.push(userName);
        console.log("accepting friend is done");
        res.status(200).json({ message: userName + ' accepted ' + friendUserName });
    }
    else{
        res.status(500).json({ error: 'There is no friend request from ' + friendUserName });
    }
});

app.get('/friends',function (req,res,next) {
    console.log("get friends");
    var userName = getUserName(req);

    res.status(200).json(userNamesToUsers[userName].friends);
});

app.post('/createPrivateEvent',function(req,res,next){
    console.log("create private event");
    var userName = getUserName(req);
    var eventName = req.body["name"];
    var eventLocation = req.body["location"];
    var eventDateAndTime = req.body["dateAndTime"];
    var eventParticipants = req.body["participants"];
    var eventImageURL = req.body["imgURL"];
    var eventDescription = req.body["description"];

    eventParticipants.push(userName);
    var event = {name: eventName, location: eventLocation, dateAndTime: eventDateAndTime, creator: userName,
        participants: eventParticipants, imgURL: eventImageURL, description: eventDescription,
        attendingUsers: [userName], noResponseUsers: [],notGoingUsers: [], type: "Private"};

    registerParticipants(eventParticipants,currentEventID, userName, event);
    eventIdsToEvents[currentEventID] = event;
    userNamesToUsers[userName].events.push(currentEventID);
    currentEventID++;

    console.log("Private event was created");
    res.status(200).json({ message: 'Private event was created' });
});

app.post('/createPublicEvent',function(req,res,next){
    console.log("create public event");
    var userName = getUserName(req);
    var eventName = req.body["name"];
    var eventCategory = req.body["category"];
    var eventLocation = req.body["location"];
    var eventDateAndTime = req.body["dateAndTime"];
    var eventMaxAge = req.body["maxAge"];
    var eventMinAge = req.body["minAge"];
    var eventMaxParticipants = req.body["maxParticipants"];
    var eventImageURL = req.body["imgURL"];
    var eventDescription = req.body["description"];
    var eventParticipants = req.body["participants"];

    eventParticipants.push(userName);
    var event = {name: eventName, category: eventCategory, location: eventLocation, creator: userName,
        dateAndTime: eventDateAndTime, maxAge: eventMaxAge, minAge: eventMinAge,
        maxParticipants: eventMaxParticipants,imgURL: eventImageURL, description: eventDescription,
        participants: eventParticipants, attendingUsers: [userName], noResponseUsers: [], notGoingUsers: [],
        requestToParticipantUsers: [], type: "Public"};

    registerParticipants(eventParticipants,currentEventID, userName, event);
    eventIdsToEvents[currentEventID] = event;
    userNamesToUsers[userName].events.push(currentEventID);
    currentEventID++;

    console.log("Public event was created");
    res.status(200).json({ message: 'Public event was created' });
});

function registerParticipants(participants, currentEventID, eventCreatorUserName, event){
    for(var i = 0; i<  participants.length; i++){
        if(eventCreatorUserName !== participants[i]){
            userNamesToUsers[participants[i]].events.push(currentEventID);
            event.noResponseUsers.push(participants[i]);
        }
    }
}

app.post('/acceptEventRequest/:eventId',function (req,res,next) {
    console.log("Trying to accept event Request");
    changeRSVP("attending", res, req);
});

app.post('/rejectEventRequest/:eventId',function (req,res,next) {
    console.log("Trying to reject Event Request");
    changeRSVP("not going", res, req);
});

function changeRSVP(status, res, req) {
    console.log("RSVP");
    var userName = getUserName(req);
    var eventId = req.params.eventId;
    var event = eventIdsToEvents[eventId];

    if (event) {
        console.log("event was found");
        var eventIndex = userNamesToUsers[userName].events.indexOf(parseInt(eventId));
        if (eventIndex > -1) {
            changeEventStatus(status, event, userName, res);
            res.status(200).json({message: userName + ' ' + status + ' to ' + event.name});
        }
        else {
            res.status(500).json({error: 'Event ID does not found'});
        }
    }
    else {
        console.log("event was not found");
        res.status(500).json({error: 'Event ID does not exist'});
    }

}

function changeEventStatus(status, event, userName, res) {
    console.log("change status");
    if (status === "attending"){
        console.log("attend to event");
        var eventIndex = event.attendingUsers.indexOf(userName);
        if (!(eventIndex > -1)){
            if (event.type === "Public") {
                if (event.attendingUsers.length < event.maxParticipants) {
                    changeToAttending(event, userName);
                }
                else {
                    res.status(500).json({ error: 'The event is full' });
                }
            }
            else {
                changeToAttending(event, userName);
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
            }else{
                event.attendingUsers.splice(eventIndex, 1);
            }

            event.notGoingUsers.push(userName);
        }
    }
}

function changeToAttending(event, userName) {
    var eventIndex = event.noResponseUsers.indexOf(userName);
    if (eventIndex > -1){
        event.noResponseUsers.splice(eventIndex, 1);
    }
    else{
        event.notGoingUsers.splice(eventIndex, 1);
    }

    event.attendingUsers.push(userName);
}

app.get('/getEvent/:eventId',function(req,res,next){
    console.log("get  event");
    var userName = getUserName(req);
    var eventId = req.params.eventId;

    if (eventIdsToEvents[eventId]){
        console.log("event was found");
        var eventIndex = userNamesToUsers[userName].events.indexOf(parseInt(eventId));
        if(eventIndex > -1){
            console.log("succeed to get private event");
            var event = eventIdsToEvents[eventId];
            var eventStatus = getStatus(event,userName);
            event[status] = eventStatus;
            res.status(200).json(event);
        }
        else{
            console.log("The user does not has this event");
            res.status(500).json({ error: "The user does not has this event" });
        }
    }
    else{
        console.log("Event was not found");
        res.status(500).json({ error: "Event does not found" });
    }
});

// app.get('/getPublicEvent/:eventId',function(req,res,next){
//     console.log("get public event");
//     getEvent(req, res);
//
//     // delete
//     var userName = getUserName(req);
//     var eventId = req.params.eventId;
//
//     if (eventIdsToEvents[eventId]){
//         console.log("event was found");
//         console.log(userNamesToUsers[userName].events);
//         var eventIndex = userNamesToUsers[userName].events.indexOf(parseInt(eventId));
//         if(eventIndex > -1){
//             console.log("succeed to get public event");
//             var event = eventIdsToEvents[eventId];
//
//             // only in private event
//             //var eventStatus = getStatus(event,userName);
//             //event[status] = eventStatus;
//             res.status(200).json(event);
//         }else{
//             console.log("the user does not has this event");
//             res.status(500).json({error:"the user does not has this event"});
//         }
//     }else{
//         console.log("event was not found");
//         res.status(500).json({error: "event does not found"});
//     }
// });

// function getEvent(res,req){
//     var userName = getUserName(req);
//     var eventId = req.params.eventId;
//
//     if (eventIdsToEvents[eventId]){
//         console.log("event was found");
//         //console.log(userNamesToUsers[userName].events);
//         var eventIndex = userNamesToUsers[userName].events.indexOf(parseInt(eventId));
//         if(eventIndex > -1){
//             console.log("I participants in the event");
//             var event = eventIdsToEvents[eventId];
//
//             if(event.type === "Private"){
//                 var eventStatus = getStatus(event,userName);
//                 event[status] = eventStatus;
//             }
//
//             res.status(200).json(event);
//         }else{
//             console.log("the user does not has this event");
//             res.status(500).json({error:"the user does not has this event"});
//         }
//     }else{
//         console.log("event was not found");
//         res.status(500).json({error: "event does not found"});
//     }
// }

function getStatus(event,userName){
    var status;

    if(event.participants.indexOf(userName) > -1){
        if(event.attendingUsers.indexOf(userName) > -1){
            status = "Attending";
        }
        else if(event.noResponseUsers.indexOf(userName) > -1){
            status = "NotResponded";
        }
        else if(event.notGoingUsers.indexOf(userName) > -1){
            status = "NotGoing";
        }
        else{
            status = "Not part of the event";
        }
    }
    else{
        status = "Not part of the event";
    }

    return status;
}

app.get('/getEvents',function(req,res,next){
    console.log("try to get events");
    var userName = getUserName(req);
    console.log("user name was found");
    var userEvents = [];

    for (var i = 0; i < userNamesToUsers[userName].events.length; i++){
        var event = eventIdsToEvents[userNamesToUsers[userName].events[i]];
        var eventStatus = getStatus(event,userName);
        event["status"] = eventStatus;
        userEvents.push(event);
        console.log(event);
    }

    console.log("retrun all events");
    res.status(200).json(userEvents);
});

app.get('/getCategories', function (req, res, next) {
    console.log("Get Categories");
    res.status(200).json(publicEventsCategories);
});

app.get('/findPublicEvents/:eventCategory', function(req, res, next) {
    console.log("Find public Events");
    var userName = getUserName(req);
    var myAge = userNamesToUsers[userName].age;
    var eventCategory = req.params.eventCategory;
    var publicEvents = [];

    for (var eventId in eventIdsToEvents) {
        var event = eventIdsToEvents[eventId];

        if (event.type === "Public" ){
            if (eventCategory === event.category && event.participants.length < event.maxParticipants &&
                myAge <= event.maxAge && myAge >= event.minAge){
                publicEvents.push(event);
            }
        }
    }

    res.status(200).json(publicEvents);
});

app.get('/getUserData', function (req, res, next) {
    console.log("Get User");
    var userName = getUserName(req);
    res.status(200).json(userNamesToUsers[userName]);
});


app.post('/requestToParticipantInPublicEvent/:eventId', function (req, res, next) {
    console.log("Request to Participant in event ");
    var eventId = req.params.eventId;
    var event = eventIdsToEvents[parseInt(eventId)];
    var userName = getUserName(req);

    if (event){
        if (event.type === "Public"){
            var userNameIndex = event.participants.indexOf(userName);

            if(!(userNameIndex > -1)){
                event.participants.push(userName);
                event.requestToParticipantUsers.push(userName);
                userNamesToUsers[userName].events.push(event);
                res.status(200).json({ massage: "The user added to the event, pending to approval" });
            }
            else {
                res.status(500).json({ error: "The user is already participant in the event" });
            }
        }
        else{
            res.status(500).json({ error: "This is private event" });
        }
    }
    else{
        res.status(500).json({ error: "Event does not exist" });
    }

});

app.post('/acceptParticipationRequest/:eventId/:pendingUserName', function (req, res, next) {
    var userName = getUserName(req);
    var eventId = req.params.eventId;
    var event = eventIdsToEvents[parseInt(eventId)];
    var pendingUserName = req.params.pendingUserName;
    var pendingUser = userNamesToUsers[pendingUserName];

    if (event && pendingUser){
        if (event.creator === userName){
            var pendingUserIndex = event.requestToParticipantUsers.indexOf(pendingUserName);

            if (!(pendingUserIndex > -1)){
                if (event.attendingUsers.length < event.maxParticipants){
                    event.attendingUsers.push(pendingUserName);
                    event.requestToParticipantUsers.splice(pendingUserIndex, 1);
                }
                else {
                    res.status(200).json({ error: "The event is full" });
                }
            }
            else{
                res.status(200).json({ error: pendingUserName + " does not ask to join to this event" });
            }
        }
        else{
            res.status(200).json({ error: "You are not the creator of the event" });
        }
    }
    else{
        res.status(200).json({ error: "Event or pending user name does not exist" });
    }
});

app.post('/rejectParticipationRequest/:eventId/:pendingUserName', function (req, res, next) {
    var userName = getUserName(req);
    var eventId = req.params.eventId;
    var event = eventIdsToEvents[parseInt(eventId)];
    var pendingUserName = req.params.pendingUserName;
    var pendingUser = userNamesToUsers[pendingUserName];

    if (event && pendingUser){
        if (event.creator === userName){
            var pendingUserIndex = event.requestToParticipantUsers.indexOf(pendingUserName);

            if (!(pendingUserIndex > -1)){
                event.requestToParticipantUsers.splice(pendingUserIndex, 1);
                pendingUserIndex = event.participants.indexOf(pendingUserName);
                event.participants.splice(pendingUserIndex, 1);
            }
            else{
                res.status(200).json({ error: pendingUserName + " does not ask to join to this event" });
            }
        }
        else{
            res.status(200).json({ error: "You are not the creator of the event" });
        }
    }
    else{
        res.status(200).json({ error: "Event or pending user name does not exist" });
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

function createUser(userName,password) {
    userNamesToPasswords[userName] = password;
    var user = {name:userName, friends:[], friendsRequests:[], events:[], eventsRequests:[]};
    userNamesToUsers[userName] = user;
}

function addFriends(userName){
    for(var i = parseInt(userName) + 1; i < 10; i++){
        userNamesToUsers[userName].friends.push("" + i);
        userNamesToUsers["" + i].friends.push(userName);
    }
}

function addFriends2(userName){
    for(var i = parseInt(userName) + 5; i < 10; i++){
        userNamesToUsers[userName].friends.push("" + i);
    }
}