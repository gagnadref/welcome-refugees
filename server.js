var express = require('express');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var path = require('path');
var url = require('url');
var fs = require('fs');
var multer  = require('multer');
var time = require('time');
var dateFormat = require('dateformat');
var request = require('request');
var tokenaccess = 0;
var connectedUser = {};
var roomsOccupacy = {};

var collab = {};
collab["pat"] = "pat2016";
collab["flo"] = "flo2016";
collab["joe"] = "joe2016";
collab["mic"] = "yellow";

console.log("Server Front Chat online !");

var app = express();

var repub = ['css', 'js', 'semantic', 'images'];
for (var r in repub) {
	app.use('/'+repub[r], express.static(__dirname + '/'+repub[r]));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set('views', __dirname +'/templates');
app.set('view engine', 'jade');

var router = express.Router();

router.get('*', function (req, res, next) {
	console.log('Access route ok :: '+req.url);
	console.log(req.headers.host);
	next();
});

app.use(router);

app.get('/', function(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end("Web Server on process ...");
});

app.get('/chatbox', function(req, res) {
	tokenaccess = 0;
	if (req.cookies.passaccess) {
		tokenaccess = 1;
	}

	res.render('layout_iframe', {
		pagetitle: 'Chatbox :: hello !',
		message: 'No service available !',
		access: tokenaccess,
		user: req.cookies.adm
	});
});

app.get('/chatbox/roomlist', function(req, res) {
	console.log('Cookies: ', req.cookies);
	console.log(Object.keys(connectedUser).length);

	tokenaccess = 0;
	if (req.cookies.passaccess) {
		tokenaccess = 1;
		logAdmin(req.cookies.adm);
		res.cookie('passaccess', '1', { maxAge: 3600000, httpOnly: true });
		res.cookie('adm', req.cookies.adm, { maxAge: 3600000, httpOnly: true });
	}

	res.render('layout', {
		pagetitle: 'ChatBox :: connected',
		message: '',
		code: 'sock_adm.js',
		host: req.headers.host,
		access: tokenaccess
	});
});

app.get('/chatbox/roomlist/disconnect', function(req, res) {
	res.clearCookie('passaccess');
	res.clearCookie('adm');
	delete connectedUser[req.cookies.adm];
	res.redirect('/chatbox');
});

app.post('/chatbox/roomlist', function(req, res) {
	var pass=req.body.pass;
	var login=req.body.login;

	if (pass == collab[login]) {
		logAdmin(login);
		res.cookie('passaccess', '1', { maxAge: 3600000, httpOnly: true });
		res.cookie('adm', login, { maxAge: 3600000, httpOnly: true });
		res.end("Connexion réussie.\nVeuillez rechargez la page.");
	} else {
		res.end("Echec de la connexion.\nVeuillez rechargez la page et réessayer.");
	}
});

app.get('/chatbox/guest', function(req, res) {
	console.log("User online :");
	console.log(connectedUser);

	nowTchat = new time.Date();
	nowTchat.setTimezone('Europe/Amsterdam');

	roomid = req.url.split("/")[req.url.split("/").length -1];

	console.log(roomid);

	if (roomid=="room" || roomid=="") {
		res.render('layout_cli', {
			pagetitle: 'ChatBox :: guest',
			message: 'Chargement en cours...',
			code: 'sock_cli.js',
			host: req.headers.host,
			access: 1
		});
	} else {
		res.render('layout_cli', {
			pagetitle: 'ChatBox :: guest',
			message: 'Chargement en cours...',
			code: 'sock_cli.js',
			host: req.headers.host,
			access: 1
		});
	}
});

app.get('/chatbox/room', function(req, res) {
	tokenaccess = 0;

	if (req.cookies.passaccess) {
		tokenaccess = 1;
		logAdmin(req.cookies.adm);
		res.cookie('passaccess', '1', { maxAge: 3600000, httpOnly: true });
		res.cookie('adm', req.cookies.adm, { maxAge: 3600000, httpOnly: true });
	}

	roomid = req.url.split("/")[req.url.split("/").length -1];
	console.log(roomid);

	res.render('layout', {
		pagetitle: 'ChatBox :: guest',
		message: 'Chargement en cours...',
		code: 'sock_con.js',
		host: req.headers.host,
		access: tokenaccess
	});
});

app.post('/chatbox/translate', function(req, res) {
	var text = req.body.message;
	var lng = req.body.lng;
	var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20161111T135644Z.ef7c129eda54f263.817e49c172c3fb12add68c390a7722242a930a77&text='+text+'&lang='+lng;

	request(url, function(error, response, body) {
		console.log(error);
    trad=JSON.parse(body);
    console.log("trad >>>>"+text);console.log(trad.text);
		res.end(trad.text[0]);
	});
});

app.get('/chatbox/bye', function(req, res) {
	res.clearCookie('room');
	delete roomsOccupacy[roomid];

	res.render('layout_merci', {
		pagetitle: 'ChatBox :: guest',
		message: 'Bye !',
	});
});


app.get('/chatbox/room/quit', function(req, res) {
	res.render('layout_quit', {
		pagetitle: 'ChatBox :: guest',
		message: 'Selectionnez une conversation dans la liste.',
	});
});

var listFiles = [];
var filog = '';
fs.readdir(__dirname +'/archives', function (err, files) {
	listFiles=[];

	files.forEach(function (file) {
		listFiles.push(file);
	});
});

app.get(['/chatbox/archives', '/chatbox/archives/*'], function(req, res) {
	tokenaccess = 0;

	if (req.cookies.passaccess) {
		tokenaccess = 1;
	}

	filog = '';
	if (req.query.tchat) {
		filog = req.query.tchat;
	}

	if (filog=='') {
		fs.readdir(__dirname +'/archives', function (err, files) {
			listFiles=[];

			files.forEach(function (file) {
				listFiles.push(file);
			});

			res.render('layout_archive', {
				pagetitle: 'Archive ChatBox',
				files: listFiles,
				access: tokenaccess
			});
		});
	} else if (tokenaccess) {
		file = __dirname + '/archives/'+filog;
		fs.stat(file, function(err, stats) {
			if (err) {
				res.redirect('/chatbox/archives/error');
			}
		});

		res.download(file);
  } else {
		res.render('layout_archive', {
			pagetitle: 'Archive ChatBox',
			files: listFiles,
			access: tokenaccess
		});
	}
});

app.get('/chatbox/users/online', function(req, res) {
	res.end(Object.keys(connectedUser)[0]);
});

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + '/archives');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname + '-' + Date.now());
  }
});

