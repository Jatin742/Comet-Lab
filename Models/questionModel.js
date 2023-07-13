const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sphereId:{
    type:Number,
    required:true,
  }
  ,
  testCases: [
    {
      input: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      expectedOutput: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      }
    },
  ],
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
