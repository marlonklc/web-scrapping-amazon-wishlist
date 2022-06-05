const puppeteer = require('puppeteer');
const { ZIPCODE_DEFAULT, SELECTORS, PRICE_DROP_TYPE } = require('../utils/constants');
const { createHtml, readWishlist } = require('../utils/htmlProcessor');
const { sendMail } = require('./MailService');

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
            wishlistName: result.querySelector('#profile-list-name').innerHTML,
            html: result.querySelector('#g-items').innerHTML
        };
    });
}

function filterWishlistByParams({ items, minPromotionPercentage = 0, minPromotionValue = 0.0 }) {
    return items.filter(item => {
        if (item.productPriceDropType === PRICE_DROP_TYPE.currency) {
            return item.productPriceDropValue > minPromotionValue;
        } else {
            return item.productPriceDropValue > minPromotionPercentage;
        }
    });
}

function sortWishlist(items) {
    return items.sort((a, b) => {
        if (a.productPriceDropType === b.productPriceDropType) {
            return b.productPriceDropValue - a.productPriceDropValue;
        } else if (a.productPriceDropType === PRICE_DROP_TYPE.currency && b.productPriceDropType === PRICE_DROP_TYPE.percentage) {
            return 1;
        } else {
            return -1;
        }
    });
}

module.exports = {

    async createReport({ url, zipcode, sendTo, minPromotionPercentage, minPromotionValue }) {
        console.log('creating browser...')
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();

        console.log('navigation to url %s', url);
        await page.goto(url);

        console.log('filling zipcode on page...')
        await fillZipCodeInfo(page, zipcode);
        
        console.log('reloading page...');
        await page.reload({ waitUntil: 'networkidle0' });

        console.log('scrolling page to the end of page...');
        const { wishlistName, html } = await getProductsScrollingToTheEndOfPage(page);
        console.log('scroll finished');
        //const html = await page.evaluate(() => document.querySelector('#g-items').innerHTML);
        
        console.log('reading wishlist to get items...');
        const items = readWishlist(html);

        console.log('filtering and sorting wishlist items...');
        const itemsFiltered = filterWishlistByParams({items, minPromotionPercentage, minPromotionValue});
        sortWishlist(itemsFiltered);

        console.log('creating html report to send email...');
        const messageHtml = createHtml(wishlistName, itemsFiltered);

        console.log('sending email...');
        const sendMailResponse = sendMail({
            to: sendTo,
            subject: `wishlist sale: ${wishlistName}`, 
            html: messageHtml
        });
        console.log('email sent with id %s', (await sendMailResponse).messageId);

        console.log('closing browser...');
        await browser.close();
    },

};
