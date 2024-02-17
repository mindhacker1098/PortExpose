const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
require('events').EventEmitter.prototype._maxListeners = 100;


let clientSocket;

io.on('connection', (socket) => {
  console.log('A client connected');
  clientSocket = socket;
});

app.all('*', (req, res) => {
  const data = {
    pathname: req.path,
    method: req.method,
    headers: req.headers,
    body: req.body
  };

  if (clientSocket) {
    clientSocket.emit('page-request', data);
    clientSocket.once('page-response', (data) => {
      res.set(data.headers);
      res.status(data.statusCode).send(data.body);
    });
  } else {
    res.status(500).send('No client connected');
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
