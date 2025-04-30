const puppeteer = require('puppeteer');

async function getProductDetails(url) {
    const browser = await puppeteer.launch({
        headless: true,  // Run in headless mode for faster operation
        args: [
            '--disable-software-rasterizer',
            '--disable-gpu',
            '--disable-infobars',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-popup-blocking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--no-experiments',
            '--lang=en-US',
            '--remote-debugging-port=9222',
            '--start-maximized',
            '--window-size=1200,800',
        ]
    });

    const page = await browser.newPage();
    const startTime = Date.now();  // Start time to calculate elapsed time

    // Listen for all network responses
    page.on('response', async (response) => {
        const url = response.url();
        
        // Check if the response is from the product details API (change the URL if necessary)
        if (url.includes('api.pcexpress.ca/pcx-bff/api/v1/products/')) {
            console.log(`API Response URL: ${url}`);
            
            try {
                // Get JSON data from the response
                const jsonData = await response.json();
                
                // Log the raw JSON response to see its structure
                console.log("Raw API Response Data:", JSON.stringify(jsonData, null, 2)); // This will log the JSON in a pretty format

                // You can also inspect specific properties from the JSON response, for example:
                // console.log(jsonData.someProperty);

                // Extract the product price (value and unit together)
                //const name = jsonData.name ? `${jsonData.name} ${jsonData.name}` : 'Title not available';
                const name = jsonData.name ? `${jsonData.name}` : 'Title not available';
                const price = jsonData.offers ? `${jsonData.offers[0].price.value}` : 'Price not available';
                const com_price = jsonData.offers ? `${jsonData.offers[0].comparisonPrices[0].value}` : 'Comparing Price unavailable';
                const com_unit = jsonData.offers ? `${jsonData.offers[0].comparisonPrices[0].unit}` : 'Comparing unit not available';
                // const avgWeight = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';
                // const price = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';
                // const price = jsonData.price ? `${jsonData.price.value} ${jsonData.price.unit}` : 'Price not available';

                // Log the extracted details
                console.log(`Product Name: ${name}`);
                console.log(`Price: ${price}`);
                console.log(`Comparasion Price: ${com_price}`);
                console.log(`Comparasion Unit: ${com_unit}`);
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
        }
    });

    // Navigate to the product page and wait for the necessary API response
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
    } catch (error) {
        console.error('Error navigating to page:', error);
        await browser.close();
    }
}

// URL of the product to fetch details from
const productUrl = 'https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG?source=nspt';

// Call the function with the product URL
getProductDetails(productUrl);
