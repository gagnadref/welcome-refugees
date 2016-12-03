var allUrl = window.location.href;
var Host = window.location.host;
var HostWS = "vps328149.ovh.net:3000";
//var HostWS = "ws.chatbox.local:8090";
det_url0 = allUrl.split('?');
var guest = null;
if(det_url0[1]) {
	var space = det_url0[1];
	det_url1 = det_url0[1].split('/');
	var session_io = det_url1[0];
	var appli = det_url1[1];
	var instance = parseInt('0' + det_url1[2]);


	//console.log(readCookie('client'));




	if(instance!='' && instance!=0){
	//document.getElementById('room').innerHTML = 'Session : ' + session_io + ' / Appli: ' + appli + '(id:' + instance + ')';


	if(readCookie('client')==null){
		guest = prompt("Choisissez un nom", "");
		if(guest!=null && guest!=""){
			createCookie('client', guest, 1);
		}
	}


	var socket_init = io('http://'+HostWS+'/admin');
	var socket = io('http://'+HostWS+'/appli');

	socket_init.on('connect', function () {
		socket_init.emit('join socket', readCookie('client'), 'cli');
	});
/*
	socket_init.on('setCook', function (user) {
		createCookie('client', user, 1);
	});
*/
	socket.on('connect', function () {
		socket_init.emit('get all room', space);
		socket.emit('join room', space, readCookie('client'));
	});

	socket.on('notif_' + space, function (data) {
		//alert('Message de ' + data[0] + ' : ' + data[1]);
		//alert(document.getElementsByTagName('li').length);

		styleHead = "tweetMessage";
		avatar = "avatar_default.png";

		if(data[0]==readCookie('client')){
			styleHead = "tweetMessage myMessage";
			//allSend[i][0] ='Moi';
		}

		li_elem = document.createElement('li');
		li_elem.setAttribute('class', styleHead);

		li_elem.innerHTML = '<div class="headerTweet"><div class="authorTweet ui header"><img class="ui tyni circular image" src="/images/'+avatar+'" /><div class="content"><span>' + data[0] + '</span></div></div></div><div class="contentTweet"><p id="trans_'+document.getElementsByTagName('li').length+'">' + data[1] + '</p><div class="time"><span>' + data[2] + '</span></div></div>';

		document.getElementsByTagName('UL')[0].appendChild(li_elem);
		if(document.getElementById('lng').value!="")
		{
			do_trad(document.getElementById('lng').value, document.getElementById("trans_"+(document.getElementsByTagName('li').length-1)).innerHTML, document.getElementById("trans_"+(document.getElementsByTagName('li').length-1)), (document.getElementsByTagName('li').length-1));
		}
		if(document.getElementsByTagName('li').length > 2){ window.scrollTo(0,document.body.scrollHeight); }

	});

	socket.on('notifall_' + space, function (allSend, user) {
		if(user == readCookie('client'))
		{
			var allData = '';
			for (var i = 0; i < allSend.length; i++) {

				styleHead = "tweetMessage";
				avatar = "avatar_default.png";

				if(allSend[i][0]==readCookie('client')){
					styleHead = "tweetMessage myMessage";
					//allSend[i][0] ='Moi';
				}

				if(i==0){
					allSend[i][0] = "Chatbox";
					styleHead = "tweetMessage";
				}

				allData += '<li class="'+styleHead+'"><div class="headerTweet"><div class="authorTweet ui header"><img class="ui tyni circular image" src="/images/'+avatar+'" /><div class="content"><span>' + allSend[i][0] + '</span></div></div></div><div class="contentTweet"><p id="trans_'+i+'">' + allSend[i][1] + '</p><div class="time"><span>' + allSend[i][2] + '</span></div></div></li>';

			}
			document.getElementsByTagName('UL')[0].innerHTML = allData;

			if(document.getElementById('lng').value!="")
			{
				for (var j = 0; j < allSend.length; j++) { do_trad(document.getElementById('lng').value, document.getElementById("trans_"+j).innerHTML, document.getElementById("trans_"+j), j);};
			}

			if(allSend.length > 2){ window.scrollTo(0,document.body.scrollHeight); }
		}
	});


	}
	else
	{
		if(session_io!='' && appli!='')
		{
			guest = prompt("Choisissez un nom", "");
			if(guest!=null && guest!=""){
				createCookie('client', guest, 1);
				window.location.href = '/chatbox/guest?'+session_io+'::'+guest+'/'+appli+'/'+randroom;
			}else{
				window.location.href = '/chatbox/guest?'+session_io+'/'+appli;
			}

		} else { alert('No valide URL !'); }
	}
}

function sendData() {
	var data = [];
	//data.push(document.getElementById('blaze').value);
	data.push(readCookie('client'));
	data.push(document.getElementsByTagName('TEXTAREA')[0].value);
	data.push(0);

	socket.emit('newSend', data, 'cli');
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
		//if(window.opener){ delete window.opener.tchat; }
    	socket.emit('quit', 'cli');
    	eraseCookie('client');
		window.location.href = '/chatbox/bye';
	}
}

function quit2() {
	if(window.opener){ delete window.opener.tchat; }
    socket.emit('quit', 'cli');
}


document.onkeydown = function(e) {
	var key;
	if (window.event) {
		key = event.keyCode
	}
	else {
		var unicode = e.keyCode ? e.keyCode : e.charCode
		key = unicode
	}

	switch (key) {//event.keyCode
		case 116: //F5 button
			key.returnValue = false;
			key = 0; //event.keyCode = 0;
			return false;
			
		case 82: //R button
			if (event.ctrlKey) {
				alert("L'abeille coule");
			}
			
		case 91: // ctrl + R Button
			event.returnValue= false;
			key=0;
			return false;
	}
}

function ajax_obj()
{
	if(window.XMLHttpRequest)
	{ajax_object = new XMLHttpRequest();}
	else if(window.ActiveXObject)
	{ajax_object = new ActiveXObject("Microsoft.XMLHTTP");}
	else
	{alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest.");}
	return ajax_object;
}


call_ajax = [];

function do_trad(lng, msg, cible, i){
call_ajax[i] = ajax_obj();
call_ajax[i].onreadystatechange = function()
{
	if(call_ajax[i].readyState == 4)
	{
		cible.innerHTML = msg+" >>> "+call_ajax[i].responseText;
	}
}
call_ajax[i].open("POST", "/chatbox/translate", true);
call_ajax[i].setRequestHeader('Content-Type','application/x-www-form-urlencoded');
formdata="lng="+lng+"&message="+msg+"&";
call_ajax[i].send(formdata);
}




/*

window.onbeforeunload = function () {
	quit2();
	return false;
}
*/