var upload = multer({ storage: storage}).array('file_log');

app.post('/chatbox/archives', function(req, res, next) {
	tokenaccess = 0;

	if (req.cookies.passaccess) {
		tokenaccess = 1;
	}

	if (tokenaccess) {
		upload(req,res,function(err) {
      if(err) {
        return res.end("Error uploading file.");
      }
      console.log(req.files);
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end("File is uploaded <a href='/chatbox/archives'>Retour <<</a>");
    });
	} else {
		res.writeHead(200, {"Content-Type": "text/html"});
    res.end("Access denied.");
	}
});

app.get('/chatbox/invite', function(req, res) {
	tokenaccess = 0;

	if (req.cookies.passaccess) {
		tokenaccess = 1;
	}

	if (tokenaccess=1) {
		connectedUsers = Object.keys(connectedUser);
		res.render('layout_rooms', {
			pagetitle: 'ChatBox :: rooms',
			users: connectedUsers
		});
	} else {
		res.writeHead(200, {"Content-Type": "text/html"});
    res.end("Access denied.");
	}
});

app.get('/randroom', function(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end("var randroom="+Math.floor((Math.random() * 899999) + 100000)+";");
});

function logAdmin(a) {
	dateLog = new time.Date();
	dateLog.setTimezone('Europe/Amsterdam');
	connectedUser[a] = dateLog.valueOf();
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

app.listen(8080);

module.exports = app;
