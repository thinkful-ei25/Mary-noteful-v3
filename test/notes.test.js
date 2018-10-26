//Solution branch for reference: https://github.com/thinkful-ei25/noteful-app-v3/blob/solution/2-testing/test/notes.test.js

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/seed/notes');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Testing Noteful API - Notes', function () {
    before(function () { //connects to the test dummyDatabase
        return mongoose.connect(TEST_MONGODB_URI)
            .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () { //seeds the dummyData from notes
        return Note.insertMany(notes); //create many with the Note schema/template
    });

    afterEach(function () { //drops the test dummyDatabase after each test
        return mongoose.connection.db.dropDatabase();
    });

    after(function () { //disconnects after the tests
        return mongoose.disconnect();
    });

    describe('Note to Developer GET /api/notes', function () { //describe is a note for what's happening

        it('should return the correct number of Notes', function () { //states what the test should have happen which is checking API vs dummyDatabase lengths
            return Promise.all([
                Note.find(), //straight to the dummy DB with Mongo
                chai.request(app).get('/api/notes') //code version of Postman (pings the server with requests)
            ])
                .then(([dummyData, chaiReqRes]) => { //here it's stating the two things to check against (dummyDatabase vs. response from API)
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('array');
                    expect(chaiReqRes.body).to.have.length(dummyData.length);
                });
        });

        it('should return a list with the correct right fields', function () {
            return Promise.all([
                Note.find().sort({ updatedAt: 'desc' }),
                chai.request(app).get('/api/notes')
            ])
                .then(([dummyData, chaiReqRes]) => {
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('array');
                    expect(chaiReqRes.body).to.have.length(dummyData.length);
                    chaiReqRes.body.forEach(function (item, i) {
                        expect(item).to.be.a('object');
                        expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
                        expect(item.id).to.equal(dummyData[i].id);
                        expect(item.title).to.equal(dummyData[i].title);
                        expect(item.content).to.equal(dummyData[i].content);
                        expect(new Date(item.createdAt)).to.eql(dummyData[i].createdAt);
                        expect(new Date(item.updatedAt)).to.eql(dummyData[i].updatedAt);
                    });
                });
        });

        it('should return correct search results for a searchTerm query', function () {
            //   const searchTerm = 'gaga';
            const re = new RegExp(searchTerm, 'i');
            const dbPromise = Note.find({
                // title: { $regex: searchTerm, $options: 'i' }
                $or: [{ 'title': re }, { 'content': re }]
            });
            const apiPromise = chai.request(app)
                .get(`/api/notes?searchTerm=${searchTerm}`);

            return Promise.all([dbPromise, apiPromise])
                .then(([dummyData, chaiReqRes]) => {
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('array');
                    expect(chaiReqRes.body).to.have.length(1);
                    chaiReqRes.body.forEach(function (item, i) {
                        expect(item).to.be.a('object');
                        expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
                        expect(item.id).to.equal(dummyData[i].id);
                        expect(item.title).to.equal(dummyData[i].title);
                        expect(item.content).to.equal(dummyData[i].content);
                        expect(new Date(item.createdAt)).to.eql(dummyData[i].createdAt);
                        expect(new Date(item.updatedAt)).to.eql(dummyData[i].updatedAt);
                    });
                });
        });

        it('should return an empty array for an incorrect query', function () {
            //   const searchTerm = 'NotValid';
            const re = new RegExp(searchTerm, 'i');
            const dbPromise = Note.find({
                // title: { $regex: searchTerm, $options: 'i' }
                $or: [{ 'title': re }, { 'content': re }]
            });
            const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);
            return Promise.all([dbPromise, apiPromise])
                .then(([dummyData, chaiReqRes]) => {
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('array');
                    expect(chaiReqRes.body).to.have.length(dummyData.length);
                });
        });
    });
    describe('GET /api/notes/:id', function () {

        it('should return correct notes', function () {
            let dummyData;//declaring it outside of scope
            return Note.findOne()
                .then(_dummyData => {
                    dummyData = _dummyData;//this is to allow it to remain in scope
                    return chai.request(app).get(`/api/notes/${dummyData.id}`);
                })
                .then((chaiReqRes) => {
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.an('object');
                    expect(chaiReqRes.body).to.have.all.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
                    expect(chaiReqRes.body.id).to.equal(dummyData.id);
                    expect(chaiReqRes.body.title).to.equal(dummyData.title);
                    expect(chaiReqRes.body.content).to.equal(dummyData.content);
                    expect(new Date(chaiReqRes.body.createdAt)).to.eql(dummyData.createdAt);
                    expect(new Date(chaiReqRes.body.updatedAt)).to.eql(dummyData.updatedAt);
                });
        });

        it('should respond with status 400 and an error message when `id` is not valid', function () {
            return chai.request(app)
                .get('/api/notes/NOT-A-VALID-ID')
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(400);
                    expect(chaiReqRes.body.message).to.eq('The `id` is not valid');
                });
        });

        it('should respond with a 404 for an id that does not exist', function () {
            // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
            return chai.request(app)
                .get('/api/notes/DOESNOTEXIST')
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(404);
                });
        });

    });
    describe('POST /api/notes', function () {

        it('should create and return a new item when provided valid dummyData', function () {
            const newItem = {
                'title': 'The best article about cats ever!',
                'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
            };
            let chaiReqRes;
            return chai.request(app)
                .post('/api/notes')
                .send(newItem)
                .then(function (_res) {
                    chaiReqRes = _res;
                    expect(chaiReqRes).to.have.status(201);
                    expect(chaiReqRes).to.have.header('location');
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('object');
                    expect(chaiReqRes.body).to.have.all.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
                    return Note.findById(chaiReqRes.body.id);
                })
                .then(dummyData => {
                    expect(chaiReqRes.body.id).to.equal(dummyData.id);
                    expect(chaiReqRes.body.title).to.equal(dummyData.title);
                    expect(chaiReqRes.body.content).to.equal(dummyData.content);
                    expect(new Date(chaiReqRes.body.createdAt)).to.eql(dummyData.createdAt);
                    expect(new Date(chaiReqRes.body.updatedAt)).to.eql(dummyData.updatedAt);
                });
        });

        it('should return an error when missing "title" field', function () {
            const newItem = {
                'content': 'Lorem ipsum dolor sit amet, sed do eiusmod tempor...'
            };
            return chai.request(app)
                .post('/api/notes')
                .send(newItem)
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(400);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('object');
                    expect(chaiReqRes.body.message).to.equal('Missing `TITLE` in request body');
                });
        });

    });
    describe('PUT /api/notes/:id', function () {

        it('should update the note when provided valid dummyData', function () {
            const updateItem = {
                'title': 'What about dogs?!',
                'content': 'woof woof'
            };
            let chaiReqRes, orig;
            return Note.findOne()
                .then(_orig => {
                    orig = _orig;
                    return chai.request(app)
                        .put(`/api/notes/${orig.id}`)
                        .send(updateItem);
                })
                .then(function (_res) {
                    chaiReqRes = _res;
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('object');
                    expect(chaiReqRes.body).to.have.all.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
                    return Note.findById(chaiReqRes.body.id);
                })
                .then(dummyData => {
                    expect(chaiReqRes.body.title).to.equal(dummyData.title);
                    expect(chaiReqRes.body.content).to.equal(dummyData.content);
                    expect(new Date(chaiReqRes.body.createdAt)).to.eql(dummyData.createdAt);
                    expect(new Date(chaiReqRes.body.updatedAt)).to.eql(dummyData.updatedAt);
                    // expect note to have been updated
                    expect(new Date(chaiReqRes.body.updatedAt)).to.greaterThan(orig.updatedAt);
                });
        });

        it('should respond with status 400 and an error message when `id` is not valid', function () {
            const updateItem = {
                'title': 'What about dogs?!',
                'content': 'woof woof'
            };
            return chai.request(app)
                .put('/api/notes/NOT-A-VALID-ID')
                .send(updateItem)
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(400);
                    expect(chaiReqRes.body.message).to.eq('The `id` is not valid');
                });
        });

        it('should respond with a 404 for an id that does not exist', function () {
            // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
            const updateItem = {
                'title': 'What about dogs?!',
                'content': 'woof woof'
            };
            return chai.request(app)
                .put('/api/notes/DOESNOTEXIST')
                .send(updateItem)
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(404);
                });
        });

        it('should return an error when missing "title" field', function () {
            const updateItem = {
                'content': 'woof woof'
            };
            let dummyData;
            return Note.findOne()
                .then(_dummyData => {
                    dummyData = _dummyData;

                    return chai.request(app)
                        .put(`/api/notes/${dummyData.id}`)
                        .send(updateItem);
                })
                .then(chaiReqRes => {
                    expect(chaiReqRes).to.have.status(400);
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes.body).to.be.a('object');
                    expect(chaiReqRes.body.message).to.equal('Missing `title` in request body');
                });
        });

    });

    describe('DELETE /api/notes/:id', function () {

        it('should delete an existing document and respond with 204', function () {
            let dummyData;
            return Note.findOne()
                .then(_dummyData => {
                    dummyData = _dummyData;
                    return chai.request(app).delete(`/api/notes/${dummyData.id}`);
                })
                .then(function (chaiReqRes) {
                    expect(chaiReqRes).to.have.status(204);
                    return Note.countDocuments({ _id: dummyData.id });
                })
                .then(count => {
                    expect(count).to.equal(0);
                });
        });
    });

}//ends the overarching describe test function

);//final close-bracket of the page







