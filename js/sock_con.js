var allUrl = window.location.href;
var Host = window.location.host;
det_url0 = allUrl.split('?');

if(det_url0[1]) {
	var space = det_url0[1];
	det_url1 = det_url0[1].split('/');
	var session_io = det_url1[0];
	var appli = det_url1[1];
	var instance = parseInt('0' + det_url1[2]);

	if(instance!=''){
	//document.getElementById('room').innerHTML = 'Session : ' + session_io + ' / Appli: ' + appli + '(id:' + instance + ')';

	var socket_init = io('http://vps328149.ovh.net:3000/admin');
	var socket = io('http://vps328149.ovh.net:3000/appli');

	socket_init.on('connect', function () {
		socket_init.emit('join socket', readCookie('conseiller'), 'con');
	});

	socket_init.on('setCook', function (user) {
		createCookie('conseiller', user, 1);
	});

	socket.on('connect', function () {
		socket.emit('join room', space);
	});

	socket.on('notif_' + space, function (data) {
		//alert('Message de ' + data[0] + ' : ' + data[1]);
	});

	socket.on('notifall_' + space, function (allSend) {
		var allData = '';
		for (var i = 0; i < allSend.length; i++) {
			
			styleHead = "background-color:	#f3fab6;";
			avatar = "avatar_default.png";

			if(allSend[i][0]=='client'){
				allSend[i][0] = "guest";
				styleHead = "background-color:#6dbdd6;";
			}
			else
			{
				//allSend[i][0] ='moi';
				avatar = "avatar_default.png";
			}

			allData += '<li class="tweetMessage"><div style="'+styleHead+'" class="headerTweet"><div class="authorTweet ui header"><img class="ui tyni circular image" src="/images/'+avatar+'" /><div class="content"><span>' + allSend[i][0] + '</span></div></div></div><div class="contentTweet"><p>' + allSend[i][1] + '</p><div class="time"><span>' + allSend[i][2] + '</span></div></div></li>';
		}
		document.getElementsByTagName('UL')[0].innerHTML = allData;
		if(allSend.length > 2){ window.scrollTo(0,document.body.scrollHeight); }
	});
	}
	else
	{

		if(session_io!='' && appli!='')
		{
			window.location.href = '/chatbox/room?'+session_io+'/'+appli+'/'+randroom

		} else { alert('No valide URL !'); }
	}
}

function sendData() {
	var data = [];
	//data.push(document.getElementById('blaze').value);
	data.push(parent.document.getElementById('useract').value);
	data.push(document.getElementsByTagName('TEXTAREA')[0].value);
	data.push(0);

	socket.emit('newSend', data, 'con');
	document.getElementsByTagName('TEXTAREA')[0].value = '';
	document.getElementById('blaze').value = '';
	return false;
}

function addPoint(key){
	socket.emit('add point', key);
}

function createCookie(name,value,days) {
	var expires
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}
	else expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function quit() {

	var q = confirm("Voulez vous quittez la conversation ?");

	if (q == true) {
    	socket.emit('quit', 'con');
    	parent.window.location.href = '/chatbox';
		//window.location.href = '/conseil/quit';
		//parent.document.all['admtchat'].src = '/admin';
	}
}