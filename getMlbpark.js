const fetch = require('node-fetch');
const {buildHeader, finishBuilding} = require('./functions.js')
const DOMParser = require('dom-parser');
const moment = require('moment');

function buildItem(articleInfo, channel) {
  const item = channel.ele('item');
  item.ele('author', null, articleInfo.author);
  item.ele('title', null, articleInfo.title)
  item.ele('link', null, articleInfo.url)
  item.ele('guid', null, articleInfo.url)
  item.ele('pubDate', null, articleInfo.pubDate);
  const contentEncoded = item.ele('content:encoded');
  contentEncoded.dat(articleInfo.content);
}

async function buildContent(info) {
  const url = info.url;
  try {
    const response = await fetch(url);
    const textResponse = await response.text();
    const dom = new DOMParser().parseFromString(textResponse)
    const viewHead = dom.getElementsByClassName('view_head')[0];
    info.pubDate = moment(viewHead.getElementsByClassName('text3')[0].getElementsByClassName('val')[0].innerHTML, 'YYYY-MM-DD HH:MM', true).toDate().toUTCString();
    info.content = dom.getElementById('contentDetail').innerHTML;
  } catch (error) {
    console.log(error);
  }
}

async function getMlbpark() {
  try {
    const response = await fetch('http://mlbpark.donga.com/mp/b.php?search_select=sct&search_input=&select=spf&m=search&b=kbotown&query=%ED%95%9C%ED%99%94');
    headerInfo = {
      title: 'MLBPARK - 한화',
      link: 'http://mlbpark.donga.com/mp/b.php?search_select=sct&search_input=&select=spf&m=search&b=kbotown&query=%ED%95%9C%ED%99%94',
      language: 'ko'
    }
    const {rss, channel} = buildHeader(headerInfo)
    let textResponse = await response.text();
    const tbody = new DOMParser().parseFromString(textResponse).getElementsByTagName('tbody')[0];

    for (let i = 0 ; i < tbody.childNodes.length ; i++) {
      const tr = tbody.childNodes[i];
      const articleInfo = {
        url: tr.getElementsByClassName('txt')[0].getAttribute('href'),
        title: tr.getElementsByClassName('txt')[0].innerHTML,
        author: tr.getElementsByClassName('nick')[0].innerHTML
      }
      await buildContent(articleInfo);
      buildItem(articleInfo, channel);
    }
    await finishBuilding(rss, 'mlbpark');
  } catch (error) {
    console.log(error)
  }
}

module.exports = getMlbpark