var fs = require('fs');
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var url = require('url');
var json2csv = require('json2csv');
var time = require('time');
var dateFormat = require('dateformat');
var request = require('request');
app.listen(8090);

module.exports = app;

function handler (req, res) {
	var page = url.parse(req.url).pathname;

	if (page == '/randroom') {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end("var randroom="+Math.floor((Math.random() * 899999) + 100000)+";");
	} else {
		fs.readFile(__dirname + '/welcome.html', function (err, data) {
	    if (err) {
	      res.writeHead(500);
	      return res.end('Error loading');
	    }
	    res.writeHead(200, {"Content-Type": "text/html"});
	    res.end(data);
	  });
	}
}

io.set('origins', 'http://localhost:*');

var id_guest = 1;
var id_user = 0;
var user;
var allSend = {};

var sock_appli = io.of('/appli');
var sock_admin = io.of('/admin');

sock_admin.on('connection', function (socket_init) {
	socket_init.on('join socket', function (cooky, source) {
		if (cooky) {
			user = cooky;
			console.log(user);
		} else if (source == 'cli') {
			if (id_guest!=0) {
				user = 'guest'+id_guest;
				id_guest++;
			} else {
				user = 'guest';
			}
		} else if (id_user!=0) {
				user = 'user'+id_user;
				id_user++;
		} else {
			user = 'user';
		}

		console.log('New connect on socket : '+user);
		socket_init.emit('setCook', user);
		console.log('User online : ' + Object.keys(sock_admin.adapter.rooms).length);
	});

	socket_init.on('get all room', function (room){
		socket_init.emit('show link room', allSend, 0);
	});

	console.log('\n\n\n\n ---------------------------------');
	console.log(socket_init.handshake.headers['referer']);
	console.log(socket_init.handshake.headers['origin']);
	console.log(allSend);
	console.log('--Number of current room(s) : ' + Object.keys(allSend).length);
	console.log('\n ---------------------------------');
});

sock_appli.on('connection', function (socket) {
	socket.on('join room', function (room, user) {
		src = socket.handshake.headers['referer']
				.split("?")[0]
				.split("/")[socket.handshake.headers['referer'].split("?")[0].split("/").length -1];

		console.log(src);
		socket.join(room);
		console.log('Connected to room ' + room);

		alert = 0;
		if (!allSend[room]) {
			alert = 1;
		}

		contain = getDataRoom(room);
		if (alert) {
			socket.broadcast.emit('show link room', allSend, 1);
		}

		sock_appli.to(room).emit('notifall_'+room, contain, user);

		socket.on('newSend', function (data, source)
		{
			contain = getDataRoom(room);

			dateSend = new time.Date();
			dateSend.setTimezone('Europe/Amsterdam');
			dateSend = dateFormat(dateSend, "dd-mm-yyyy HH:MM:ss");

			data[2] = dateSend;
      contain.push(data);
			sock_appli.in(room).emit('notif_'+room, data);
			if (source=="cli") {
      	socket.broadcast.emit('show receive msg', room);
			} else {
				socket.broadcast.emit('accuse receive msg', room);
			}
		});

		socket.on('add point', function (val) {
			contain = getDataRoom(room);
			contain[val][2]+=1;
			socket.broadcast.to(room).emit('notifall_'+room, contain);
			sock_appli.in(room).emit('notifall_'+room, contain);
		});

		socket.on('disconnect', function () {
			console.log('Déconnexion room');
			contain = getDataRoom(room);
			contain_csv = [];

			for (var i in contain) {
				cont = {"auteur": contain[i][0], "message": contain[i][1]};
				contain_csv.push(cont);
			}

			console.log(contain_csv);

			var filename = replaceAll("/", "_", room);

			json2csv({ data: contain_csv, fields: ["auteur", "message"] }, function(err, csv) {
			  if (err) console.log(err);

			  fs.writeFile(__dirname + '/logs/'+filename + ".csv", csv, function(err) {
			    console.log('file saved');
			    console.log('>>>>>> : '+Object.keys(sock_appli.adapter.rooms).length);
					if (Object.keys(sock_appli.adapter.rooms).length < 1) {
						dateTchat = new time.Date();
						dateTchat.setTimezone('Europe/Amsterdam');
						dateTchat = dateFormat(dateTchat, "dd-mm-yyyy--HH-MM-ss");

		        fs.writeFile(__dirname + '/archives/__'+filename + "_"+dateTchat+".csv", csv);
		        fs.unlink(__dirname + '/logs/'+filename + ".csv");

						delete allSend[room];
						console.log('Conversation archivée.');
					}
			  });
			});
		});

		socket.on('quit', function (val) {
			console.log('Déconnexion client');
			contain = getDataRoom(room);
			contain_csv = [];

			for (var i in contain) {
				cont = {"auteur": contain[i][0], "message": contain[i][1]};
				contain_csv.push(cont);
			}

			console.log(contain_csv);

			var filename = replaceAll("/", "_", room);

			json2csv({ data: contain_csv, fields: ["auteur", "message"] }, function(err, csv) {
			  if (err) console.log(err);
			  fs.writeFile(__dirname + '/logs/'+filename + ".csv", csv, function(err) {
			    console.log('file saved');
			  });
			});

			socket.leave(room);
			socket.broadcast.emit('leave room', room);
		});
	});
});

function getDataRoom(r) {
	if (!allSend[r]) {
		dateInit = new time.Date();
		dateInit.setTimezone('Europe/Amsterdam');
		dateInit = dateFormat(dateInit, "dd-mm-yyyy HH:MM:ss");
		allSend[r] = [["Chatbox","Bienvenue sur la ChatBox !",dateInit]];
	}

	return allSend[r];
}

function getAllRoom(){
	return allSend;
}

function replaceAll(find, replace, str){
  return str.replace(new RegExp(find, 'g'), replace);
}
