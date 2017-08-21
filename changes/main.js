/**
 * Created by barak on 01/08/2017.
 */

 var express = require('express');
 var bodyParser = require('body-parser');
 var cookieParser = require('cookie-parser');
 var app = express();

 app.use(cookieParser());
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(express.static('static_data'));

 var currentCookie = 1;
 var usernamesToPasswords = {};
 var usernamesToCookies = {};
 var cookiesToUsernames = {};
 var usernamesToUsers = {};
 var maxCookieTime = 3600000;

 app.post('/register/:username/:password', function(req,res,next){

 	var username = req.params.username;
 	var password = usernamesToPasswords[username];

 	if (password){
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

    // var user = usernamesToUsers[userName];
    var friendUser = usernamesToUsers[friendUserName];

    friendUser.friendsRequests.push(userName);

    res.status(200).json({ message: 'done' });
});

 app.get('/friendRequests',function (req,res,next) {
 	var cookie = req.cookies.appId;
 	var userName = cookiesToUsernames[cookie];

 	res.status(200).json(usernamesToUsers[userName].friendsRequests);
 });

 app.post('acceptFriend/:friendUserName',function (req,res,next) {
 	console.log("ACCEPTING FRIEND");

 	var cookie = req.cookies.appId;
 	var userName = cookiesToUsernames[cookie];
 	var friendUserName = req.params.friendUserName;

 	usernamesToUsers[userName].friends.push(friendUserName);
 	usernamesToUsers[friendUserName].friends.push(userName);

 	res.status(200).json({ message: 'done' });

 });

 app.get('/friends',function (req,res,next) {
 	var cookie = req.cookies.appId;
 	var userName = cookiesToUsernames[cookie];

 	res.status(200).json(usernamesToUsers[userName].friends);
 });


 app.post('/createEvent',function(req,res,next){
 	var cookie = req.cookies.appId;
 	var userName = cookiesToUsernames[cookie];

 	var eventName = req.body["name"];
 	var eventHour = req.body["hour"];

 	var event = {name:eventName, hour:eventHour};
 	usernamesToUsers[userName].events.push(event);
 	res.status(200).json({ message: 'create event is done' });
 });

// maybe change from post to put
app.post('/createEvent',function(req,res,next){
	var cookie = req.cookies.appId;
	var userName = cookiesToUsernames[cookie];

	if (userName){
		console.log("user name was found");
		
		var eventName = req.body["name"];
		var eventHour = req.body["hour"];
		var event = {name:eventName, hour:eventHour};

		usernamesToUsers[userName].events.push(event);

		res.status(200).json({ message: 'create event is done' });
	}else{
		console.log("user name was not found");
		res.status(500).json({"error":"user name does not found"});
	}
});

app.get('/getEvent',function(req,res,next){
	var cookie = req.cookies.appId;
	var userName = cookiesToUsernames[cookie];

	var eventName = req.body["name"];

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