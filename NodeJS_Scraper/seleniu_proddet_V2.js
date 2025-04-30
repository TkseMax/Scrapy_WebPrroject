const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs'); // Import the File System module
const path = require('path');

// Function to read product links from JSON file
function readLinksFromFile() {
    const filePath = path.join(__dirname, 'product_links.json');
    const rawData = fs.readFileSync(filePath);
    const links = JSON.parse(rawData);
    return links;
}

// Function to extract product details from a page
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
        const productLinks = readLinksFromFile();  // Read product links from the file
        
        // Loop through each link and get the product details
        for (let url of productLinks) {
            await getProductDetails(driver, url);  // Extract details for each product
        }
    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await driver.quit();  // Close the browser session
    }
}

run();
