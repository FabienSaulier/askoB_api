import mongoose from 'mongoose'

const EntitySchema = new mongoose.Schema(
	{
	  _id: { // ID fournit par Recast
			type: String,
			required: [true, "Un id est nécessaire"],
		},
		name: { // description utilise en interne
			type: String,
		},
		slug: {
			type: String,
		},
		color: {
			type: String,
		},
		custom: {
			type: Boolean,
		},
		count: { // pas mis à jour par l'api (on ne maj quand les nouvelles entities)
			type: Number,
		},
		order: {
			type: Number,
		},
		isFiltered: {
			type: Boolean,
		},
		areValuesPertinent: {
			type: Boolean,
		},
	}
);

EntitySchema.statics.getEntitiesName = function() {
	 return this.find({isFiltered:true}, {name:true, _id:false})
};

const Entities = mongoose.model('entities', EntitySchema);
module.exports = Entities;
