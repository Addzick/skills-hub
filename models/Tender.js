/*
  Fichier     : models/Tender.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un appel d'offres
*/

// Importation des ressources externes
const mongoose = require('mongoose');

// Définition du schéma d'un appel d'offres
var TenderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,    
    medias: [String],
    isPrivate: { type: Boolean, default:false },
    workDate: Date,
    validityStart: Date,
    validityEnd: Date,
    nbComments: Number,
    nbLikes: Number,
    nbPropositions: Number,
    nbTasks: Number,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    address: { type: mongoose.SchemaTypes.ObjectId, ref: 'address' },
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    category:{ type: mongoose.SchemaTypes.ObjectId, ref: "category" },
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
    propositions:[{ type: mongoose.SchemaTypes.ObjectId, ref: "proposition" }],
    tasks:[{ type: mongoose.SchemaTypes.ObjectId, ref: "task" }],
    closedAt: Date,
    canceledAt: Date, 
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
TenderSchema.methods.toJSONFor = function(user) {
  const myLike = this.likes.find(like => like && user && user.isMine(like.author._id));
  const myProposition = this.propositions.find(prop => prop && user && user.isMine(prop.author._id));
  const acceptedProp = this.propositions.find(prop => prop.acceptedAt);
  const isClosed = this.closedAt && typeof this.closedAt !== 'undefined';
  const isCanceled = this.canceledAt && typeof this.canceledAt !== 'undefined';
  const isOpened = !isClosed && !isCanceled && new Date(this.validityStart) <= Date.now() && new Date(this.validityEnd) >= Date.now();

  const canEdit = !isClosed && !acceptedProp && user && user.isMine(this.author._id);
  const canPropose = isOpened && !acceptedProp && !myProposition && (!this.isPrivate || (this.isPrivate && this.target && user && user.isMine(this.target._id)));

  return {
    _id: this._id.toString(),
    title: this.title,
    description: this.description,    
    medias: this.medias,
    isPrivate: this.isPrivate,
    workDate: this.workDate,
    validityStart: this.validityStart,
    validityEnd: this.validityEnd,
    nbComments: this.nbComments,
    nbLikes: this.nbLikes,
    nbPropositions: this.nbPropositions,
    nbTasks: this.nbTasks,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    category: this.category && user ? this.category.toJSONFor(user) : this.category,    
    address: this.address && user ? this.address.toJSONFor(user) : this.address,
    target: this.target && user ? this.target.toJSONFor(user) : this.target,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    closedAt: this.closedAt,
    canceledAt: this.canceledAt,
    myLike: myLike,
    myProposition: myProposition,
    acceptedProp: acceptedProp,
    isClosed: isClosed,
    isCanceled: isCanceled,
    isOpened: isOpened,
    canEdit: canEdit,
    canPropose: canPropose
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('address')
  .populate('author')
  .populate('target')
  .populate('category')
  .populate('likes', 'author')
  .populate('propositions', 'acceptedAt');
  next(); 
};
TenderSchema.pre('findOneAndUpdate', autoPopulate);
TenderSchema.pre('findOne', autoPopulate);
TenderSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle d'appel d'offres
module.exports = mongoose.model('tender', TenderSchema);
