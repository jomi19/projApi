process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
var io = require('socket.io-client');


chai.should();

chai.use(chaiHttp);

describe('Socket Server', () => {
    var client = io("http://localhost:1338/");

    describe("Chat server", () => {
        it("Sending message", (done) => {
            client.emit("message", {
                message: "Hej där!"
            });
            client.on("message", function(data) {
                data.should.be.an("object");
                data.message.should.equal("Hej där!");
                done();
            });
        });
    });

    describe('Stock Server', () => {
        it('Reciving stock data', (done) => {
            console.log("test");
            client.on("stocks", function() {
                client.close();
                done();
            });
        });
    });
});

describe("Paths", () => {
    describe('GET /', () => {
        it('Checking "/" path', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.msg.should.equal("Api for trading platform by Joakim Mikaelsson");
                    console.log(res.body);

                    done();
                });
        });
    });

    describe("Cheking path that dont exists", () => {
        it("Going to non existant path", (done) => {
            chai.request(server)
                .get("/thisdonotexists")
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });
});
