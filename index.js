//const request = require('request-promise');
const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
const request = require('requestretry').defaults({ fullResponse: false });

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
      const datePosted = $(element)
        .children('time')
        .attr('datetime');

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

// Save data to CSV
async function createCsvfile(data) {
  let csv = new ObjectsToCsv(data);
  // Save to file
  await csv.toDisk('./ScrapedResults.csv');
  // Return the CSV file as string
  // console.log(await csv.toString);
}

async function scrapeCraigsList() {
  const jobsWithHeaders = await scrapeHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  // console.log(jobsFullData);
  await createCsvfile(jobsFullData);
}

scrapeCraigsList();
