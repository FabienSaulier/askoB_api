
const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const SonSchema = new mongoose.Schema({ name: String, code: String });

const AnswerSchema = new mongoose.Schema(
	{
	    
	    code: {
			type: String
		},
		name: {
			type: String
		},
	    text: {
			type: String
		},
	    sons: {
			type: [SonSchema]
		}
	}
);

AnswerSchema.plugin(timestamps);
AnswerSchema.plugin(mongooseStringQuery);

const Answers = mongoose.model('answers', AnswerSchema);
module.exports = Answers;    