const fs = require('fs')
const builder = require('xmlbuilder');

function buildHeader(dict) {
  const rss = builder.create('rss');
  const channel = rss.ele('channel');
  channel.ele('title', null, dict.title)
  channel.ele('link', null, dict.link)
  channel.ele('lastBuildDate', null, (new Date).toUTCString())
  channel.ele('language', null, dict.language)
  return {rss, channel};
}

function finishBuilding(rss, fileName) {
  let xml = rss.end({pretty: true});
  xml = xml.replace('<rss>', '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">');
  fs.writeFile(`feeds/${fileName}.xml`, xml, {flag: 'w+'}, err => {
    if (err) {
      console.error(err);
      return;
    }
  })
  console.log('xml file written')
}

module.exports = {buildHeader, finishBuilding};