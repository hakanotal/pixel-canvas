//APP
const screenWidth = 640;
const screenHeight = 640;
const size = 20;
const width = screenWidth/size;
const height = screenHeight/size;

let grid = [];
for(let y=0; y<width; y++){
    grid[y] = [];
    for(let x=0; x<height; x++){
      grid[y][x] = [100, 100, 100];
    }
}

//FIREBASE
var firebase = require('firebase');
firebase.initializeApp({
    apiKey: "AIzaSyDSJ_ERjIDLqT-1GXrhrMiQUPHI4pSoa5M",
    authDomain: "pixel-canvas.firebaseapp.com",
    databaseURL: "https://pixel-canvas.firebaseio.com",
    projectId: "pixel-canvas",
    storageBucket: "pixel-canvas.appspot.com",
    messagingSenderId: "66615160210",
	appId: "1:66615160210:web:d30f0b589f68f89d4de54b"
});
let database = firebase.database();
let ref = database.ref("Canvas");
ref.once('value', get_from_database, get_error);

function get_error(err){
	console.log(err);
}
function get_from_database(data){
	let data_value = data.val();
	let canvas = Object.keys(data_value);
	grid = data_value[canvas[0]];
	//console.log(grid);
}
function save_to_database() {
	let data = { grid }
	ref.set(data);
	//console.log(data);
}

//SERVER
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log("We have a new client: " + socket.id);
	socket.emit('init', grid);

    socket.on('paint', function(data) {
		//console.log("Received:'paint' pos:" + data.x + " " + data.y+ " rgb:" + data.r+ " " + data.g+ " " + data.b);
		grid[data.y][data.x] = [data.r, data.g, data.b];
        //socket.broadcast.emit('update', data);
		io.sockets.emit('update', data);
		save_to_database()
      }
	);
	
	socket.on('clear', function(data) {
        for(let y=0; y<width; y++){
			for(let x=0; x<height; x++){
				grid[y][x] = [data.r, data.g, data.b];
			}
		}
		io.sockets.emit('init', grid);
		save_to_database()
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);