const config = require("./config/config.json");
const express = require("express");
const app = express();
const ioServer = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(ioServer);
const cors = require("cors");
const stock = require("./stock.js");
const port = config.PORT;
const users = require("./routes/users.js");
const dsn = require("./config/database.js");
const trade = require("./routes/trade.js");
const mongo = require("mongodb").MongoClient;
let stocks = stock.stocks;
let stockArray = stocks;
let client, db, stockDb

async function startUp() {
    client = await mongo.connect(dsn, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    db = await client.db();
    stockDb = await db.collection("stocks");
}

startUp();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// io.origins(['https://mejs.joakimm.me:443']);

app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

io.on("connection", function(socket) {
    socket.on("message", function(data) {
        console.log(data)
        io.emit("message", {
            message: data.message
        });
    });
});

// Add a route
app.get("/", (req, res) => {
    const data = {
        msg: "Api for trading platform by Joakim Mikaelsson"
    };

    res.status(200).json(data);
});

app.get("/test", async (req, res) => {
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => user.byStock(res, req)
    

    

    // hejsan = await test.find().toArray()
    // await client.close();

    
    // return res.status(202).json(hejsan)
})


setInterval(async function() {
    stockArray = await stockDb.find({}).toArray()
    stockArray.map((activeStock) => {
        if(!activeStock.price) {
            activeStock.price = stock.getStockPrice(activeStock, activeStock.startingPoint);
        } else {
            activeStock.price = stock.getStockPrice(activeStock, activeStock.price);
        }
        stockDb.updateOne({name: activeStock.name}, {$set: 
            {price: activeStock.price}},)
    });

    io.emit("stocks", stockArray);
}, 5000);


app.use("/user", users);

app.use("/trade", trade)


app.use((req, res, next) => {
    var err = new Error("Not found");

    console.log("hittar inte sidan");
    err.status = 404;
    next(err);
});

// Start up server
const server = ioServer.listen(port, () => {
    console.log(`Listening to ${port}`);
});

module.exports = server;
