const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'https://melbourne.craigslist.org/d/jobs/search/jjj';
const scrapResults = [];

async function scrapeHeader() {
  try {
    const htmlResults = await request.get(url);
    // Using cheerio to select default elements
    const $ = await cheerio.load(htmlResults);
    $('.result-info').each((index, element) => {
      const resultTitle = $(element).children('.result-title');
      const title = resultTitle.text();
      const url = resultTitle.attr('href');
      // new Date () - to make a javascript object
      const datePosted = new Date(
        $(element)
          .children('time')
          .attr('datetime')
      );
      const hood = $(element)
        .find('.result-hood')
        .text();
      const scrapResult = { title, url, datePosted, hood };
      scrapResults.push(scrapResult);
    });
    return scrapResults;
    //console.log(scrapResults);
  } catch (err) {
    console.log(err);
  }
}

// Sub list
async function scrapeDescription(jobsWithHeaders) {
  return await Promise.all(
    jobsWithHeaders.map(async job => {
      try {
        const htmlResult = await request.get(job.url);
        const $ = await cheerio.load(htmlResult);
        $('.print-information print-qrcode-container').remove();
        // add to job
        job.description = $('#postingbody').text();
        job.address = $('div.mapAndAttrs').text();
        const compensationText = $('.attrgroup')
          .children()
          .first()
          .text();
        job.description = compensationText.replace('compensation: ', '');
        return job;
        
      } catch (error) {
        console.log(error);
      }
    })
  );
}

async function scrapeCraigsList() {
  const jobsWithHeaders = await scrapeHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  console.log(jobsFullData);
}

scrapeCraigsList();
