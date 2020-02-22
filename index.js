const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'https://melbourne.craigslist.org/d/jobs/search/jjj';
async function scrapeCragigsList() {
  try {
    const htmlResults = await request.get(url);
    console.log(htmlResults);
  } catch (err) {
    console.log(err);
  }
}

scrapeCragigsList();
