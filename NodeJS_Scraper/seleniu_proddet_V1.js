const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs'); // Import the File System module
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
        
        // Log the successful URL to a file
        logProductUrl(url);

    } catch (error) {
        console.error('Error extracting product details:', error);
    } finally {
        const endTime = Date.now();
        const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
        console.log(`Time taken to fetch data for ${url}: ${elapsedTime.toFixed(2)} seconds`);
    }
}

async function getProductLinks(driver, url) {
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('a.chakra-linkbox__overlay.css-1hnz6hu')), 10000);  // Adjust this CSS selector as needed
    
    const productLinks = [];
    try {
        // Find all product links on the page (adjust the CSS selector based on the website structure)
        const products = await driver.findElements(By.css('a.chakra-linkbox__overlay.css-1hnz6hu'));
        for (let product of products) {
            const productUrl = await product.getAttribute('href');
            if (productUrl) {
                productLinks.push(productUrl);
            }
        }
    } catch (error) {
        console.error('Error extracting product links:', error);
    }
    return productLinks;
}

async function crawlSite(driver, startUrl) {
    let currentPage = startUrl;
    let productLinks = [];
    
    try {
        // Get the product links on the current page
        const pageProductLinks = await getProductLinks(driver, currentPage);
        productLinks = productLinks.concat(pageProductLinks);
        console.log(`Found ${pageProductLinks.length} product links on page: ${currentPage}`);
        
        // Check if there's a next page
        const nextPageButton = await driver.findElements(By.css('a[aria-label="Next Page"]'));  // Adjust for your pagination button's selector
        if (nextPageButton.length > 0) {
            // If a "next" button is found, click it to go to the next page
            const nextPageUrl = await nextPageButton[0].getAttribute('href');
            if (nextPageUrl) {
                await crawlSite(driver, nextPageUrl);  // Recursively crawl the next page
            }
        }
    } catch (error) {
        console.error('Error during site crawl:', error);
    }

    // After crawling all pages, process each product
    for (let link of productLinks) {
        await getProductDetails(driver, link);  // Fetch details for each product
    }
}

// Function to log successful product URLs to a file
function logProductUrl(url) {
    const logFilePath = path.join(__dirname, 'fetched_product_links.txt');
    
    // Append the URL to the file with a new line
    fs.appendFile(logFilePath, url + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log(`Logged product URL: ${url}`);
        }
    });
}

async function run() {
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode (no GUI)
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        const startUrl = 'https://www.nofrills.ca/en/food/c/27985'; // Starting page URL for product listings
        await crawlSite(driver, startUrl);  // Start crawling from the product listing page
    } catch (error) {
        console.error('Error running the script:', error);
    } finally {
        await driver.quit();  // Close the browser session
    }
}

run();
