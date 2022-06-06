const cheerio = require('cheerio');
const { formatCurrency, convertCurrencyOnFloat } = require('./utils');
const { AMAZON_BASE_URL, SELECTORS, PRICE_DROP_TYPE } = require('./constants');

const createHtml = (listName, items) => {
    const $ = cheerio.load('<style> * { font-family: sans-serif; } .content-table { border-collapse: collapse; margin: 25px 0; font-size: 0.9em; min-width: 400px; border-radius: 5px 5px 0 0; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.15); } .content-table thead tr { background-color: #009879; color: #ffffff; text-align: left; font-weight: bold; } .content-table th, .content-table td { padding: 12px 15px; } .content-table tbody tr { border-bottom: 1px solid #dddddd; } .content-table tbody tr:nth-of-type(even) { background-color: #f3f3f3; }</style>');
    $(`<h2>${listName}</h2>`).appendTo('body');
    $('<table class="content-table"></table>').appendTo('body');

    items.forEach(i => {
        $('<tr>').appendTo('table')

        $('table tr:last-child')
            .append(`<td>${i.productName}</td>`)
            .append(`<td>${formatCurrency(i.productPrice)}</td>`)
            .append(`<td><b>${i.productPriceDropText}</b></td>`)
            .append(`<td><i>${i.productPriceOriginalValueText}</i></td>`)
            .append(`<td><a href="${i.productLink}">Link para o produto</a></td>`)
            ;
    });
    
    return $.html();
};

function getPriceDropValue(productPriceDropType, productPriceDropText) {
    if (productPriceDropType === PRICE_DROP_TYPE.currency) {
        const index = productPriceDropText.lastIndexOf('R$');
        const valueOfPromotion = convertCurrencyOnFloat(productPriceDropText.substring(index));
        return valueOfPromotion;
    } else {
        return parseInt(productPriceDropText.slice(-3));
    }
}

const readWishlist = (htmlText) => {
    const $ = cheerio.load(htmlText);

    let items = $(SELECTORS.wishlistItemDiv).map(function () {
        const $element = $(this);
        const itemId = $element.attr()['data-itemid'];
        const productPrice = parseFloat($element.attr()['data-price']);

        const linkElement = $element.find(SELECTORS.wishlistItemName(itemId));
        const productName = linkElement.text().trim();
        const productLink = AMAZON_BASE_URL + linkElement.attr()['href'];

        const priceDropElement = $element.find(SELECTORS.wishlistItemPriceDrop(itemId));
        const productPriceDropText = priceDropElement.text().trim();
        const productPriceDropType = productPriceDropText.includes('R$') ? PRICE_DROP_TYPE.currency : PRICE_DROP_TYPE.percentage;
        const productPriceDropValue = getPriceDropValue(productPriceDropType, productPriceDropText);
        const productPriceOriginalValueText = $element.find(SELECTORS.itemPriceDropText).text().trim();

        if (!productPriceDropText) return;

        return {
            itemId, 
            productPrice, 
            productPriceDropText,
            productPriceDropType,
            productPriceDropValue,
            productPriceOriginalValueText, 
            productName, 
            productLink, 
        }
    }).get();

    return items;
};

module.exports = {
    createHtml,
    readWishlist
};