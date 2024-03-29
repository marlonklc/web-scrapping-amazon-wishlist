const express = require('express');
const WishlistController = require('./controllers/WishlistController');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    return res.json({ status: 'UP' });
});

app.post('/wishlist-report', WishlistController.createReport);
app.post('/wishlist-report/export', WishlistController.exportReport);

app.listen(PORT, () => {
    console.log('server up...')
});

module.exports = app;