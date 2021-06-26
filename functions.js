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

async function finishBuilding(rss, fileName) {
  let xml = rss.end({pretty: true});
  xml = xml.replace('<rss>', '<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">');
  await fs.writeFile(__dirname + `feeds/${fileName}.xml`, xml, err => console.log(err));
  console.log('xml file written')
  
}

module.exports = {buildHeader, finishBuilding};