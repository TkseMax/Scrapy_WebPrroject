# This package will contain the spiders of your Scrapy project
#
# Please refer to the documentation for information on how to create and manage
# your spiders.


import scrapy
from scrapy_selenium import SeleniumRequest

class MySpider(scrapy.Spider):
    name = "dynamic_spider"
    
    def start_requests(self):
        # Use SeleniumRequest to use the real browser rendering (like Chrome or Firefox)
        yield SeleniumRequest(
            url='https://www.nofrills.ca/en/bananas-bunch/p/20175355001_KG',
            callback=self.parse,
        )
    
    def parse(self, response):
        # You can now scrape the fully rendered page
        title = response.css('h1::text').get()
        print(title)
