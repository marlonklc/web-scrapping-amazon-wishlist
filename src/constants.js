const AMAZON_BASE_URL = 'https://www.amazon.com.br';
const ZIPCODE = ['95860', '000'];

const SELECTORS = {
    buttonOpenZipCodeModal: '#nav-global-location-popover-link',
    zipCodeModal: '#GLUXZipInputSection',
    inputZipCode0: '#GLUXZipUpdateInput_0',
    inputZipCode1: '#GLUXZipUpdateInput_1',
    buttonZipCodeSubmit: '#GLUXZipUpdate-announce',
    wishlistItemDiv: '.g-item-sortable',
    itemPriceDropText: '.itemPriceDrop span:last-child',
    wishlistItemName: (id) => `#itemName_${id}`,
    wishlistItemPriceDrop: (id) => `#itemPriceDrop_${id}`,
};

module.exports = {
    AMAZON_BASE_URL,
    ZIPCODE,
    SELECTORS
};