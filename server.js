const express = require('express')
const app = express();
const dotenv = require('dotenv')
dotenv.config();
const getHHNews = require('./getHHNews.js')
const getHHVideos = require('./getHHVideos.js')
const getEbookCafe = require('./getEbookCafe.js');
const getMlbpark = require('./getMlbpark.js')
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
    await getEbookCafe();
    await getMlbpark();
    http.get('http://my-rss-feeds.herokuapp.com');
  }, 300000);
  // }, 10000);
});
