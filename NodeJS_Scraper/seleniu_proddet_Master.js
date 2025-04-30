const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

async function getProductDetails(driver, url) {
    const startTime = Date.now();

    await driver.get(url);
    await driver.wait(until.elementLocated(By.tagName('h1')), 10000); // Wait for the product title to load

    try {
        // Extract product name
        const title = await driver.findElement(By.tagName('h1')).getText();

        // Extract price
        const price = await driver.findElement(By.css('div.selling-price-list')).getText().catch(() => 'Price not available');

        // Extract average weight
        const avg_weight = await driver.findElement(By.css('div.product-avarage-weight')).getText().catch(() => 'Weight not available');

        // Extract weight price comparison
        const weight_comp = await driver.findElement(By.css('ul.comparison-price-list')).getText().catch(() => 'Comparison not available');

        // Extract sale details
        const sale_detail = await driver.findElement(By.css('div.product-promo__badge-wrapper')).getText().catch(() => 'No sale details');

        // Extract if it is OUT OF STOCK
        const out_stock = await driver.findElement(By.css('div.out-of-stock.out-of-stock--modal p.out-of-stock__text')).getText().catch(() => 'It is in stock');


        console.log(`Product Name: ${title}`);
        console.log(`Price: ${price}`);
        console.log(`Average Weight: ${avg_weight}`);
        console.log(`Weight Price Comparison: ${weight_comp}`);
        console.log(`Sale Details: ${sale_detail}`);
        console.log(`Out Of Stock: ${out_stock}`);
    } catch (error) {
        console.error('Error extracting product details:', error);
    } finally {
        const endTime = Date.now();
        const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
        console.log(`Time taken to fetch data for ${url}: ${elapsedTime.toFixed(2)} seconds`);
    }
}

async function run() {
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode (no GUI)
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        const url = 'https://www.nofrills.ca/en/mango/p/20059635001_EA';  // Replace with a valid product URL
        await getProductDetails(driver, url); // Pass driver and URL to getProductDetails
    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await driver.quit();  // Close the browser session
    }
}

run();
