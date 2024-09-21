const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  username:{
    type:String, 
    required: true,
    index: true,
    unique: true,
  },
  name:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true,
  },
  schedule:{
    sat:[{from:String,to:String}],
    sun:[{from:String,to:String}],
    mon:[{from:String,to:String}],
    tue:[{from:String,to:String}],
    wed:[{from:String,to:String}],
    thu:[{from:String,to:String}],
    fri:[{from:String,to:String}]
  }
}, {
  timestamps: true,
});

const Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor;
