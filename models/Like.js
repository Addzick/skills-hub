/*
  Fichier     : models/Like.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un like
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un like
var LikeSchema =  new mongoose.Schema({
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
LikeSchema.methods.toJSONFor = function(user) {
  return {
    _id: this._id.toString(),
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    source: { kind: this.source.kind, item: this.source.item && user ? this.source.item.toJSONFor(user) : this.source.item },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    canEdit: user && user.isMine(this.author._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('source.item');
  next(); 
}
LikeSchema.pre('findOneAndUpdate', autoPopulate);
LikeSchema.pre('findOne', autoPopulate);
LikeSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle de like
module.exports = mongoose.model('like', LikeSchema);
