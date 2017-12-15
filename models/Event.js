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
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
EventSchema.methods.toJSONFor = function(user) {
  return {
    _id: this._id.toString(),
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    source: { kind: this.source.kind, item: this.source.item && user ? this.source.item.toJSONFor(user) : this.source.item },
    isMine: user && user.isMine(this.author._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('source.item');
  next(); 
};
EventSchema.pre('findOne', autoPopulate);
EventSchema.pre('find', autoPopulate);

// Définition du traitement après enregitrement
EventSchema.post('save',function(doc, next) {   
  this.db.model('event').emit('new', doc); 
  next(); 
});

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
