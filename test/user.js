process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = "test";

const chai = require('chai');
const chaiHttp = require('chai-http');
const { before } = require('mocha');
const server = require('../app.js');
const jwt = require("jsonwebtoken");

chai.should();
chai.use(chaiHttp);

describe("User functions", () => {
    
    const getUserTest = [
        // Correct get user
        {email: "joakim@mail.se", password: "hejsan", userName: "Testkonto",
            status: 201, message: "", testCase: "Getting user succesfull"},

        // // Missing email
        {email: "", password: "hejsan", userName: "missingmail",
            status: 401, message: "Email, username or password missing",
            testCase: "Testing register with missing email"},
        //User dont exist
        {email: "whoami@its.me", password: "testas", userName: "missingmail",
            status: 401, message: "Email, username or password missing",
            testCase: "Testing to get account that dont exist"}
        // // Missing password
        // {email: "notsuccesfull@mail.se", password: "", userName: "missingpassword",
        //     status: 401, message: "Email, username or password missing",
        //     testCase: "Testing register with missing password"},
        // // Missing username
        // {email: "notsuccesfull@mail.se", password: "testing", userName: "",
        //     status: 401, message: "Email, username or password missing",
        //     testCase: "Testing register with missing password"}
    ];


    getUserTest.forEach((test) => {
        describe("Get /user/", () => {
            it(test.testCase, (done) => {
                chai.request(server)
                    .get("/user")
                    .send({
                        email: test.email,
                        userName: test.userName
                    })
                    .end((err, res) => {
                        console.log(res.body)
                        res.should.have.status(test.status);
                        done();
                    });
            });
        });
    });

    const insertTests = [
        // Correct insert
        {email: "joakim@mail.se", userName: "Testkonto", amount: 50,
            status: 200, message: "", testCase: "Inserting 50 currency succesfull"},
        // Incorrect insert amount not in int or float format
        {email: "joakim@mail.se", userName: "Testkonto", amount: "femtio",
            status: 400, message: "Amount needs to be an int or float", testCase: "Inserting with a string insted of float or int"},
        // Missing email 
        {email: "", amount: 10, userName: "missingpassword",
            status: 401, message: "Email, username or password missing",
            testCase: "Geting userdata without email"},
        // Wrong email/username combo
        {email: "notsuccesfull@mail.se", amount: 50, userName: "hej",
            status: 401, message: "Email, username or password missing",
            testCase: "User dont exists"}
    ];


    insertTests.forEach((test) => {
        describe("POST user/insert", () => {
            it(test.testCase, (done) => {
                chai.request(server)
                    .post("/user/insert")
                    .send({
                        email: test.email,
                        userName: test.userName,
                        amount: test.amount
                    })
                    .end((err, res) => {
                        if(test.status === 200) {
                            res.body.currency.should.equal(100 + test.amount); 
                        }
                        res.should.have.status(test.status)
                        done();
                    });
            })
        })
    });

    const tradeTests = [
        // Succesfull by
       {email: "joakim@mail.se", userName: "Testkonto", amount: 2, stockPrice: 5, stockName: "Testing stock",
        status: 201 , testCase: "Bying 2 test stocks", message: "", action: "/by" ,},
        // Bying more off same st ock
        {email: "joakim@mail.se", userName: "Testkonto", amount: 2, stockPrice: 5, stockName: "Testing stock",
        status: 201 , testCase: "Bying more of same stock", message: "", action: "/by" ,},
        // Bying for more then you have
        {email: "joakim@mail.se", userName: "Testkonto", amount: 1000, stockPrice: 1000, stockName: "Testing stock",
        status: 401 , testCase: "Bying for more then i have", message: "", action: "/by" ,},
        //Succesfull sell
        {email: "joakim@mail.se", userName: "Testkonto", amount: 2, stockPrice: 5, stockName: "Testing stock",
        status: 201 , testCase: "Selling 2 test stocks", message: "", action: "/sell" ,},
        //Selling more stock then in depot
        {email: "joakim@mail.se", userName: "Testkonto", amount: 100, stockPrice: 1, stockName: "Testing stock",
        status: 401 , testCase: "Selling more stocks then you have", message: "", action: "/sell" ,},
        //Selling a stock that dont exists in depot
        {email: "joakim@mail.se", userName: "Testkonto", amount: 1, stockPrice: 5, stockName: "do not exist",
        status: 401 , testCase: "Selling more stocks then you have", message: "No of that stock in depot", action: "/sell" ,},
        //No email
        {email: "", userName: "Testkonto", amount: 2, stockPrice: 5, stockName: "Testing stock",
        status: 401 , testCase: "Loging in with no email", message: "Unauthorized, no username/email", action: "/by" ,},
        // String insted off int on stockprice or amount (same error)
        {email: "joakim@mail.se", userName: "Testkonto", amount: "två", stockPrice: 5, stockName: "Testing stock",
        status: 400 , testCase: "String insted off int/float", message: "Amount needs to be an int or float", action: "/by" ,} ,
        // String insted off int on stockprice or amount (same error)
        {email: "dontexist@mail.se", userName: "Testkonto", amount: 2, stockPrice: 5, stockName: "Testing stock",
        status: 401 , testCase: "Cant find user", message: "Cant find user", action: "/by" ,} ,
    ]
    

    tradeTests.forEach((test) => {
        describe(`POST trade`, () => {
            it(test.testCase, (done) => {
                chai.request(server)
                .post(`/trade${test.action}`)
                .send({
                    email: test.email,
                    userName: test.userName,
                    amount: test.amount,
                    stockPrice: test.stockPrice,
                    stockName: test.stockName
                })
                .end((err, res) => {
                    if(test.status === 201) {
                        // console.log(res)
                    }
                    res.should.have.status(test.status)
                    done()
                })

            })
        })
    })
});
