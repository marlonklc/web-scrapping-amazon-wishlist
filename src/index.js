const puppeteer = require('puppeteer');
const { ZIPCODE, SELECTORS } = require('./constants');
const { createHtml, readWishlist } = require('./htmlProcessor');
const { sendMail } = require('./mailSender');

async function fillZipCodeInfo(page) {
    await page.waitForSelector(SELECTORS.buttonOpenZipCodeModal); 
    await page.click(SELECTORS.buttonOpenZipCodeModal)
    await page.waitForSelector(SELECTORS.zipCodeModal, { visible: true });
    await page.focus(SELECTORS.inputZipCode0);
    await page.type(SELECTORS.inputZipCode0, ZIPCODE[0]);
    await page.focus(SELECTORS.inputZipCode1);
    await page.type(SELECTORS.inputZipCode1, ZIPCODE[1]);
    await page.click(SELECTORS.buttonZipCodeSubmit);
}

async function start() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.amazon.com.br/hz/wishlist/ls/37PMJQL2BBFJ6');

    await fillZipCodeInfo(page);
    
    await page.reload({ waitUntil: 'networkidle0' });

    const { listName, html } = await getProductsScrollingToTheEndOfPage(page);
    //const htmlText = await page.evaluate(() => document.querySelector('#g-items').innerHTML);
    const items = readWishlist(html);
    const messageHtml = createHtml(listName, items);
    sendMail(listName, messageHtml);

    await browser.close();
}

async function getProductsScrollingToTheEndOfPage(page) {
    return await page.evaluate(async () => {
        const result = await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve(document);
                }
            }, 100);
        });

        return {
            listName: result.querySelector('#profile-list-name').innerHTML,
            html: result.querySelector('#g-items').innerHTML
        };
    });
}

start();