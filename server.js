const express = require('express')
const app = express();
const dotenv = require('dotenv')
dotenv.config();
const getHHNews = require('./getHHNews.js')
const getHHVideos = require('./getHHVideos.js')
// const socketIO = require('socket.io')
const http = require('http')

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/feeds/:name', (req, res) => {
  res.sendFile(__dirname + `/feeds/${req.params.name}.xml`);
});

app.get('/debug/:name', (req, res) => {
  res.sendFile(__dirname + `/debug/${req.params.name}.html`);
});

const server = app.listen(PORT, () => {
  console.log(`Server is listening`);
  setInterval(async () => {
    await getHHNews();
    await getHHVideos();
    http.get('http://my-rss-feeds.herokuapp.com');
  // }, 30000);
  }, 10000);
});

// const io = socketIO(server);

// setInterval(() => io.emit('update', new Date().toTimeString()), 10000);