const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function getProductDetails(url) {
    const browser = await puppeteer.launch({
        headless: true,  // Run in headless mode for faster operation
        // args: [
        //     //'--disable-software-rasterizer',
        //     '--disable-gpu',
        //     '--disable-infobars',
        //     '--disable-dev-shm-usage',
        //     //'--no-sandbox',
        //     '--disable-setuid-sandbox',
        //     '--disable-extensions',
        //     '--disable-plugins',
        //     '--disable-popup-blocking',
        //     '--disable-background-timer-throttling',
        //     //'--disable-backgrounding-occluded-windows',
        //     '--no-experiments',
        //     '--lang=en-US',
        //     // '--remote-debugging-port=9222',
        //     '--start-maximized',
        //     '--window-size=1200,800',
        // ]
    });

    const page = await browser.newPage();
    const startTime = Date.now();  // Start time to calculate elapsed time

    let singlePdata = {};

    // Listen for all network responses
    page.on('response', async (response) => {
        const url = response.url();
        
        // Check if the response is from the product details API (change the URL if necessary)
        if (url.includes('api.pcexpress.ca/pcx-bff/api/v1/products/')) {
            //console.log(`API Response URL: ${url}`);
            
           

            try {
                // Get JSON data from the response
                const jsonData = await response.json();
                
                // Log the raw JSON response to see its structure
                //console.log("Raw API Response Data:", JSON.stringify(jsonData, null, 2)); // This will log the JSON in a pretty format

                // You can also inspect specific properties from the JSON response, for example:
                // console.log(jsonData.someProperty);

                // Extract the product price (value and unit together)
                //const name = jsonData.name ? `${jsonData.name} ${jsonData.name}` : 'Title not available';
                singlePdata.prourl = url; //stores URL for reference
                singlePdata.name = jsonData.name ? `${jsonData.name}` : 'Title not available';
                singlePdata.price = jsonData.offers ? `${jsonData.offers[0].price.value}` : 'Price not available';
                singlePdata.com_price = jsonData.offers ? `${jsonData.offers[0].comparisonPrices[0].value}` : 'Comparing Price unavailable';
                singlePdata.com_quantity = jsonData.offers ? `${jsonData.offers[0].comparisonPrices[0].quantity}` : 'Comparing Quantiy unavailable';
                singlePdata.com_unit = jsonData.offers ? `${jsonData.offers[0].comparisonPrices[0].unit}` : 'Comparing unit not available';
                singlePdata.timestamp = new Date().toISOString(); //Adds timestamp

                //Switch statement to make it standard of 100 gram || 100 ml || 1 EACH
                switch (singlePdata.com_unit) {
                    case "kg":
                        singlePdata.com_quantity *= 10;
                        singlePdata.com_price /= singlePdata.com_quantity;
                        singlePdata.com_quantity = 100;
                        singlePdata.com_unit = "g";
                        break;
                    case "l":
                        singlePdata.com_quantity *= 10;
                        singlePdata.com_price /= singlePdata.com_quantity;
                        singlePdata.com_quantity = 100;
                        singlePdata.com_unit = "ml";
                        break;
                    default:
                        break;
                }
                // const avgWeight = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';
                // const price = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';
                // const price = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';

                // Log the extracted details
                console.log(`Product Name: ${singlePdata.name}`);
                console.log(`Price: ${singlePdata.price}`);
                console.log(`Comparasion Price: ${singlePdata.com_price}`);
                console.log(`Comparasion Quantity: ${singlePdata.com_quantity}`);
                console.log(`Comparasion Unit: ${singlePdata.com_unit}`);
                // console.log(`Average Weight: ${avgWeight || 'Weight not available'}`);
                // console.log(`Weight Price Comparison: ${weightComp || 'Comparison not available'}`);
                // console.log(`Sale Details: ${saleDetail || 'No sale details'}`);
                
                // Calculate and print elapsed time
                const endTime = Date.now();
                const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
                console.log(`Time taken to fetch data: ${elapsedTime.toFixed(2)} seconds`);
                
                // Close the browser after receiving the response
                await browser.close();
            } catch (error) {
                console.error('Error processing API response:', error);
            }
            return singlePdata;
        }
    });

    // Navigate to the product page and wait for the necessary API response
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
    } catch (error) {
        console.error('Error navigating to page:', error);
        await browser.close();
    }
    return singlePdata;
}

// URL of the product to fetch details from
//const productUrl = 'https://www.nofrills.ca/en/garlic-bulbs-3-count/p/21004355001_EA?source=nspt';

// Call the function with the product URL
//getProductDetails(productUrl);


// Function to read product links from JSON file
function readLinksFile() {
    const filePath = path.join(__dirname, 'product_links.json');
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

// Function to read existing product details from file (if exists)
function readExisting() {
    const filePath = path.join(__dirname, 'product_details_pupp.json');
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

// Function to loop trough all links 

async function produrlrun() {
    try {
        const productsLink = readLinksFile();
        const oldData = readExisting();
        const newProductDate = [];

        //looping trough link from readLinksFile() function
        for (let url of productsLink) {
            const productData = await getProductDetails(url);
            console.log(productData);
            newProductDate.push(productData);
        }

        //Combaning all new and old details in readExisting() function
        const combProductDetails = [...oldData, ...newProductDate];
        //console.log(combProductDetails);

        //saving result to a file
        fs.writeFileSync('product_details_pupp.json', JSON.stringify(combProductDetails, null, 2));
        console.log(`Results have been saved to product_details_pupp.json. Total products: ${combProductDetails.length}`);

    } catch (error) {
        console.error('Error Running SOMETHING:', error);
    }
    
}

produrlrun();