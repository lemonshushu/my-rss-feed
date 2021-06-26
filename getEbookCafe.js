const fetch = require('node-fetch');
const {buildHeader, finishBuilding} = require('./functions.js')
const DOMParser = require('dom-parser');
const moment = require('moment');

function buildItem(info, channel) {
  const item = channel.ele('item');
  item.ele('author', null, info.author)
  item.ele('title', null, info.title)
  item.ele('link', null, info.url)
  item.ele('guid', null, info.url)
  item.ele('pubDate', null, info.pubDate);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(info.content);
}

async function getEbookCafe() {
  try {
    const response = await fetch('https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=11509651&search.queryType=lastArticle&search.page=1&search.perPage=50&ad=true&uuid=2ae73d17-72be-4f6b-97b6-cc404b0ec80d');
    headerInfo = {
      title: '디지털감성 e북카페 : 네이버 카페',
      link: 'https://cafe.naver.com/ebook',
      language: 'ko'
    }
    const {rss, channel} = buildHeader(headerInfo)
    let jsonResponse = await response.json();
    const articleList = jsonResponse.message.result.articleList;
    const baseURL = 'https://cafe.naver.com/ebook/';

    for (let i = 0 ; i < articleList.length ; i++) {
      const article = articleList[i];
      const articleInfo = {
        url: baseURL + article.articleId,
        title: article.subject,
        pubDate: new Date(Number(article.writeDateTimestamp)).toUTCString,
        content: `<img src="${article.representImage}"/>`,
        author: `${article.writerNickName}(${article.writerId})`,
        category: article.menuName,
      }
      if (articleInfo.category in ['팝니다(리더기)', '가입인사']) continue;
      buildItem(articleInfo, channel);
    }
    await finishBuilding(rss, 'ebook-cafe');
  } catch (error) {
    console.log(error)
  }
} 

module.exports = getEbookCafe