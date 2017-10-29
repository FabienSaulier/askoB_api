
const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const SonSchema = new mongoose.Schema(
	{
		name: {
			type:String,
			required: true,
			validate: {
				validator: function(value){
					return value !=''
				},
				 message: 'Le nom et le code ne peuvent pas être vide'
			}
		},
		 code: {
			type:String,
			required: true,
			validate: {
				validator: function(value){
					return value !=''
				},
				 message: 'Le nom et le code ne peuvent pas être vide'
			}
		}
	}
);

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
