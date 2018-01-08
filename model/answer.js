import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'
import _ from 'lodash'

const SubAnswerSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		 label: { // le label affiché en cas de quick_reply
			type: String,
			required: true
		}
	}
);

const AnswerSchema = new mongoose.Schema(
	{
	  name: {
			type: String,
			required: [true, "Un name est nécessaire"],
		},
		description: { // description utilise en interne
			type: String,
		},
		quickReplyLabel: {
			type: String,
		},
		precise:{
			type: Boolean,
			default: false,
		},
		species: {
			type: String,
			required: [true, "Une species est nécessaire"],
		},
		intent: {
			type: String,
		},
		entities: {
			type: [String],
		},
		entValues: {
			type: [String],
		},
	  text: {
			type: String,
			required: [true, "Le texte de la réponse ne doit pas être vide"],
		},
		children: {
			type: [SubAnswerSchema],
		},
		siblings: {
			type: [SubAnswerSchema],
		},
		is_deleted:{
			type: Boolean,
			default: false,
		},
	}
);

AnswerSchema.statics.findOneRandomByIntent = async function(intent) {
	const result = await this.find({'intent':intent})
	const randomIndex = _.random(0, result.length-1)
	return result[randomIndex]
};

AnswerSchema.plugin(timestamps);
AnswerSchema.plugin(mongooseStringQuery);
AnswerSchema.plugin(uniqueValidator); // for name but buggy when update

const Answers = mongoose.models.answers || mongoose.model('answers', AnswerSchema);
module.exports = Answers;
