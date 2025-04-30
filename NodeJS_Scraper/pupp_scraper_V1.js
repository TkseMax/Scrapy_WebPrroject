const chalk = require('chalk');
const puppeteer = require('puppeteer');

async function getProductDetails() {

    // Record the start time
    const startTime = Date.now();

    const browser = await puppeteer.launch({ headless: true }); // Set headless to false if you want to see the browser action
    const page = await browser.newPage();
    await page.goto('https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG', { waitUntil: 'networkidle0' });

    try {
        // Extract product name
        const title = await page.$eval('h1', el => el.innerText);

        // Extract price, handle cases where price might not be available
        const price = await page.$eval('div.selling-price-list', el => el.innerText).catch(() => 'Price not available');

        // Extract average weight
        const avg_weight = await page.$eval('div.product-avarage-weight', el => el.innerText).catch(() => 'Weight not available');

        // Extract weight price comparison
        const weight_comp = await page.$eval('ul.comparison-price-list', el => el.innerText).catch(() => 'Comparison not available');

        // Extract sale details
        const sale_detail = await page.$eval('div.product-promo__badge-wrapper', el => el.innerText).catch(() => 'No sale details');

        console.log(`Product Name: ${title}`);
        console.log(`Price: ${price}`);
        console.log(`Average Weight: ${avg_weight}`);
        console.log(`Weight Price Comparison: ${weight_comp}`);
        console.log(`Sale Details: ${sale_detail}`);
    } catch (error) {
        console.error('Error extracting product details:', error);
    } finally {
        await browser.close();

         // Calculate and print the elapsed time
         const endTime = Date.now();
         const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
         console.log(`Time taken to fetch data: ${elapsedTime.toFixed(2)} seconds`);
    }
}

getProductDetails();
