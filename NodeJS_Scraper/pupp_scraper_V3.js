const puppeteer = require('puppeteer');

async function getProductDetails() {
    const browser = await puppeteer.launch({
        headless: true,  // Run headless for faster operation
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Reduce overhead
    });

    const page = await browser.newPage();

    const startTime = Date.now();  // Start time to calculate the elapsed time

    await page.setRequestInterception(true);


    // page.on('request', (req) => {
    //     const resourceType = req.resourceType();  // Get the resource type using the function
    //     // Block requests for images, stylesheets, and fonts, only allow XHR/fetch requests
    //     if (resourceType === 'image' || resourceType === 'fetch' || resourceType === 'ping'  || resourceType === 'font') {
    //         req.abort();  // Abort image, stylesheet, and font requests
    //     } else {
    //         console.log(`Intercepted Request Type: ${resourceType}`);
    //         req.continue();  // Continue for all other resources
    //     }
    // });


    // List of allowed domains
    const allowedDomains = [
        'https://www.nofrills.ca',
        'https://api.pcexpress.ca',  // Example allowed API domain
        'https://assets.loblaws.ca',       // Add your allowed domains here
        'https://cdn.contentful.com',
    ];

    // Intercept requests and block all requests except those from allowed domains
    page.on('request', (req) => {
        const url = req.url();
        const isAllowed = allowedDomains.some((d) => url.startsWith(d));

        // Block requests that are not from allowed domains
        if (!isAllowed) {
            req.abort();  // Abort the request
        } else {
            req.continue();  // Continue the request
        }
    });

    // Open the product page and wait for the network response containing product data
    await page.goto('https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG');

    // await page.screenshot({path: 'no-images.png', fullPage: true});
    
    // Wait for the specific API response URL to load
    const response = await page.waitForResponse(response => 
        response.url().includes('api.pcexpress.ca/pcx-bff/api/v1/products/') && response.status() === 200
    );

    // Log the network response URL for debugging
    console.log(`Network Response URL: ${response.url()}`);

    // Now calculate the elapsed time based on when we received the response
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`API Response Received`);
    console.log(`Time taken to fetch data: ${elapsedTime.toFixed(2)} seconds`);

    try {
       
        // Extract product details
        const title = await page.$eval('h1', el => el.innerText);
        const price = await page.$eval('div.selling-price-list', el => el.innerText).catch(() => 'Price not available');
        const avg_weight = await page.$eval('div.product-avarage-weight', el => el.innerText).catch(() => 'Weight not available');
        const weight_comp = await page.$eval('ul.comparison-price-list', el => el.innerText).catch(() => 'Comparison not available');
        const sale_detail = await page.$eval('div.product-promo__badge-wrapper', el => el.innerText).catch(() => 'No sale details');

        // Log extracted details
        console.log(`Product Name: ${title}`);
        console.log(`Price: ${price}`);
        console.log(`Average Weight: ${avg_weight}`);
        console.log(`Weight Price Comparison: ${weight_comp}`);
        console.log(`Sale Details: ${sale_detail}`);

        // await page.screenshot({path: 'no-images.png', fullPage: true});

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
