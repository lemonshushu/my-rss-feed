const fetch = require('node-fetch');
const {buildHeader, finishBuilding} = require('./functions.js')
const DOMParser = require('dom-parser');

function buildItem(previewResponse, content, url, channel) {
  const item = channel.ele('item');
  item.ele('author', null, previewResponse.officeName);
  item.ele('title', null, previewResponse.title)
  item.ele('link', null, url)
  item.ele('guid', null, url)
  item.ele('description', null, previewResponse.subContent);
  item.ele('pubDate', null, previewResponse.datetime);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(content);
}

async function buildContent(url) {
  let content = '';
  const articlePage = await fetch(url);
  if (articlePage.ok) {
    const textResponse = await articlePage.text();
    const doc = new DOMParser().parseFromString(textResponse, 'text/html');
    let contentDOM = doc.getElementById('newsEndContents');
    content = contentDOM.innerHTML;
  }
  return content;
}

async function getHHNews() {
  try {
    const response = await fetch('https://sports.news.naver.com/kbaseball/news/list?isphoto=N&type=team&team=HH');
    if (response.ok) {
      headerInfo = {
        title: '네이버 스포츠-야구-한화',
        link: 'https://sports.news.naver.com/kbaseball/news/index?isphoto=N&type=team&team=HH',
        language: 'ko'
      }
      const {rss, channel} = buildHeader(headerInfo)

      const jsonResponse = await response.json();
      for (let i = 0 ; i < jsonResponse.list.length; i++) {
        const article = jsonResponse.list[i]
        const url = `https://sports.news.naver.com/news.nhn?oid=${article.oid}&aid=${article.aid}`
        const content = await buildContent(url);
        buildItem(article, content, url, channel);
        finishBuilding(rss, 'HH-news');
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = getHHNews