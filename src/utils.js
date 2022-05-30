const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCurrency = (number) => {
    return formatter.format(number);
};

module.exports = {
    formatCurrency
};