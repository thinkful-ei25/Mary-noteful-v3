'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();
const mongoose = require('mongoose');

////* Get All or Complete Search*/
router.get('/', (req, res, next) => {

  const { searchTerm, folderId, tagId } = req.query;
  let filter = {};
  const regEx = new RegExp(searchTerm, 'i');
  if (searchTerm) {
    const title = regEx;
    const content = regEx;
    filter.$or[{ title }, { content }];
  }
  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tags = tagId;
  }
  console.log('filter is', filter);
  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then((results) => {
      res.json(results);
    })
    .catch(err => {
      return next(err);
    });

  ////* This finds a particular ID and returns the object associated with*/
  router.get('/:id', (req, res, next) => {
    noteId = req.params.id;
    //creating a 400 error incase id is not valid!
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      const err = new Error('The `id` is NOT valid');
      err.status = 400;
      return next(err);
    }
    Note.findById(noteId)
      .populate('tags')
      .then(results => {
        if (result) {
          res.json(results);
        }
        else {
          next();
        }
      })
      .catch(err => {
        return next(err);
      })
  });
  ////* This is for committing a post/create to the database */
  router.post('/', (req, res, next) => {
    const { title, content, folder_id, tags } = req.body; //destructuring req.body.title & req.body.content
    if (!tags) {
      tags = [];
    }
    if (folder_id) {
      if (!mongoose.Types.ObjectId.isValid(folder_id)) {
        res.status(400).send('400 folderID is not valid :(')
      }
    }
    if (!title) {
      res.status(400).send('No title was given!');
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).send('400 ID is not valid :(')
    }
    newNote = { title, content, folder_id, tags };
    Note.create(newNote)
      .then(result => {
        res.location(`${req.originalURL}/${result.id}`)
          .status(201)
          .json(result);
      })
      .catch(err => {
        return next(err);
      });
  });
  ////* Updating a single ID! Checking for errors first then running findByIdAndUpdate*/
  router.put('/:id', (req, res, next) => {
    noteId = req.params.id;
    const { title, content, folder_id, tags } = req.body;
    const updatedNoteReq = {title, content, tags};

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      const err = new Error('The `id` is NOT valid');
      err.status = 400;
      return next(err);
    }
    if(folder_id){
      updatedNoteReq.folder_id = folder_id;
    }
    if (!title) {
      res.status(400).send('400 no title was given!');
      return next(err);
    }
  

    Note.findByIdAndUpdate(noteId, updatedNoteReq, { new: true })
      .then(result => {
        if (result) {
          res.json(result);
        }
        else {
          next();
        }
      })
      .catch(err => {
        return next(err);
      });
  });
  ////* Deleting a single note*/
  router.delete('/:id', (req, res, next) => {
    const noteId = req.params.id;
 
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      res.status(400).send('Not a VALID ID! :(');
      return next(err);
    }
    Note.findByIdAndRemove(noteId)
      .then(() => {
        res.status(204).end();
      })
      .catch(err => {
        return next(err);
      })
  });

  module.exports = router;