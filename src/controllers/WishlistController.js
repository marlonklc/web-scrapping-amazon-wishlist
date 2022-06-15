const service = require('../services/WishlistService');

const message = message => {
    return {
        message,
        timestamp: new Date()
    }
}

module.exports = {

    async createReport(req, res) {
        try {
            console.log('[start] POST /wishlist-report >-------------------------------------------')
            const { url, 
                sendTo, 
                zipcode, 
                minPromotionValue = 0.0, 
                minPromotionPercentage = 0 
            } = req.body;

            if (!url) {
                return res.status(400)
                    .json(message('url cannot be empty. ex: https://www.amazon.com.br/hz/wishlist/ls/37PMJQL2BBFJ6'));
            }

            if (!sendTo) {
                return res.status(400)
                    .json(message('sendTo cannot be empty. ex: user@gmail.com'));
            }

            if (!zipcode || zipcode.length != 2) {
                return res.status(400)
                    .json(message('zipcode must have 2 elements. ex: [\'95860\', \'000\']'));
            }

            service.createReport({ url, zipcode, sendTo, minPromotionPercentage, minPromotionValue });

            return res.json(message('Executed with success.'));
        } catch (ex) {
            console.log(ex);
            return res.status(500)
                .json(message('Unexpected error happens: ' + ex));
        }
    }
};