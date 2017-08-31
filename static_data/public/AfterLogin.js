
/**
 * Created by dbublil on 8/1/2017.
 */


var server_prefix = "https://eventspp.herokuapp.com";
// var server_prefix = "http://localhost:5000";
currentFriendList = [];

function authenticate() {
    var path = "/authenticate";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 500)
        {
            alert("Please log in.");
            disconnect();

        } else {
            document.getElementById("yesPass").style.visibility = "visible";

        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function acceptOrReject(username) {
    return "    <button class=\"myButton\" onclick=\"acceptFriend(\'" + username + "\')\">Accept</button>"
}

function goToFriends() {
    goToPage("Friends.html");
}

function goToEvents() {
    goToPage("Events.html");
}

function goHome() {
    goToPage("AfterLogin.html");
}

function disconnect() {
    goToPage("Home2.html");
}

function acceptFriend(username) {
    // alert("ACCEPTING");
    var path = "/acceptFriend/" + username;
    // alert(path);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("You and " + username + " are now friends!");
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert("Invalid username");
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}

function fillCategories() {
    var path = "/getCategories";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            for (var i = 0; i < arr.length; i++) {
                addCategoryToSelect(arr[i]);
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert("Server error getting friends");
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();
}

function addCategoryToSelect(str) {
    var x = document.getElementById("publicEventCategory");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);
}

function refreshFriendRequests() {
    try {
        var path = "/friendRequests";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var all_reqs = JSON.parse(this.responseText);
                var spanOfNumFriends = document.getElementById("requestNum");
                spanOfNumFriends.innerHTML = all_reqs.length;
                var str = "";
                all_reqs.forEach(function(friend) {
                    str = friend + acceptOrReject(friend) + "<br>";
                });
                document.getElementById("addedMe").innerHTML =  str;
            } else if (this.readyState == 4 && this.status == 500) {

            }
        };
        request.open("GET", server_prefix + path, true);
        request.send();
    } catch (err) {
        alert(err);
    }
}

setInterval(refreshFriendRequests, 1000);

function sendFriendRequest() {
    var user = document.getElementById("friendRequestName").value;
    var path = "/addFriend/" + user;
    var request = new XMLHttpRequest();
    // alert("Adding " + user);
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("Friend request to " + user + " sent.");
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(this.responseText);
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();

}

function goToPage(page) {
    window.location.href = server_prefix + "/public/" + page;
}

function addFriendToEvent() {
    currentFriendList.push(getSelectValue("friendSelect"));
}

function fillFriendList() {
    var path = "/friends";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            for (var i = 0; i < arr.length; i++) {
                addFriendToSelect(arr[i]);
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert("Server error getting friends");
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();

}

function addFriendToSelect(str) {
    var x = document.getElementById("friendSelect");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);

    var x = document.getElementById("publicEventfriendSelect");
    var option = document.createElement("option");
    option.text = str;
    x.add(option);
}
function getSelectValue(id) {
    var e = document.getElementById(id);
    return e.options[e.selectedIndex].text;
}

function eventer() {
    var eventObj = {
        "name" : getDocValue("eventName"),
        "location" : getDocValue("eventLoc"),
        "dateAndTime" : getDocValue("eventDate"),
        "imgURL" : getDocValue("eventPic"),
        "description" : getDocValue("eventDescription"),
        "participants" : currentFriendList
    };
    var path = "/createPrivateEvent";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert(this.responseText);
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert("Invalid username");
        }
    };
    request.open("POST", server_prefix + path, true );
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(eventObj));
    request.send();
}

function publicEventer() {
        var eventObj = {
            "name" : getDocValue("publicEventName"),
            "category": getSelectValue("publicEventCategory"),
            "location" : getDocValue("publicEventLoc"),
            "dateAndTime" : getDocValue("publicEventDate"),
            "imgURL" : getDocValue("publicEventPic"),
            "description" : getDocValue("publicEventDescription"),
            "participants" : currentFriendList,
            "maxAge": getDocValue("publicMaxAge"),
            "minAge": getDocValue("publicMinAge"),
            "maxParticipants" : getDocValue("publicEventMaxPartici")
        };
        var path = "/createPublicEvent";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                alert(this.responseText);
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert("Invalid username");
            }
        };
        request.open("POST", server_prefix + path, true );
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(eventObj));
        request.send();
}

function getDocValue(id) {
    return document.getElementById(id).value;
}

function addMyEvents() {

    var strarr = ["Yes", "No", "Maybe"];
    for (var i =0; i < 25; i++) {

        var j = Math.floor(Math.random() * 3);
        // addMockEvent(i,strarr[j]);
    }

    var path = "/getEvents";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            var arr = JSON.parse(this.responseText);
            alert("you have " + arr.length + " new event(s)");
            for (var i = 0; i < arr.length; i++) {
                addEvent(arr[i], "myEvents");
            }
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert(this.responseText);
        }
    };
    request.open("GET", server_prefix + path, true );
    request.send();



}

