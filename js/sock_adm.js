var Host = window.location.host;
// var HostWS = "vps328149.ovh.net:3000";
var HostWS = "localhost:8090";
var socket_init = io('http://'+HostWS+'/admin');
var socket = io('http://'+HostWS+'/appli');
var allData;

var alertSound = document.getElementById('audioPlayer');

socket_init.on('connect', function () {
	socket_init.emit('get all room', null);
});

socket_init.on('show link room', function (data, isnew) {
	if (Object.keys(data).length>0){
		allData = '';

		for (var i = 0; i < Object.keys(data).length; i++) {
			idbloc = Object.keys(data)[i];
			lastanswer = data[idbloc][data[idbloc].length - 1][0];

			if (lastanswer!= parent.document.getElementById('useract').value && lastanswer!='Chatbox') {
				classroom = "roomask";
				classalert = "alert circle greenc blink";
			} else {
				classroom = "roomdone";
				classalert = "noalert";

				if (data[idbloc].length == 1) {
					classroom = "roomnew";
					classalert = "alert circle orangec blink";
				}
			}

			if (idbloc.split('/')[0].split('::')[0]==parent.document.getElementById('useract').value) {
				allData += '<li><div><a class="'+classroom+'" id="'+idbloc.split('/')[idbloc.split('/').length -1]+'" onclick="ifrTchat(\'/chatbox/room?'+Object.keys(data)[i]+'\')">'+idbloc.split('/')[0].split('::')[1]+'</a><div id="alert'+idbloc.split('/')[idbloc.split('/').length -1]+'" class="'+classalert+'"></div></div></li>';
			} else {
				delete data[idbloc]; i--;
			}
		}

		document.getElementsByTagName('UL')[0].innerHTML = allData;

		if (allData == '' ) {
			document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
		}

		if ((parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox' || parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox/') && Object.keys(data)[0]) {
			if (Object.keys(data)[0].split('/')[0].split('::')[0]==parent.document.getElementById('useract').value) {
				ifrTchat("/chatbox/room?"+Object.keys(data)[0]);
			}
		}
	} else {
		document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
	}
});

socket.on('show link room', function (data, isnew) {
	if (Object.keys(data)[Object.keys(data).length - 1].split('/')[0].split('::')[0]!=parent.document.getElementById('useract').value) {
		isnew = 0;
	}

	if (Object.keys(data).length>0) {
		allData = '';

		for (var i = 0; i < Object.keys(data).length; i++) {
			idbloc = Object.keys(data)[i];
			lastanswer = data[idbloc][data[idbloc].length - 1][0];

			if (lastanswer!= parent.document.getElementById('useract').value && lastanswer!='Chatbox') {
				classroom = "roomask";
				classalert = "alert circle greenc blink";
			} else {
				classroom = "roomdone";
				classalert = "noalert";

				if (data[idbloc].length == 1) {
					classroom = "roomnew";
					classalert = "alert circle orangec blink";
				}
			}

			if (idbloc.split('/')[0].split('::')[0]==parent.document.getElementById('useract').value) {
				allData += '<li><div><a class="'+classroom+'" id="'+idbloc.split('/')[idbloc.split('/').length -1]+'" onclick="ifrTchat(\'/chatbox/room?'+Object.keys(data)[i]+'\')">'+idbloc.split('/')[0].split('::')[1]+'</a><div id="alert'+idbloc.split('/')[idbloc.split('/').length -1]+'" class="'+classalert+'"></div></div></li>';
			} else {
				delete data[idbloc]; i--;
			}
		}

		document.getElementsByTagName('UL')[0].innerHTML = allData;

		if (allData == '' ) {
			document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
		}
		if (isnew) {
			alertSound.play();
			alert('Nouveau user sur le Tchat !');
			alertSound.pause();
			alertSound.currentTime = 0;

			idnew = Object.keys(data)[Object.keys(data).length - 1].split('/')[Object.keys(data)[Object.keys(data).length - 1].split('/').length -1];
			document.getElementById(idnew).setAttribute('class', 'roomnew');
			document.getElementById('alert'+idnew).setAttribute('class', 'alert circle orangec blink');

			if (parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox' || parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox/') {
				ifrTchat('/chatbox/room?'+Object.keys(data)[Object.keys(data).length - 1]);
			}
		}
	} else {
		document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
	}
});

socket.on('show receive msg', function (room) {
	roomid = room.split('/')[room.split('/').length -1];
	document.getElementById(roomid).setAttribute('class', 'roomask');
	document.getElementById('alert'+roomid).setAttribute('class', 'alert circle greenc blink');
});

socket.on('accuse receive msg', function (room) {
	roomid = room.split('/')[room.split('/').length -1];
	document.getElementById(roomid).setAttribute('class', 'roomdone');
	document.getElementById('alert'+roomid).setAttribute('class', 'noalert');
});

socket.on('leave room', function (room) {
	if(room.split('/')[0].split('::')[0]==parent.document.getElementById('useract').value) {
		roomid = room.split('/')[room.split('/').length -1];
		alert("Le user de la room "+roomid+" à quitté la conversation.");
		document.getElementById(roomid).setAttribute('class', 'roomdown');
		document.getElementById('alert'+roomid).setAttribute('class', 'alert circle redc');
		document.getElementById(roomid).setAttribute('onclick', 'parent.window.location.href=parent.window.location.href');
	}
});

function ifrTchat(source) {
	iddone = source.split('/')[source.split('/').length -1];
	parent.document.all['ifrtchat'].src = source;
	parent.document.all['currentroom'].innerHTML = iddone;
}
