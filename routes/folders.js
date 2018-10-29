'use strict';

const express = require('express');
const Folder = require('../models/folder');
const Note = require('../models/note');
const router = express.Router();
const mongoose = require('mongoose');

///////////GET ALL FOLDERS!
router.get('/', (req, res, next) => {
    Note.find({})
        .sort({ name: 'asc' }) //short for ascending order
        .then(results => {
            res.json(results)
        })
        .catch(err => {
            next(err);
        });
});
//////////GET FOLDER BY ID!
router.get('/:id', (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).send('400 ID is not valid :(')
    }
    else {
        res.status(200).end();
    }
    Folder.findById(req.params.id)
        .then(results => {
            if (result) {
                res.json(results);
            }
            else {
                res.status(404).send('404 ID not found :(')
            }//the assignment asked specifically for a 404 error here, but seems strange since
            //the server 404 handler should grab this?
        })
        .catch(err => {
            next(err);
        })
})
/////////POST A NEW FOLDER!
router.post('/', (req, res, next) => {
    const folderName = req.body.name;
    if (!folderName) {
        res.status(400).send('FOLDER NAME not valid')
    }
    const newFolder = { folderName };
    Folder.create(newFolder)
        .then(result => {
            res.location(`${req.originalURL}/${result.id}`)
                .status(201)
                .json(result);
        })
        .catch(err => {
            if (err.code === 11000) {
                res.status(400).send('The FOLDER NAME already exists! You must choose which Folder is the true folder and which is the evil twin.');
            }
            next(err);
        });
});
/////////UPDATE THE FOLDER!
router.put('/:id', (req, res, next) => {
    const { name } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).send('400 Folder ID is not valid :(');
    }
    else {
        res.status(200).end();
    }
    let updateBodyReq = { name };
    Folder.findByIdAndUpdate(req.params.id, updateBodyReq, { new: true })
        .then(result => {
            if (result) {
                res.json(result);
            }
            else {
                next();
            }
        })
        .catch(err => {
            if (err.code === 11000) {
                res.status(400).send('The FOLDER NAME already exists! You must choose which Folder is the true folder and which is the evil twin.');
            }
            next(err);
        })});
    ////////DELETE THE FOLDER!
    router.delete('/:id', (req, res, next) => {
        Folder.findByIdAndDelete(req.params.id)
            .then(() => res.status(204).end())
            .catch(err => next(err));
    });



    module.exports = router;
