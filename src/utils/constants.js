const AMAZON_BASE_URL = 'https://www.amazon.com.br';
const ZIPCODE_DEFAULT = ['95860', '000'];
const PRICE_DROP_TYPE = {
    currency: 'CURRENCY',
    percentage: 'PERCENTAGE'
};

const SELECTORS = {
    buttonOpenZipCodeModal: '#nav-global-location-popover-link',
    zipCodeModal: '#GLUXZipInputSection',
    inputZipCode0: '#GLUXZipUpdateInput_0',
    inputZipCode1: '#GLUXZipUpdateInput_1',
    buttonZipCodeSubmit: '#GLUXZipUpdate-announce',
    wishlistItemDiv: '.g-item-sortable',
    itemPriceDropText: '.itemPriceDrop span:last-child',
    itemImage: (id) => `#itemImage_${id} a img`,
    wishlistItemName: (id) => `#itemName_${id}`,
    wishlistItemPriceDrop: (id) => `#itemPriceDrop_${id}`,
};

module.exports = {
    AMAZON_BASE_URL,
    ZIPCODE_DEFAULT,
    SELECTORS,
    PRICE_DROP_TYPE
};