const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// Function to read product links from JSON file
function readLinksFromFile() {
    const filePath = path.join(__dirname, 'product_links.json');
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

// Function to read existing product details from file (if exists)
function readExistingData() {
    const filePath = path.join(__dirname, 'product_details.json');
    try {
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            return JSON.parse(rawData);
        }
        return []; // Return empty array if file doesn't exist
    } catch (error) {
        console.error('Error reading existing data:', error);
        return [];
    }
}

// Function to extract product details from a page
async function getProductDetails(driver, url) {
    const startTime = Date.now();

    await driver.get(url);
    await driver.wait(until.elementLocated(By.tagName('h1')), 10000);

    let productData = {};
    try {
        productData.url = url; // Store URL for reference
        productData.title = await driver.findElement(By.tagName('h1')).getText();
        productData.price = await driver.findElement(By.css('div.selling-price-list')).getText().catch(() => 'Price not available');
        productData.mem_price = await driver.findElement(By.css('span.members-only-pricing-price')).getText().catch(() => 'Member Price not available');
        productData.avg_weight = await driver.findElement(By.css('div.product-avarage-weight')).getText().catch(() => 'Weight not available');
        productData.pac_weight = await driver.findElement(By.css('span.product-name__item.product-name__item--package-size')).getText().catch(() => 'Package Avg weight unavailable');
        productData.weight_comp = await driver.findElement(By.css('ul.comparison-price-list')).getText().catch(() => 'Comparison not available');
        productData.sale_detail = await driver.findElement(By.css('div.product-promo__badge-wrapper')).getText().catch(() => 'No sale');
        productData.out_stock = await driver.findElement(By.css('div.out-of-stock.out-of-stock--modal p.out-of-stock__text')).getText().catch(() => 'In stock');
        productData.timestamp = new Date().toISOString(); // Add timestamp of scrape

        console.log(`Product Name: ${productData.title}`);
        console.log(`Price: ${productData.price}`);
        console.log(`Member Price: ${productData.mem_price}`);
        console.log(`Average Weight: ${productData.avg_weight}`);
        console.log(`Package Weight: ${productData.pac_weight}`);
        console.log(`Weight Price Comparison: ${productData.weight_comp}`);
        console.log(`Sale Details: ${productData.sale_detail}`);
        console.log(`Out Of Stock: ${productData.out_stock}`);
        
    } catch (error) {
        console.error('Error extracting product details:', error);
    } finally {
        const endTime = Date.now();
        const elapsedTime = (endTime - startTime) / 1000;
        console.log(`Time taken to fetch data for ${url}: ${elapsedTime.toFixed(2)} seconds`);
    }
    return productData;
}

async function run() {
    const options = new chrome.Options();
    options.addArguments('--headless');
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        const productLinks = readLinksFromFile();
        const existingData = readExistingData();
        const newProductDetails = []; // Array to store new scraped data

        // Loop through each link and get the product details
        for (let url of productLinks) {
            const productData = await getProductDetails(driver, url);
            newProductDetails.push(productData);
        }

        // Combine existing data with new data
        const allProductDetails = [...existingData, ...newProductDetails];

        // Save results to a file
        fs.writeFileSync('product_details.json', JSON.stringify(allProductDetails, null, 2));
        console.log(`Results saved to product_details.json. Total products: ${allProductDetails.length}`);

    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await driver.quit();
    }
}

run();