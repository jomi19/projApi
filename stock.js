var stock = {
    randomAroundZero: function() {
        return Math.random() > 0.5 ? 1 : -1;
    },

    getStockPrice: function(input, price) {
        let rate = input.rate;
        let variance = input.variance;

        return price * rate + variance * stock.randomAroundZero();
    },
};

module.exports = stock;
