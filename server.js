const express = require('express');
const app = express();
const fetch = require('node-fetch');
const builder = require('xmlbuilder');
const fs = require('fs');
require('dotenv').config();

// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

function writeFile(xml) {
  fs.writeFile('feeds/first-item.xml', xml, {flag: 'w+'}, err => {
    if (err) {
      console.error(err);
      return;
    }
  })
}

function buildXML(jsonResponse) {
  const firstItem = jsonResponse.list[0];
  const root = builder.create('root');
  const channel = root.ele('rss', {'version': '2.0'})
    .ele('channel');
  channel.ele('title', null, 'my-rss-feed')
  channel.ele('link', null, `https://sports.news.naver.com`)
  channel.ele('description', null, 'my-rss-feed')
  channel.ele('lastBuildDate', null, Date.now())
  channel.ele('language', null, 'ko-kr')
  const item = channel.ele('item');
  item.ele('title', null, firstItem.title)
  item.ele('link', null, `https://sports.news.naver.com/news.nhn?oid=${firstItem.oid}&aid=${firstItem.aid}`)
  item.ele('guid', null, firstItem.oid)
  item.ele('pubDate', null, firstItem.datetime)
  item.ele('description', null, '')
  const xml = root.end({pretty: true});

  console.log(xml);
  writeFile(xml);
}

async function getData() {
  try {
    const response = await fetch('https://sports.news.naver.com/kbaseball/news/list?isphoto=N&type=team&team=HH');
    if (response.ok) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);
      buildXML(jsonResponse);
    }
  } catch (error) {
    console.log(error);
  }
}

// io.on('connection', () => {
//   console.log('sdfsfd');
//   setInterval(getData, 10000);
// });
// server.listen(process.env.PORT || 3000);

app.listen(process.env.PORT|| 3000, () => {
  console.log(`Server is listening`);
  setInterval(getData, 60000);
});