function addEvent(event, divName) {
    var eventDiv = document.createElement("div");
    var img = document.createElement("img");
    var container = document.createElement("div");
    var strings = [];
    strings.push(event.name, event.dateAndTime, event.location);
    container.className = "container";
    img.src = event.imgURL || "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png";
    img.className = "eventImg";
    eventDiv.className = "eventStyle" + event.status;
    eventDiv.id = event.id;
    container.appendChild(img);
    eventDiv.appendChild(container);
    textNodeWithSpaces(eventDiv,strings);
    var mainEventsDiv = document.getElementById(divName);
    mainEventsDiv.appendChild(eventDiv);
}

$(document).click(function(e) {
    if (isEvent(e.target.className)) {
        var eventId =  e.target.id;

        var path = "/getEvent/" + eventId;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if(this.readyState == 4 && this.status === 200)
            {
                try {
                    alert("hey");
                    var event = JSON.parse(this.responseText);
                    document.getElementById("currentEvent").innerHTML = presentEvent(event);
                    document.getElementById("currentEvent").style.display = "block";
                    if (document.getElementById("myEvents")) {
                        document.getElementById("myEvents").style.display = "none";
                    } else {
                        document.getElementById("myPublicEvents").style.display = "none";
                    }
                } catch(err) {
                    alert(err);
                }
            } else if(this.readyState == 4 && this.status === 500)
            {
                alert(this.responseText);
            }
        };
        request.open("GET", server_prefix + path, true );
        request.send();
    }
});

function presentEvent(event) {
    if (event.type === "Private") {
        var str = event.name + "<br>" + event.location + "<br>" + event.dateAndTime + "<br>" + event.participants +
            "<br><img style = \"float: right\" src=\'" + event.imgURL + "\'><br>" + event.description + "<br>";
        str += "<button class = \'mybutton\' onclick=\"acceptEvent(" + event.id + ")\"> Accept </button>";
        str += "<button class = \'mybutton\' onclick=\"rejectEvent(" + event.id + ")\"> Reject </button>";
        alert(str);
        return str;
    } else {
        var str = event.name + "<br>" + event.location + "<br>" + event.dateAndTime.split("T") + "<br>Participants:" +
            event.participants + "<br><img style = \"float: right\" src=\'" + event.imgURL + "\'><br>" + event.description + "<br>";
        if (event.isAdmin) {
            event.requestToParticipantUsers.forEach(function(user) {
                str += "<div id=request" + user + ">";
                str += user + "<button class = \"myButton\" onclick=\"acceptUser(" + event.id + ",\'" + user + "\')\"> Acccept </button>";
                str += "<button class = \"myButton\" onclick=\"rejectUser(" + event.id + ",\'" + user + "\')\"> Reject </button><br>";
                str += "</div>"
            });
        } else {
            str += "<button class = \'myButton\' onclick=\"askToJoinEvent(" + event.id + ")\"> Ask to join </button>";
        }
        return str;
    }
}

function acceptUser(event_id,username) {
    var path = "/acceptParticipationRequest/" + event_id + "/" + username;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert(username + " accepted");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(this.responseText)
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
    document.getElementById("request" + username).style.display = "none";
}

function rejectUser(event_id,username) {
    var path = "/acceptParticipationRequest/" + event_id + "/" + username;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert(username + " rejected");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(this.responseText)
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
    document.getElementById("request" + username).style.display = "none";
}

function askToJoinEvent(id) {
    var path = "/requestToParticipantInPublicEvent/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("Asked to join event");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(this.responseText)
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();

}
function acceptEvent(id) {
    var path = "/acceptEventRequest/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("event acccepted");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(this.responseText["error"])
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();

}

function rejectEvent(id) {
    var path = "/rejectEventRequest/" + id;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("event acccepted");
        } else if (this.readyState == 4 && this.status === 500) {
            alert(this.responseText["error"])
        }
    };
    request.open("POST", server_prefix + path, true );
    request.send();
}
function isEvent(str) {
    return (str === "eventStyleNo" ||  str === "eventStyleYes" || str === "eventStyleMaybe");
}

function shit() {
    alert("shit!");
}

function textNodeWithSpaces(div, strings) {
    for (var i = 0; i < strings.length; i++) {
        var textNode = document.createTextNode(strings[i]);
        div.appendChild(textNode);

        var linebreak = document.createElement('br');
        div.appendChild(linebreak);

        var linebreak = document.createElement('br');
        div.appendChild(linebreak);
    }
}



function addMockEvent(username, goingStatus) {
    var event = document.createElement("div");
    var img = document.createElement("img");
    var txt = document.createTextNode("Text text text text");
    var container = document.createElement("div");
    container.className = "container";
    img.src = Math.random() > 0.5 ? "http://mac.h-cdn.co/assets/15/35/1440442371-screen-shot-2015-08-24-at-25213-pm.png":
        "http://images.fashionmodeldirectory.com/images/models/14441/header_image_8b1d51db-3e50-4965-b0a7-a524430b4f67.jpg";
    img.className = "eventImg";
    event.className = "eventStyle" + goingStatus;
    container.appendChild(img);
    event.appendChild(txt);
    event.appendChild(container);
    var mainEventsDiv = document.getElementById("myEvents");
    mainEventsDiv.appendChild(event);
}
