const fetch = require('node-fetch');
const {buildHeader, finishBuilding} = require('./functions.js')
const DOMParser = require('dom-parser');
const moment = require('moment');

function buildItem(info, content, channel) {
  // console.log(pubDate);
  // console.log(Date.now());
  const item = channel.ele('item');
  // item.ele('author', null, info.officeName);
  item.ele('title', null, `[${info.tag}] ${info.title}`)
  item.ele('link', null, info.url)
  item.ele('guid', null, info.url)
  // item.ele('description', null, info.subContent);
  item.ele('pubDate', null, info.pubDate);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(content);
}

async function buildContent(url) {
  let content = '';
  const articlePage = await fetch(url);
  if (articlePage.ok) {
    const textResponse = await articlePage.text();
    const doc = new DOMParser().parseFromString(textResponse, 'text/html');
    let contentDOM = doc.getElementById('player');
    const fileName = new URLSearchParams(url).get('id')
    require('fs').writeFile(`debug/${fileName}.html`, textResponse, {flag: 'w+'}, err => {
      if (err) {
        console.error(err);
        return;
      }
    })
    if (contentDOM == null) {
      console.log('null');
      return '';
    }
    content = contentDOM.innerHTML;
    const chunk = content.match(/thumbnail.*'(.*)'?/gm)[0];
    console.log(chunk + '\n');
    const src = chunk.match(/https:\/\/(.*).(jpg|png|jpeg)/gm)[0];
    return `<img src="${src}">`;
  }
  // await page.goto(url, {waitUntil: 'networkidle0'});
  // const html = await page.content();
  // const doc = new DOMParser().parseFromString(html, 'text/html');
  // let videoNode = doc.getElementsByClassName('rmcplayer')[0].outerHTML;
  // return videoNode;
}

async function getHHVideos() {
  const response = await fetch('https://sports.news.naver.com/kbaseball/vod/ajax/videoContents?uCategory=&category=kbo&tab=team&listType=team&date=&gameId=&teamCode=HH&commentId=&disciplineCode=&round=0');
  headerInfo = {
    title: '경기 영상-한화',
    link: 'https://sports.news.naver.com/kbaseball/vod/index?category=kbo',
    language: 'ko'
  }
  const {rss, channel} = buildHeader(headerInfo)
  const htmlResponse = await response.text();
  const doc = new DOMParser().parseFromString(htmlResponse, 'text/html'); 
  const baseURL = 'https://sports.news.naver.com';
  const videoList = doc.getElementsByClassName('video_list')[0].getElementsByTagName('ul')[0].childNodes;
  // const browser = await puppeteer.launch({headless: true});
  // const page = await browser.newPage();
  for (let i = 0 ; i < videoList.length ; i++) {
    const node = videoList[i];
    if (node.nodeType === 3) continue;
    const video = node.getElementsByClassName('videoImageLink')[0];
    const textNode = video.getElementsByClassName('text')[0];
    const dateNode = textNode.getElementsByClassName('info')[0].getElementsByClassName('date')[0];
    const videoInfo = {
      url: baseURL + video.getAttribute('href'),
      tag: textNode.getElementsByClassName('tag')[0].innerHTML,
      title: textNode.getElementsByClassName('title')[0].innerHTML,
      pubDate: moment(dateNode.lastChild.outerHTML, 'YYYY.MM.DD', true).toDate().toUTCString()
    }
    // console.log(videoInfo);
    const content = await buildContent(videoInfo.url);
    buildItem(videoInfo, content, channel);
  }
  // await browser.close();
  finishBuilding(rss, 'HH-videos');
}

module.exports = getHHVideos