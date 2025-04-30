const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs'); // Import the File System module
const path = require('path');

// Function to extract product links from a page
async function getProductLinks(driver, url) {
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('div.css-1nntebs')), 200000);  // Adjust this CSS selector as needed
    
    const productLinks = [];
    try {
        // Find all div elements with the class 'css-yyn1h'
        //await delay(10000);
        const productContainers = await driver.findElements(By.css('div.css-yyn1h'));
        //console.log(productContainers);
        console.log(`Found ${productContainers.length} product containers on the page.`);  // Log the number of product containers
        
        for (let container of productContainers) {
            try {
                const linkElement = await container.findElement(By.css('a.chakra-linkbox__overlay'));
                const productLink = await linkElement.getAttribute('href');
                // console.log(linkElement);
                // console.log(productLink);
                //console.log(await driver.getPageSource())
                if (productLink && productLink.includes('/p/')) {
                    productLinks.push(productLink);
                }
            } catch (error) {
                console.error('Error finding link in a container:', error);
            }
        }

        // Log the collected product links for verification
        console.log('Collected Product Links:', productLinks);
    }  catch (error) {
        console.error('Error extracting product links:', error);
    }
    return productLinks;
}

// Function to save the product links into a JSON file
function saveLinksToFile(links) {
    const linkpath = './LINKS/product_links_101_209.json';
    const filePath = path.join(__dirname, linkpath); //<<<<<This need to change 
    fs.writeFile(filePath, JSON.stringify(links, null, 2), (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Product links saved to', linkpath);
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
        // const startUrl = 'https://www.nofrills.ca/en/food/c/27985?page=6'; // NEED TO CHANGE Starting page URL for product listings
        // const productLinks = await getProductLinks(driver, startUrl);  // Get all product links from the first page

        const baseUrl = 'https://www.nofrills.ca/en/food/c/27985?page=';
        let allProductLinks = [];

        //Loop trough all pages 
        for (let i = 101; i <= 209; i++) {
            const pageUrl = `${baseUrl}${i}`;
            console.log(`Processing page: ${i} - URL: ${pageUrl}`);

            // Get product links from the current page
            const productLinks = await getProductLinks(driver, pageUrl);  // Get all product links from the page
            allProductLinks = allProductLinks.concat(productLinks); //Merge product links
        }
        saveLinksToFile(allProductLinks);  // Save the product links to a JSON file
        console.log('All products links has been saved for page 101-209')
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
