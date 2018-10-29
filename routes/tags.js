'use strict';

const express = require('express');
const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tag')
const router = express.Router();
const mongoose = require('mongoose');


router.get('/',(req,res,next) => {
    Tag.find().sort({name: 'desc'})
    .then((results) => {
        res.json(results);
    })
    .catch(err => {
        return next(err);
    })
});

router.get('/:id', (req,res,next) => {
    const noteId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).send('400 ID is not valid :(')
    }
    Tag.findById(noteId)
    .then((result) => {
        res.json(result);
    })
    .catch(err => {
        return next(err);
    })
});

router.put('/:id', (req,res,next) => {
    const noteId = req.params.id;
    const newNoteName = req.body.name;
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).send('400 ID is not valid :(')
}
if(!newNoteName) {
    res.status(400).send('What do you call a tag with no name? :[]')
}
Tag.findByIdAndUpdate(noteId, newNoteName, {new: true})
.then(result => {
    res.json(results);
})
.catch (err=> {
    if(err.code === 11000) {
        res.status(11000).send('A tag with this name already exists.. mysterious');
    }
    return next(err);
})
})

router.post('/',(req,res,next) => {
    const tagName = req.body.name;
    if (!tagName) {
        res.status(400).send('TAG NAME not valid')
    }
    const newTag = { tagName };
    Folder.create(tagFolder)
        .then(result => {
            res.location(`${req.originalURL}/${result.id}`)
                .status(201)
                .json(result);
        })
        .catch(err => {
            if (err.code === 11000) {
                res.status(400).send('The TAG NAME already exists! You must choose which Folder is the true folder and which is the evil twin.');
            }
            next(err);
        });
})

router.delete('/:id', (req, res, next) => {
    const noteId = req.params.id;
  
    Tag.findByIdAndRemove(noteId)
      .then((result) => {
        Note.update( {$pull : { }} ); //Check with TA what to put here!
        res.status(204).end();
      })
      .catch(err => {
        return next(err);
      });
  });
  
  module.exports = router;