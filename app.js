'use strict'
/*
  Fichier     : app.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Point d'entrée de l'application Skills-hub
*/

// Imporation des ressources externes
var express = require('express');
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var methods = require('methods');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var errorhandler = require('errorhandler');
var mongoose = require('mongoose');

// Récupération de la configuration
var config = require('./config/index');

// Récupération des modèles Mongoose utilisés par l'application
var Article = require('./models/Article');
var Category = require('./models/Category');
var Comment = require('./models/Comment');
var Event = require('./models/Event');
var Like = require('./models/Like');
var Notification = require('./models/Notification');
var Proposition = require('./models/Proposition');
var Rating = require('./models/Rating');
var Task = require('./models/Task');
var Tender = require('./models/Tender');
var User = require('./models/User');

// Récuperation de la config passport
require('./config/passport');

// Récupération des controleurs
var userCtrl = require('./controllers/users');
var articleCtrl = require('./controllers/articles');

// Sommes-nous en mode production ?
var isProduction = process.env.NODE_ENV === 'production';

// Création de l'objet global pour l'application Express
var app = express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Définition du serveur HTTP et de socket
var server = http.createServer(app);
var io = require('socket.io').listen(server);

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
app.use(session({ secret: config.secret, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  })); 

// Définition de la méthode de traitement des erreur
if (!isProduction) {
  app.use(errorhandler());
}

// Connexion à la base de données
mongoose.connect(config.dbUri,{ user: config.dbUser, pass: config.pass }, function(err){
  if(err) {
    console.log(err);
  }
  console.log("Connection open on DB : " + config.dbUri);
});

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

io.sockets.on('connection', function(socket) {
  // Log connection
  console.log(`${ socket.id } : connection opened ...`);

  socket.on('set socket', function(username) {
    userCtrl.setSocketId(username, socket.id);
  });

  socket.on('unset socket', function(username) {
    userCtrl.unsetSocketId(username);
  });
  
  socket.on('disconnect', function() {
    // Log connection
    console.log(`${ socket.id } : connection closed`);
  });
});

// On met en place un broadcast sur chaque nouvel evenement
Event.on('new', function(event) {  
  console.log(`${ event.user.email } has emitted an event of type '${ event.type }' at ${ new Date(event.createdAt).toLocaleTimeString() }`);
  io.sockets.emit('new event', event);
});

// Démarrage du serveur
server.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
