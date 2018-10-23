const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'ways';

    let titleOrContent = {
        $or: [
            {title: { $regex: searchTerm }},
            {content: { $regex: searchTerm }}
        ]
    }
    // Note.find()
    // let filter = {};
    // let titleOrContent =
    // if (searchTerm) {  
    //   filter.title = { $regex: searchTerm };
    //   filter.content = { $regex: searchTerm };
    // }

    return Note.find(titleOrContent).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
