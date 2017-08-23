
var server_prefix = "https://eventsppp.herokuapp.com";
 // var server_prefix = "http://localhost:5000";
var current_user = "";

function moveToAfterLogin() {
    window.location.href = server_prefix + "/public/AfterLogin.html";
}
function login() {
	var user = document.getElementById("login_user").value;
	var password = document.getElementById("login_password").value;
	var path = "/login/" + user + '/' + password;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
		if(this.readyState == 4 && this.status === 200)
		{
            current_user = user;
			alert("Welcome " + user + "!");
			moveToAfterLogin();
		} else if(this.readyState == 4 && this.status === 500)
		{
			alert("Invalid username or password");
		}
	};
	request.open("POST", server_prefix + path, true );
	request.send();
}

function signup() {
	try {
        var user = document.getElementById("register_user").value;
        var password = document.getElementById("register_password").value;
        var path = "/register/" + user + '/' + password;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                alert(user + " registered.");
            } else if (this.readyState == 4 && this.status == 500){
                alert(user + " already exists.")
            }
        };
        request.open("POST", server_prefix + path, true);
        request.send();
    } catch (err) {
		alert(err);
	}

}

function sendmsg() {
    var msg = document.getElementById("msg").value;
    var path = "/item/";
    var request_json = {
        "data": msg,
		"user" : current_user
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

        } else if (this.readyState == 4 && this.status == 500) {}
    };
    request.open("POST", server_prefix + path, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(request_json));
}

function chatUpdater() {
    var path = "/items";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        	var all_msg = JSON.parse(this.responseText);
        	var str = "";
        	Object.keys(all_msg).forEach(function (key) {
        		str += all_msg[key]["id"] + "." + all_msg[key]["user"] + ": " + all_msg[key]["data"] + "<br>";
			});
			document.getElementById("content").innerHTML =  str;
        } else if (this.readyState == 4 && this.status == 500) {}
    };
    request.open("GET", server_prefix + path, true);
    request.send();
}

// var t=setInterval(chatUpdater,1000);

function deleteMsg() {

    var msg = document.getElementById("delete_msg").value.trim();
    var path = "/item/" + msg;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

        } else if (this.readyState == 4 && this.status == 500) {}
    };
    request.open("DELETE", server_prefix + path, true);
    request.send();
}

function editMsg() {
    var index = document.getElementById("edit_idx").value.trim();
    var msg = document.getElementById("edit_msg").value.trim();
    var path = "/item/";
    var request_json = {
        "id" : index,
        "data" : msg,
        "user" : current_user
    };
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

        } else if (this.readyState == 4 && this.status == 500) {}
    };
    request.open("PUT", server_prefix + path, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(request_json));
}

function showMsg() {
    var msg = document.getElementById("show_idx").value.trim();
    var path = "/item/" + msg;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var msg = JSON.parse(this.responseText);
            alert(msg["user"] + ": " + msg["data"]);
        } else if (this.readyState == 4 && this.status == 500) {
            alert("No such msg.")
        }
    };
    request.open("GET", server_prefix + path, true);
    request.send();
}



