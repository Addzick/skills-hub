/*
  Fichier     : routes/auth.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition de la méthode de récupération du token depuis un header HTTP
*/

// Importation des ressources externes
var jwt = require('express-jwt');

// Récupération de la phrase scrète depuis le fichier de configuration
var secret = require('../config').secret;

// Définition de la fonction de récupération du token depuis l'entête HTTP
function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

// Déclaration d'un nouvel objet pour le traitement de l'authentification
var auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

// Exporation de l'objet de traitement
module.exports = auth;
