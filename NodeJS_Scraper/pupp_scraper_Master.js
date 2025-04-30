const chalk = require('chalk');
const puppeteer = require('puppeteer');

async function getProductDetails() {
    const browser = await puppeteer.launch({ headless: true }); // Set headless to false if you want to see the browser action
    const page = await browser.newPage();
    await page.goto('https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG', { waitUntil: 'networkidle0' });

    // Extract product name
    const title = await page.$eval('h1', el => el.innerText);
    const price = await page.$eval('div.selling-price-list', el => el.innerText);
    const avg_weight = await page.$eval('div.product-avarage-weight', el => el.innerText);
    const weight_comp = await page.$eval('ul.comparison-price-list', el => el.innerText);
    const sale_detail = await page.$eval('div.product-promo__badge-wrapper', el => el.innerText);

    console.log(`Product Name: ${title}`);
    console.log(`Price: ${price}`);
    console.log(`Average Weight: ${avg_weight}`);
    console.log(`Weight Price Comparasion: ${weight_comp}`);
    console.log(`Sale Details: ${sale_detail}`);

    await browser.close();
}

getProductDetails();
