const puppeteer = require('puppeteer');
const { ZIPCODE: ZIPCODE_DEFAULT, SELECTORS } = require('../constants');
const { createHtml, readWishlist } = require('../htmlProcessor');
const { sendMail } = require('./mailSender');

async function fillZipCodeInfo(page, zipcode) {
    const zipcodeOrDefault = zipcode || ZIPCODE_DEFAULT; 

    await page.waitForSelector(SELECTORS.buttonOpenZipCodeModal); 
    await page.click(SELECTORS.buttonOpenZipCodeModal)
    await page.waitForSelector(SELECTORS.zipCodeModal, { visible: true });
    await page.focus(SELECTORS.inputZipCode0);
    await page.type(SELECTORS.inputZipCode0, zipcodeOrDefault[0]);
    await page.focus(SELECTORS.inputZipCode1);
    await page.type(SELECTORS.inputZipCode1, zipcodeOrDefault[1]);
    await page.click(SELECTORS.buttonZipCodeSubmit);
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

module.exports = {

    async createReport({ url, zipcode, sendTo }) {
        console.log('1... creating browser')
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        console.log('browser created')

        console.log('2... navigation to url %s', url);
        await page.goto(url);
        console.log('finished navigation');

        console.log('3... filling zipcode on page')
        await fillZipCodeInfo(page, zipcode);
        console.log('finished filling zipcode')
        
        console.log('4... reloading page');
        await page.reload({ waitUntil: 'networkidle0' });
        console.log('page reloaded');

        console.log('5... scrolling page to the end of page');
        const { listName, html } = await getProductsScrollingToTheEndOfPage(page);
        console.log('scroll finished');
        //const htmlText = await page.evaluate(() => document.querySelector('#g-items').innerHTML);
        
        console.log('6... reading wishlist to get items');
        const items = readWishlist(html);
        console.log('finished reading');

        console.log('7... creating html report to send email');
        const messageHtml = createHtml(listName, items);
        console.log('html report created');

        console.log('8... sending email');
        const sendMailResponse = sendMail({
            to: sendTo,
            subject: `wishlist sale: ${listName}`, 
            html: messageHtml
        });
        console.log('email sent with id %s', (await sendMailResponse).messageId);

        console.log('9... closing browser');
        await browser.close();
        console.log('browser closed');
    },

};