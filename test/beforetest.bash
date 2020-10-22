mongo testtrading --eval 'db.users.insertOne({
    email: "joakim@mail.se",
    userName: "Testkonto",
    password: "$2a$10$Oc89s78QhiXBwW66t6F6jezyGzxcQ8AY9iXpNCZ4A5fEhd.Unmt0.",
    currency: 100
});'