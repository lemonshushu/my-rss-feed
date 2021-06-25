const fetch = require('node-fetch');
const builder = require('xmlbuilder');
const fs = require('fs')
const https = require('https');
const DOMParser = require('dom-parser');

function writeFile(xml) {
  fs.writeFile('feeds/first-item.xml', xml, {flag: 'w+'}, err => {
    if (err) {
      console.error(err);
      return;
    }
  })
}

function buildXML(previewResponse, content, url) {
  const root = builder.create('rss', {'xmlns:content': 'http://purl.org/rss/1.0/modules/content/'});
  const channel = root.ele('channel');
  channel.ele('title', null, '네이버 스포츠-야구-한화')
  channel.ele('link', null, `https://sports.news.naver.com/kbaseball/news/index?isphoto=N&type=team&team=HH`)
  channel.ele('lastBuildDate', null, Date.now())
  channel.ele('language', null, 'ko')
  const item = channel.ele('item');
  item.ele('author', null, previewResponse.officeName);
  item.ele('title', null, previewResponse.title)
  item.ele('link', null, url)
  item.ele('guid', null, url)
  item.ele('description', null, previewResponse.subContent);
  item.ele('pubDate', null, previewResponse.datetime);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(content);
  let xml = root.end({pretty: true});
  xml = xml.replace('<rss>', '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">');
  writeFile(xml);
  console.log('xml file written')
}

async function getHHNews() {
  try {
    const response = await fetch('https://sports.news.naver.com/kbaseball/news/list?isphoto=N&type=team&team=HH');
    if (response.ok) {
      const jsonResponse = await response.json();
      const firstItem = jsonResponse.list[0];
      const url = `https://sports.news.naver.com/news.nhn?oid=${firstItem.oid}&aid=${firstItem.aid}`
      let content = '';
      const articlePage = await fetch(url);
      if (response.ok) {
        const textResponse = await articlePage.text();
        const doc = new DOMParser().parseFromString(textResponse, 'text/html');
        content = doc.getElementsByClassName('content')[0].innerHTML;
      }
      buildXML(firstItem, content, url);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {getHHNews};