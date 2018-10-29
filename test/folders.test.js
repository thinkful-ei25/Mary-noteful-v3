//run MongoD & node folders.test.js to run these tests
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const { folders } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);
describe('Testing Noteful - Folders', function () {
    before(function () {
        console.log(TEST_MONGODB_URI);
        return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true });
    });
    //seeds dummy database, drops the dummy db and disconnects
    beforeEach(function () {
        return Folder.insertMany(folders)
            .then(() => Folder.createIndexes());
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('Sanity Check', () => {
        it('does 4=4? bend the spoon', () => {
            expect('4' == 4).to.be.true;
            expect('4' === 4).to.be.false;
        });
    });

    describe('Note to Developer: Performing GET with api/folders', function () {
        it('Should return the correct number of FOLDERS being seeded', function () {
            const dummyDbPromise = Folder.find();
            const chaiApiPromise = chai.request(app).get('/api/folders');
            return Promise.all([dummyDbPromise, chaiApiPromise])
                .then(([dummyData, chaiReqRes]) => {
                    expect(chaiReqRes).to.be.json;
                    expect(chaiReqRes).to.have.status(200);
                    expect(chaiReqRes).to.have.a.length(dummyData.length);
                })
        });//it end

        it('Folders should have all the correct bits & pieces', function () {
            const dummyDbPromise = Folder.find().sort('name');
            const chaiApiPromise = chai.request(app).get('/api/folders');
            return Promise.all([dummyDbPromise, chaiApiPromise])
                .then(([dummyData, chaiReqRes]) => {
                    expect(chaiReqRes).to.be.a('array');
                    expect(chaiReqRes).to.have.status(200);
                    res.body.forEach((eachFolder) => {
                        expect(eachFolder).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
                        expect(eachFolder).to.be.a('object');
                        res.body.forEach((eachFolder, i) => {
                            expect(eachFolder.id).to.equal(dummyData[i].id);
                            expect(eachFolder.name).to.equal(dummyData[i].name);
                        })
                    })
                });
        })//it end;


    })//describe GET all end
    describe('Note to Developer: Performing GET with /api/folders/:id', function () {
        it('Should return the corresponding Folder with the ID in the Chai req.params', function () {

            let data;
            return Folder.findOne()
                .then(_data => {
                    data = _data;
                    return chai.request(app).get(`api/folders/${data.id}`);
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.name).to.equal(data.name);
                })
        })//it end
    })//describe GET :id end
});