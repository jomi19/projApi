var stock = {
    randomAroundZero: function() {
        return Math.random() > 0.5 ? 1 : -1;
    },

    getStockPrice: function(input, price) {
        let rate = input.rate;
        let variance = input.variance;
        let newPrice = price * rate + variance * stock.randomAroundZero();
        
        if (newPrice  < 5) {
            return 20
        }

        return newPrice
    },
};

module.exports = stock;
