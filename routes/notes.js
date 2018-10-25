'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();
const mongoose = require('mongoose');
////* Get All or Complete Search*/
router.get('/', (req, res, next) => {

  const searchTerm = req.query.searchTerm;

  let titleOrContent = {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } }, //if searchTerm is Null it will look only for title
      { content: { $regex: searchTerm, $options: 'i' } }//and therefore pull "all"
    ]
  }
  Note.find(titleOrContent)
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      next(err);
    });
});
////* This finds a particular ID and returns the object associated with*/
router.get('/:id', (req, res) => {
  noteId = req.params.id;
  //creating a 400 error incase id is not valid!
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    const err = new Error('The `id` is NOT valid');
    err.status = 400;
    return next(err);
  }
  Note.findById(noteId)
    .then(results => {
      if (result) {
        res.json(results);
      }
      else {
        next();
      }
    })
    .catch(err => {
      next(err);
    })
});
////* This is for committing a post/create to the database */
router.post('/', (req, res) => {
  const { title, content } = req.body; //destructuring req.body.title & req.body.content
  /* If there is no title --throw a 400 error */
  if (!title) {
    const err = new Error('MISSING `title` in request body');
    err.status = 400;
    return next(err);
  }
  newNote = { title, content };
  Note.create(newNote)
    .then(result => {
      res.location(`${req.originalURL}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});
////* Updating a single ID! Checking for errors first then running findByIdAndUpdate*/
router.put('/:id', (req, res, next) => {
  noteId = req.params.id;
  const { title, content } = req.body;
  //creating a 400 error incase id is not valid!
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    const err = new Error('The `id` is NOT valid');
    err.status = 400;
    return next(err);
  }
  /* If there is no title --throw a 400 error */
  if (!title) {
    const err = new Error('MISSING `title` in request body');
    err.status = 400;
    return next(err);
  }
  let updateBodyReq = { title, content };

  Note.findByIdAndUpdate(noteId, updateBodyReq, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      }
      else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});
////* Deleting a single note*/
router.delete('/:id', req, res, next) => {
  const noteId = req.params.id;
//creating a 400 error incase id is not valid!
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    const err = new Error('The `id` is NOT valid');
    err.status = 400;
    return next(err);
  }
  Note.findByIdAndRemove(noteId)
  .then(()=> {
    res.status(204).end();
  })
  .catch(err => {
    next(err);
  })
}

module.exports = router;