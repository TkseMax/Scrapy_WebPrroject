const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs'); // Import the File System module
const path = require('path');

// Function to extract product links from a page
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
                productLinks.push(productUrl);  // Add full URL
            }
        }
    } catch (error) {
        console.error('Error extracting product links:', error);
    }
    return productLinks;
}

// Function to save the product links into a JSON file
function saveLinksToFile(links) {
    const filePath = path.join(__dirname, './LINKS/product_links.json');
    fs.writeFile(filePath, JSON.stringify(links, null, 2), (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Product links saved to product_links.json');
        }
    });
}

// Function to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Run in headless mode (no GUI)
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        const startUrl = 'https://www.nofrills.ca/en/food/c/27985'; // Starting page URL for product listings
        const productLinks = await getProductLinks(driver, startUrl);  // Get all product links from the first page
        saveLinksToFile(productLinks);  // Save the product links to a JSON file
    } catch (error) {
        console.error('Error running the script:', error);
    } finally {

        // Wait for 10 seconds before closing the browser
        console.log("Waiting for 10 seconds before closing the browser...");
        await delay(10000); // 10,000 ms = 10 seconds
        await driver.quit();  // Close the browser session
    }
}

run();
