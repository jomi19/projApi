process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = "test";


const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');


chai.should();

chai.use(chaiHttp);



describe("User functions", () => {
    const regTests = [
        // Correct register
        {email: "test@mail.se", password: "hejsan", userName: "Testing",
            status: 201, message: "", testCase: "Testing register new user"},
        // Taken email
        {email: "test@mail.se", password: "hejsan", userName: "Diffrent",
            status: 401, message: "Username or email alredy exists",
            testCase: "Testing register user with taken email"},
        // Taken username
        {email: "diffrent@mail.se", password: "hejsan", userName: "Testing",
            status: 401, message: "Username or email alredy exists",
            testCase: "Testing register user with taken username"},
        // Missing email
        {email: "", password: "hejsan", userName: "missingmail",
            status: 401, message: "Email, username or password missing",
            testCase: "Testing register with missing email"},
        // Missing password
        {email: "notsuccesfull@mail.se", password: "", userName: "missingpassword",
            status: 401, message: "Email, username or password missing",
            testCase: "Testing register with missing password"},
        // Missing username
        {email: "notsuccesfull@mail.se", password: "testing", userName: "",
            status: 401, message: "Email, username or password missing",
            testCase: "Testing register with missing password"}
    ];

    regTests.forEach((test) => {
        describe("POST /user/register", () => {
            it(test.testCase, (done) => {
                chai.request(server)
                    .post("/user/register")
                    .send({
                        email: test.email,
                        password: test.password,
                        userName: test.userName
                    })
                    .end((err, res) => {
                        res.should.have.status(test.status);
                        console.log(res.status);
                        done();
                    });
            });
        });
    });

    const logInTests = [
        // Correct login with username
        {loginId: "Testing", password: "hejsan", status: false, message: "User logged in",
            testCase: "Testing to login with correct username and password"},
        // Correct login with email
        {loginId: "test@mail.se", password: "hejsan", status: false, message: "User logged in",
            testCase: "Testing to login with correct email and password"},
        // Missing password
        {loginId: "test@mail.se", password: "", status: 401, message: "Email or password missing",
            testCase: "Testing to login without password"},
        // Missing loginId
        {loginId: "", password: "hejsan", status: 401, message: "Email or password missing",
            testCase: "Testing to login without loginId"},
        // Cant find user
        {loginId: "dontexists", password: "hejsan", status: 401,
            message: "No user with that email or username",
            testCase: "Testing to login with wrong loginId"},
        // Wrong password
        {loginId: "Testing", password: "wrongpass", status: 401, message: "Password is incorrect",
            testCase: "Testing to login with wrong password"},
    ];

    logInTests.forEach((test) => {
        describe("post /user/login", () => {
            it(test.testCase, (done) => {
                chai.request(server)
                    .post("/user/login")
                    .send({
                        loginId: test.loginId,
                        password: test.password
                    })
                    .end((err, res) => {
                        if (!test.status) {
                            res.body.message.should.equal(test.message);
                            res.body.user.token.should.be.a("string");
                        } else {
                            res.should.have.status(test.status);
                        }
                        done();
                    });
            });
        });
    });
});
