/*
  Fichier     : db.js
  Auteur      : Youness FATH
  Date        : 27.11.2017
  Description : Script de configuration de la base de données
*/

// Importation des ressources externes
const session = require('express-session');
const mongoose = require('mongoose');

// Récupération de la configuration
const config = require('./config/index');

// Récupération des modèles Mongoose utilisés par l'application
const Category = require('./models/Category');
const Address = require('./models/Address');
const User = require('./models/User');
const Like = require('./models/Like');
const Comment = require('./models/Comment');
const Event = require('./models/Event');
const Article = require('./models/Article');
const Proposition = require('./models/Proposition');
const Rating = require('./models/Rating');
const Task = require('./models/Task');
const Tender = require('./models/Tender');

// Définition des catégories par défaut
const categories = [
    { name: 'babysitting', title: 'Babysitting / Petsitting', 	photo:	'babysitting.jpg' },
    { name: 'evenementiel', title: 'Evenementiel',			 	photo:	'evenementiel.jpg' },
    { name: 'bricolage', title: 'Travaux / Bricolage',		 	photo:	'travaux.jpg' },
    { name: 'jardinage', title: 'Jardinage',				 	photo:	'jardinage.jpg' },
    { name: 'menage', title: 'Ménage / Repassage',		 	    photo:	'menage-repassage.jpg' },
    { name: 'aidedomicile', title: 'Aide à domicile',			photo:	'aidealapersonne.jpg' },
    { name: 'couture', title: 'Confection / Retouche',	 	    photo:	'couture.jpg' },
    { name: 'coiffure', title: 'Coiffure / Esthétique',	 	    photo:	'coiffure.jpg' },
    { name: 'informatique', title: 'Informatique',			 	photo:	'informatique.jpg' },
    { name: 'redaction', title: 'Rédaction / Traduction',	 	photo:	'assistanat.jpg' },
    { name: 'cours', title: 'Cours / Coaching',		 	        photo:	'coaching.jpg' },
    { name: 'transport', title: 'Transport / Demenagement', 	photo:	'demenagement.jpg' }];

// Définition de la méthode d'initialisation
module.exports.initialization = function(app) {
    // Connexion à la base de données
    var opts = { useMongoClient: true };
    if(config.dbUser) {
        opts.user = config.dbUser;
        opts.pass = config.dbPwd;
    }
    mongoose.Promise = global.Promise;
    mongoose.connect(config.dbUri, opts, function(err){
        if(err) { console.error(err); }   
    });    
    // Définition des paramètres d'une session
    var MongoStore = require('connect-mongo')(session);
    app.use(session({ 
        secret: config.secret, 
        cookie: { 
        secure: true,
        maxAge: 60000 
        }, 
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false, 
        saveUninitialized: false  
    }));     
    // Insertion des catégories par défaut
    return categories.forEach((cat) => {
        return Category
        .findOneAndUpdate({ name: cat.name }, cat, { new: true, upsert: true }, function(err, doc){
            if(err) { console.error(err); }
            if(!doc) { console.error(`Cannot create category ${ cat.name }`); }
        });
    });
}
