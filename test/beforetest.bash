mongo --eval "use testrading"

mango testtrading --eval 



mongo testtrading --eval 'db.users.insertOne({
    email: "joakim@mail.se",
    userName: "Testkonto",
    password: "$2a$10$Oc89s78QhiXBwW66t6F6jezyGzxcQ8AY9iXpNCZ4A5fEhd.Unmt0.",
    currency: 500
});'

mongo testtrading --eval 'db.stocks.insertOne({
    _id: 1,
    name: "test stock",
    startingPoint: 10,
    currency: 10,
    rate : 1.0005,
    variance : 1.2,
    price: 11
});'

mongo testtrading --eval "db.stocks.find()"