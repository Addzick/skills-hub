/*
  Fichier     : error.js
  Auteur      : Youness FATH
  Date        : 27.11.2017
  Description : Script de configuration de la gestion des erreurs
*/

// Importation des ressources externes
var errorhandler = require('errorhandler');

// Définition de la méthode d'initialisation
module.exports.initialization = function(app, isProduction) {
    // Définition de la méthode de traitement des erreur
    if (!isProduction) { app.use(errorhandler()); }

    // Définition du traitement en cas d'erreur 404
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        console.error("404 : Error not found");
        next(err);
    });

    // Traitement des erreurs survenus en mode production
    // Aucune information sensible ne doit être affichée ou transmise
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500).json({'errors': {
            message: err.message,
            error: !isProduction ? err : {}
        }});
    });
}

