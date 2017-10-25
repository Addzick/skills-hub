/*
  Fichier     : app.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Point d'entrée de l'application Skills-hub
*/

// Imporation des ressources externes
var http = require('http');
var path = require('path');
var methods = require('methods');
var express = require('express');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var errorhandler = require('errorhandler');
var mongoose = require('mongoose');

// Sommes-nous en mode production ?
var isProduction = process.env.NODE_ENV === 'production';

// Création de l'objet global pour l'application Express
var app = express();

// Définition du cross-origin resource sharing (CORS). 
// C'est un mécanisme de permettant d'accèder à des ressources protégées (ex : une police de caractère) depuis un autre domaine que celui de l'application
app.use(cors());

// Définition de l'objet utilisé pour logger les informations
app.use(logger('dev'));

// Définition de l'objet utilisé pour le traitement du corps des requêtes HTTP
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Définition de l'objet permettant d'utiliser des verbes tels que PUT ou DELETE dans nos requêtes HTTP
app.use(methodOverride());

// Définition du répéertoire contenant les fichiers publics (ex: feuilles de styles, images, fichiers HTML, ...)
app.use(express.static(__dirname + '/public'));

// Définition des paramètres d'une session
app.use(session({ secret: 'skills-hub', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

// Definition de flash pour la gestion des messages stockés dans la session.
app.use(flash()); 

// Définition de la méthode de traitement des erreur
if (!isProduction) {
  app.use(errorhandler());
}

// Connexion à la base de données
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/skills-hub');
  mongoose.set('debug', true);
}

// Récupération des modèles Mongoose utilisés par l'application
require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');

// Définition des routes
app.use(require('./routes'));

// Définition du traitement en cas d'erreur 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Traitement des erreurs survenues en mode developpement. 
// Les erreurs contiendront la pile d'execution.
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// Traitement des erreurs survenus en mode production
// Aucune information sensible ne doit être affichée ou transmise
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// Démarrage du serveur
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
