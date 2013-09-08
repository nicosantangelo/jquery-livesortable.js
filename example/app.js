var express = require('express'),
	app		= express(),
	server 	= require('http').createServer(app),
	io		= require('socket.io').listen(server, { log: false });

server.listen(5000);

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendfile('./views/index.html');
});

io.sockets.on('connection', function (socket) {

	socket.on('broadcast_move_started.liveSortable', function (data) {
		socket.broadcast.emit('move_started.liveSortable', data);
	});

	socket.on('broadcast_moving_element.liveSortable', function (data) {
		socket.broadcast.emit('moving_element.liveSortable', data);
	});

	socket.on('broadcast_move_ended.liveSortable', function (data) {
		socket.broadcast.emit('move_ended.liveSortable', data);
	});

});
