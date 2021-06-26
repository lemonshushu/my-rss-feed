const fetch = require('node-fetch');
const {buildHeader, finishBuilding} = require('./functions.js')
const DOMParser = require('dom-parser');
const moment = require('moment');

function buildItem(info, channel) {
  const item = channel.ele('item');
  item.ele('title', null, info.title)
  item.ele('link', null, info.url)
  item.ele('guid', null, info.url)
  item.ele('pubDate', null, info.pubDate);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(info.content);
}

async function getHHVideos() {
  try {
    const response = await fetch('https://m.sports.naver.com/video/ajax/videoListByTeam.nhn?_callback=jQuery2140048529195965827165_1624748210767&page=1&pageSize=20&uCategory=kbaseball&category=kbo&date=&teamCode=HH&gameId=&keyword=&sort=date&tab=team&subSection=kbaseball&_=1624748210771');
    headerInfo = {
      title: '경기 영상-한화',
      link: 'https://sports.news.naver.com/kbaseball/vod/index?category=kbo',
      language: 'ko'
    }
    const {rss, channel} = buildHeader(headerInfo)
    let textResponse = await response.text();
    textResponse = textResponse.replace('jQuery2140048529195965827165_1624748210767(', '');
    textResponse = textResponse.replace(');', '');
    const jsonResponse = JSON.parse(textResponse);
    const videoList = jsonResponse.contents.videoList;
    const baseURL = 'https://m.sports.naver.com/video.nhn?id=';

    for (let i = 0 ; i < videoList.length ; i++) {
      const video = videoList[i];
      const videoInfo = {
        url: baseURL + video.videoMasterId,
        title: video.title,
        pubDate: moment(video.updateDateTime, 'YYYY-MM-DD HH:MM:SS.s', true).toDate().toUTCString(),
        content: `<img src="${video.thumbnail}"/>`
      }
      buildItem(videoInfo, channel);
    }
    // await browser.close();
    await finishBuilding(rss, 'HH-videos');
  } catch (error) {
    console.log(error)
  }
} 

module.exports = getHHVideos