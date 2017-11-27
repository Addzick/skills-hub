'use strict'
/*
  Fichier     : app.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Point d'entrée de l'application Skills-hub
*/

// Imporation des ressources externes
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const path = require('path');
const methods = require('methods');
const logger = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');

// Sommes-nous en mode production ?
const isProduction = process.env.NODE_ENV === 'production';

// Création l'application Express et du serveur http
const app = express();
const server = http.createServer(app);

// Configuration de l'application
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// Initilisation de la base de données
require('./db').initialization(app);

// Initialisation du routage
require('./routes').initialization(app);

// Initialisation de la gestion d'erreurs
require('./error').initialization(app, isProduction);

// Initialisation du serveur de socket
require('./socket').initialization(server);

// Démarrage du serveur
server.listen( process.env.PORT || 3000, function(){
  console.info('Server is listening on port ' + server.address().port);
});