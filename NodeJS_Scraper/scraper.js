const axios = require('axios');
const cheerio = require('cheerio');

axios
    .get('https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG')
    .then((response) => {
        console.log(response.data);
        const $ = cheerio.load(response.data);
        const title = $('h1').text();
        console.log(`Product Name: ${title}`);
    })
    .catch((error) => {
        console.error('Error fetching content:', error);
    });