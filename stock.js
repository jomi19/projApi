var stock = {
    randomAroundZero: function() {
        return Math.random() > 0.5 ? 1 : -1;
    },

    getStockPrice: function(input, price) {
        let rate = input.rate;
        let variance = input.variance;

        return price * rate + variance * stock.randomAroundZero();
    },
    stocks: [{
        name: "Markus rör och läckage",
        description: "",
        rate: 1.0005,
        variance: 1,
        startingPoint: 20
    },
    {
        name: "Second stock",
        description: "",
        rate: 1.0002,
        variance: 0.6,
        startingPoint: 50

    },
    {
        name: "Jätte bra aktie",
        description: "",
        rate: 1.0007,
        variance: 1,
        startingPoint: 35
    },
    {
        name: "Jätte bra aktie",
        description: "",
        rate: 1.0003,
        variance: 2,
        startingPoint: 75
    }],


};

module.exports = stock;
