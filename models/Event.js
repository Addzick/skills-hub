/*
  Fichier     : models/Event.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un evenement
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un évènement
var EventSchema =  new mongoose.Schema({
    type: { type: String, required: true, lowercase:true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },    
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

// Définition des hooks
EventSchema.pre('findOne', function(next) { 
  this
  .populate('author')
  .populate('source.item');
  next(); 
});
EventSchema.pre('find', function(next) { 
  this
  .populate('author')
  .populate('source.item');
  next();
});
EventSchema.post('save',function(doc, next) {   
  this.db.model('event').emit('new', doc); 
  next(); 
});

// Définition du traitement de population
EventSchema.methods.autoload = function() {
  this.populate('author').populate('source.item');
};

// Définition de la méthode de création
EventSchema.statics.newEvent = function(type, author, source) {
  return this.create({
    type: type,
    author: author,
    source: source
  });
}

// Attribution du schéma au modèle d'évènement
module.exports = mongoose.model('event', EventSchema);
