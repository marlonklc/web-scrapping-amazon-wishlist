const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const { ZIPCODE_DEFAULT, SELECTORS, PRICE_DROP_TYPE } = require('../utils/constants');
const { createHtml, readWishlist } = require('../utils/htmlProcessor');
const { sendMail } = require('./MailService');

const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;
const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS !== 'false';
const PUPPETEER_SLOW_MO = Number(process.env.PUPPETEER_SLOW_MO || 0);
const PUPPETEER_TIMEOUT_MS = Number(process.env.PUPPETEER_TIMEOUT_MS || 30000);
const PUPPETEER_DEBUG_DIR = process.env.PUPPETEER_DEBUG_DIR || 'debug-artifacts';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createDebugBaseName(label) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${stamp}-${label}`;
}

async function captureDebugArtifacts(page, label) {
    const baseName = createDebugBaseName(label);
    const outputDir = path.resolve(process.cwd(), PUPPETEER_DEBUG_DIR);
    await fs.mkdir(outputDir, { recursive: true });

    const screenshotPath = path.join(outputDir, `${baseName}.png`);
    const htmlPath = path.join(outputDir, `${baseName}.html`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    const html = await page.content();
    await fs.writeFile(htmlPath, html, 'utf8');

    return { screenshotPath, htmlPath };
}

function getBrowserLaunchOptions() {
    const launchOptions = {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: PUPPETEER_HEADLESS
    };

    if (PUPPETEER_SLOW_MO > 0) {
        launchOptions.slowMo = PUPPETEER_SLOW_MO;
    }

    if (PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = PUPPETEER_EXECUTABLE_PATH;
    }

    return launchOptions;
}

async function fillZipCodeInfo(page, zipcode) {
    const zipcodeOrDefault = zipcode || ZIPCODE_DEFAULT; 

    await page.waitForSelector(SELECTORS.buttonOpenZipCodeModal, { visible: true, timeout: PUPPETEER_TIMEOUT_MS });
    await page.click(SELECTORS.buttonOpenZipCodeModal);

    let modalVisible = true;
    try {
        await page.waitForSelector(SELECTORS.zipCodeModal, { visible: true, timeout: PUPPETEER_TIMEOUT_MS / 2 });
    } catch {
        modalVisible = false;
    }

    if (!modalVisible) {
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.click();
            }
        }, SELECTORS.buttonOpenZipCodeModal);
        await delay(600);
    }

    try {
        await page.waitForSelector(SELECTORS.zipCodeModal, { visible: true, timeout: PUPPETEER_TIMEOUT_MS });
    } catch (err) {
        const artifacts = await captureDebugArtifacts(page, 'zipcode-modal-timeout');
        throw new Error(`Waiting for selector ${SELECTORS.zipCodeModal} failed. Screenshot: ${artifacts.screenshotPath}. HTML: ${artifacts.htmlPath}. Original: ${err.message}`);
    }

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
        if (item.productPriceDropText === '' && isNaN(item.productPriceDropValue)) return true;

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
        const browser = await puppeteer.launch(getBrowserLaunchOptions());
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
        const items = readWishlist({ html, minPromotionPercentage, minPromotionValue });

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
        const mailResult = await sendMailResponse;
        console.log('email sent with id %s', mailResult.id || mailResult.messageId);

        console.log('closing browser...');
        await browser.close();
    },

    async exportReport({ url, zipcode, minPromotionPercentage, minPromotionValue }) {
        console.log('creating browser...')
        const browser = await puppeteer.launch(getBrowserLaunchOptions());
        const page = await browser.newPage();

        console.log('navigation to url %s', url);
        await page.goto(url);

        console.log('filling zipcode on page...')
        await fillZipCodeInfo(page, zipcode);
        
        console.log('reloading page...');
        await page.reload({ waitUntil: 'networkidle0' });

        console.log('scrolling page to the end of page...');
        const { html } = await getProductsScrollingToTheEndOfPage(page);
        console.log('scroll finished');
        
        console.log('reading wishlist to get items...');
        const items = readWishlist({ html, minPromotionPercentage, minPromotionValue });

        console.log('filtering and sorting wishlist items...');
        const itemsFiltered = filterWishlistByParams({items, minPromotionPercentage, minPromotionValue});
        sortWishlist(itemsFiltered);

        console.log('closing browser...');
        await browser.close();

        return itemsFiltered;
    },

};
