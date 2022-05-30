const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.amazon.com.br/hz/wishlist/ls/37PMJQL2BBFJ6');

    await autoScrollToTheEndOfPage(page);

    const fileName = new Date().toISOString().replace(/:/g, '-');
    await page.screenshot({
        path: `example-${fileName}.png`,
        fullPage: true
    });

    await browser.close();
})();

async function autoScrollToTheEndOfPage(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}