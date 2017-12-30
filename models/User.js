/*
  Fichier     : models/User.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un utilisateur
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const uniqueValidator  = require('mongoose-unique-validator');
const crypto =require('crypto');
const jwt = require('jsonwebtoken');

// Récupération de la phrase secrète depuis le fichier de configuration
var secret = require('../config').secret;

// Définition du schéma d'un utilisateur
var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "is required"], match: [/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "is required"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  abo: { type: String, lowercase: true, required: true, default: 'bronze', enum: ['bronze', 'silver', 'gold', 'platine', 'diamond']},
  lastname: String,
  firstname: String,
  bio: String,
  image: String,
  address: { type: mongoose.SchemaTypes.ObjectId, ref: 'address' },
  favorites: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'category' }],
  //Stats
  nbStars: Number,
  // Connection
  hash: String,
  salt: String,
  connection: String
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret){
      delete ret.hash;
      delete ret.salt;
      delete ret.__v;
      ret.displayName = (doc.firstname !== undefined ||  doc.lastname !== undefined) 
      ? (doc.firstname !== undefined ? doc.firstname : '') + (doc.lastname !== undefined ? ' ' + doc.lastname : '') 
      : 'Utilisateur anonyme';
    }
  },
  toJSON: {
    transform: function(doc, ret){
      delete ret.hash;
      delete ret.salt;
      delete ret.__v; 
      ret.displayName = (doc.firstname !== undefined ||  doc.lastname !== undefined) 
      ? (doc.firstname !== undefined ? doc.firstname : '') + (doc.lastname !== undefined ? ' ' + doc.lastname : '') 
      : 'Utilisateur anonyme';
    }
  }
});

// Définition du plugin utilisé pour la validation des champs uniques
UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
UserSchema.methods.toJSONFor = function(user) {
  const displayName = (this.firstname !== undefined ||  this.lastname !== undefined) 
  ? (this.firstname !== undefined ? this.firstname : '') + (this.lastname !== undefined ? ' ' + this.lastname : '') 
  : 'Utilisateur anonyme';
  return {
    _id: this._id.toString(),
    username: this.username,
    email: this.email,
    abo: this.abo,
    lastname: this.lastname,
    firstname: this.firstname,
    displayName: displayName,
    bio: this.bio,
    image: this.image,
    address: this.address,
    favorites: this.favorites && user ? this.favorites.map((fav) => fav.toJSONFor(user)) : this.favorites,
    nbStars: this.nbStars,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isConnected: this.connection !== '',
    canEdit: user && user.isMine(this._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('address')
  .populate({
    path: 'favorites',
    options: {
        sort: {
            title: 'asc'
        }
    }
  });
  next();
};
UserSchema.pre('findOneAndUpdate', autoPopulate);
UserSchema.pre('findOne', autoPopulate);
UserSchema.pre('find', autoPopulate);

// Définition de la méthode utilisée pour mettre à jour le mot de passe d'un utilisateur
UserSchema.methods.setPassword = function(password){
  // Calcul du salt
  this.salt = crypto.randomBytes(16).toString('hex');
  // Calcul du hash du password
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// Définition de la méthode utilisée pour la validation d'un mot de passe
UserSchema.methods.validPassword = function(password) {
  // Calcul du hash identique au calcul fait lors de la mise à jour du mot de passe
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  // On compare les 2 hash pour définir si le mot de passe est valide
  return this.hash === hash;
};

// Définition de la méthode de génération d'un JSON Web Token
UserSchema.methods.generateJWT = function() {
  // Préparation des variables
  var today = new Date();
  var exp = new Date(today);

  // Par défaut le token expire au bout de 60 jours
  exp.setDate(today.getDate() + 60);

  // On signe le web token avec la phrase secrète avant de le renvoyer
  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

// Définition due la méthode de contrôle si une catégorie est favorie
UserSchema.methods.isFavorite = function(id){
  return this.favorites.some(function(cat){
    return cat.toString() === id.toString();
  });
};

UserSchema.methods.isMine = function(id){
  return this._id.toString() === id.toString();
};

// Attribution du schéma au modèle d'utilisateur
module.exports = mongoose.model('user', UserSchema);
