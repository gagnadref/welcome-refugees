var Host = window.location.host;
var HostWS = "vps328149.ovh.net:3000";
var socket_init = io('http://'+HostWS+'/admin');
var socket = io('http://'+HostWS+'/appli');
var allData;

var alertSound = document.getElementById('audioPlayer');

socket_init.on('connect', function () {
	socket_init.emit('get all room', null);
});

socket_init.on('show link room', function (data, isnew) {
	if(Object.keys(data).length>0){

		allData = '';
		for (var i = 0; i < Object.keys(data).length; i++) {

			idbloc = Object.keys(data)[i];
			lastanswer = data[idbloc][data[idbloc].length - 1][0];
			if(lastanswer!= parent.document.getElementById('useract').value && lastanswer!='Chatbox'){
				classroom = "roomask";
				classalert = "alert circle greenc blink";
			}
			else
			{
				classroom = "roomdone";
				classalert = "noalert";
				if(data[idbloc].length == 1)
				{
					classroom = "roomnew";
					classalert = "alert circle orangec blink";
				}
			}

			allData += '<li><div><a class="'+classroom+'" id="'+idbloc.replace('tchat/room/', '')+'" onclick="ifrTchat(\'/chatbox/room?'+Object.keys(data)[i]+'\')">'+Object.keys(data)[i]+'</a><div id="'+idbloc.replace('tchat/room/', 'alert')+'" class="'+classalert+'"></div></div></li>';
		}
		document.getElementsByTagName('UL')[0].innerHTML = allData;
		if(parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox'){
			ifrTchat("/chatbox/room?"+Object.keys(data)[0]);
		}
	}
	else
	{
		document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
	}

});

socket.on('show link room', function (data, isnew) {
	if(Object.keys(data).length>0){
	
		allData = '';
		for (var i = 0; i < Object.keys(data).length; i++) {
			idbloc = Object.keys(data)[i];

			lastanswer = data[idbloc][data[idbloc].length - 1][0];
			if(lastanswer.substr(0, 6) == "client"){
				classroom = "roomask";
				classalert = "alert circle greenc blink";
			}
			else
			{
				classroom = "roomdone";
				classalert = "noalert";
				if(data[idbloc].length == 1)
				{
					classroom = "roomnew";
					classalert = "alert circle orangec blink";
				}
			}

			allData += '<li><div><a class="'+classroom+'" id="'+idbloc.replace('tchat/room/', '')+'" onclick="ifrTchat(\'/chatbox/room?'+Object.keys(data)[i]+'\')">'+Object.keys(data)[i]+'</a><div id="'+idbloc.replace('tchat/room/', 'alert')+'" class="'+classalert+'"></div></div></li>';
		}
		document.getElementsByTagName('UL')[0].innerHTML = allData;
		if(isnew){
			alertSound.play();
			alert('Nouveau user sur le Tchat !');
			alertSound.pause();
			alertSound.currentTime = 0;
			//window.location.href = window.location.href;

			idnew = Object.keys(data)[Object.keys(data).length - 1].replace('tchat/room/', '');
			document.getElementById(idnew).setAttribute('class', 'roomnew');
			document.getElementById('alert'+idnew).setAttribute('class', 'alert circle orangec blink');

			if(parent.document.all['ifrtchat'].src =='http://'+Host+'/chatbox'){
				ifrTchat('/chatbox/room?'+Object.keys(data)[Object.keys(data).length - 1]);
			}
		}
	}
	else
	{
		document.getElementsByTagName('UL')[0].innerHTML = "<li>Pas de conversation en cours !</li>";
	}

});

socket.on('show receive msg', function (room) {
	roomid = room.replace('tchat/room/', '');
	document.getElementById(roomid).setAttribute('class', 'roomask');
	document.getElementById('alert'+roomid).setAttribute('class', 'alert circle greenc blink');
});

socket.on('accuse receive msg', function (room) {
	roomid = room.replace('tchat/room/', '');
	document.getElementById(roomid).setAttribute('class', 'roomdone');
	document.getElementById('alert'+roomid).setAttribute('class', 'noalert');
});

socket.on('leave room', function (room) {
	roomid = room.replace('tchat/room/', '');
	alert("Le user de la room "+roomid+" à quitté la conversation.");
	document.getElementById(roomid).setAttribute('class', 'roomdown');
	document.getElementById('alert'+roomid).setAttribute('class', 'alert circle redc');
	document.getElementById(roomid).setAttribute('onclick', 'parent.window.location.href=parent.window.location.href');
});

function ifrTchat(source){
	iddone = source.replace('/chatbox/room?tchat/room/', '');
	parent.document.all['ifrtchat'].src = source;
	parent.document.all['currentroom'].innerHTML = iddone;
}

/*
setInterval(function(){
	parent.document.all['admtchat'].src = parent.document.all['admtchat'].src;
 }, 3000);  // toutes les 5min on refresh la liste des rooms
 */