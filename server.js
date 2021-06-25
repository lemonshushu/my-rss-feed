const express = require('express')
const app = express();
const dotenv = require('dotenv')
dotenv.config();
const {getHHNews} = require('./functions.js')
// const socketIO = require('socket.io')
const http = require('http')

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello!');
});

const server = app.listen(PORT, () => {
  console.log(`Server is listening`);
  setInterval(async () => {
    getHHNews();
    http.get('http://my-rss-feeds.herokuapp.com');
  }, 300000);
});

// const io = socketIO(server);

// setInterval(() => io.emit('update', new Date().toTimeString()), 10000);