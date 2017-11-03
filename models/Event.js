/*
  Fichier     : models/Event.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un evenement
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var enums = require('../config/enum');

// Définition du schéma d'un évènement
var EventSchema =  new mongoose.Schema({
    type: { type: String, required: true, lowercase:true, enum:  enums.eventType },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },
    root: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'root.kind' } },
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  }
});

EventSchema.statics.newEvent = function(type, user, source, root){
  return this.create({
    type: type,
    user: user,
    source: source,
    root: root
  });
}

EventSchema.post('save',function(event, next){
  this.db.model('Event').emit('new', event);
  next();
});

// Attribution du schéma au modèle d'évènement
module.exports = mongoose.model('Event', EventSchema);
