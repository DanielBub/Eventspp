
/**
 * Created by dbublil on 8/1/2017.
 */

var server_prefix = "https://eventsppp.herokuapp.com";
currentFriendList = [];

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
    goToPage("RealIndex.html");
}
function acceptFriend(username) {
    alert("ACCEPTING");
    var path = "/acceptFriend/" + username;
    alert(path);
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

    // var path = "/friends";
    // var request = new XMLHttpRequest();
    // request.onreadystatechange = function () {
    //     if(this.readyState == 4 && this.status === 200)
    //     {
    //         alert(this.responseText);
    //     } else if(this.readyState == 4 && this.status === 500)
    //     {
    //         alert("Invalid username");
    //     }
    // };
    // request.open("GET", server_prefix + path, true );
    // request.send();


}
function refreshFriendRequests() {
    try {
        var path = "/friendRequests";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var all_reqs = JSON.parse(this.responseText);
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

function sendFriendRequest() {
    var user = document.getElementById("friendRequestName").value;
    var path = "/addFriend/" + user;
    var request = new XMLHttpRequest();
    alert("Adding " + user);
    request.onreadystatechange = function () {
        if(this.readyState == 4 && this.status === 200)
        {
            alert("Friend request to " + user + " sent.");
        } else if(this.readyState == 4 && this.status === 500)
        {
            alert("Invalid username");
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

function getDocValue(id) {
    return document.getElementById(id).value;
}

function addMyEvents() {
    //get Events
    //
    var strarr = ["Yes", "No", "Maybe"];
    for (var i =0; i < 25; i++) {

        var j = Math.floor(Math.random() * 3);
        addEvent(i,strarr[j]);
    }
}

function addEvent(eventStr, str) {
    var event = document.createElement("div");
    event.className = "eventStyle" + str;
    event.innerHTML = eventStr;
    var div = document.getElementById("myEvents");
    div.appendChild(event);
}