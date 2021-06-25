const fetch = require('node-fetch');
const builder = require('xmlbuilder');
const fs = require('fs')
const DOMParser = require('dom-parser');

function writeFile(xml, fileName) {
  fs.writeFile(`feeds/${fileName}.xml`, xml, {flag: 'w+'}, err => {
    if (err) {
      console.error(err);
      return;
    }
  })
}

function buildItem(previewResponse, content, url, item) {
  item.ele('author', null, previewResponse.officeName);
  item.ele('title', null, previewResponse.title)
  item.ele('link', null, url)
  item.ele('guid', null, url)
  item.ele('description', null, previewResponse.subContent);
  item.ele('pubDate', null, previewResponse.datetime);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(content);
}

async function getHHNews() {
  try {
    const response = await fetch('https://sports.news.naver.com/kbaseball/news/list?isphoto=N&type=team&team=HH');
    if (response.ok) {

      const rss = builder.create('rss', {'xmlns:content': 'http://purl.org/rss/1.0/modules/content/'});
      const channel = rss.ele('channel');
      channel.ele('title', null, '네이버 스포츠-야구-한화')
      channel.ele('link', null, `https://sports.news.naver.com/kbaseball/news/index?isphoto=N&type=team&team=HH`)
      channel.ele('lastBuildDate', null, Date.now())
      channel.ele('language', null, 'ko')

      const jsonResponse = await response.json();
      for (let i = 0 ; i < jsonResponse.list.length; i++) {
        const article = jsonResponse.list[i]
        const url = `https://sports.news.naver.com/news.nhn?oid=${article.oid}&aid=${article.aid}`
        // console.log(url);
        let content = '';
        const articlePage = await fetch(url);
        if (response.ok) {
          const textResponse = await articlePage.text();
          const doc = new DOMParser().parseFromString(textResponse, 'text/html');
          let contentDOM = doc.getElementById('newsEndContents');
          content = contentDOM.innerHTML;
        }
        
        const item = channel.ele('item');
        buildItem(article, content, url, item);
        let xml = rss.end({pretty: true});
        xml = xml.replace('<rss>', '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">');
        writeFile(xml, 'HH-news');
        console.log('xml file written')
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {getHHNews};