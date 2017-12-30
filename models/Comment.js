/*
  Fichier     : models/Comment.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un commentaire
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un commentaire
var CommentSchema = new mongoose.Schema({
  body: String,
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

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
CommentSchema.methods.toJSONFor = function(user) {
  return {
    _id: this._id.toString(),
    body: this.body,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    source: { kind: this.source.kind, item: this.source.item && user ? this.source.item.toJSONFor(user) : this.source.item },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    canEdit: this.author && user && user.isMine(this.author._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('source.item');
  next(); 
}
CommentSchema.pre('findOneAndUpdate', autoPopulate);
CommentSchema.pre('findOne', autoPopulate);
CommentSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle de commentaire
module.exports = mongoose.model('comment', CommentSchema);
