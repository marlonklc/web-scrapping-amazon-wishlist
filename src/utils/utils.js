const formatterCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const exp = /^\w{0,3}\W?\s?(\d+)[.,](\d+)?,?(\d+)?$/g
const replacer = (f, group1, group2, group3) => {
    return group3 ? `${group1}${group2}.${group3}` : `${group1}.${group2}`
};

const formatCurrency = (number) => {
    return formatterCurrency.format(number);
};

const convertCurrencyOnFloat = (numberFormatted) => {
    return numberFormatted.replace(exp, replacer);
};

module.exports = {
    formatCurrency,
    convertCurrencyOnFloat
};