/*
  Fichier     : routes/api/tenders.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des appels d'offres
*/

// Importation des ressources externes
var router = require('express').Router();
var mongoose = require('mongoose');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Récupération du controller
var controller = require('../../controllers/tenders');

// On précharge l'appel d'offres s'il est passé en paramètre
router.param('tender', controller.preloadTender);

// On précharge le commentaire s'il est passé en paramètre
router.param('comment', controller.preloadComment);

// On précharge le like s'il est passé en paramètre
router.param('like', controller.preloadLike);

// GET : http://<url-site-web:port>/api/tenders/
// Renvoie la liste des appels d'offres après pagination
router.get('/', auth.optional, controller.getAll);

// GET : http://<url-site-web:port>/api/tenders/:id
// Renvoie l'appel d'offres correspondant
router.get('/:tender', auth.optional, controller.getById);

// GET : http://<url-site-web:port>/api/tenders/comments/:id
// Renvoie la liste complète des commentaires d'un appel d'offres
router.get('/:tender/comments', auth.optional, controller.getComments);

// GET : http://<url-site-web:port>/api/tenders/comments/:id
// Renvoie la liste complète des likes d'un appel d'offres
router.get('/:tender/likes', auth.optional, controller.getLikes);

// POST : http://<url-site-web:port>/api/tenders/create
// Crée un appel d'offres
router.post('/', auth.required, controller.create);

// PUT : http://<url-site-web:port>/api/tenders/edit
// Met à jour l'appel d'offres correspondant
router.put('/:tender', auth.required, controller.edit);

// PATCH : http://<url-site-web:port>/api/tenders/publish
// Publie l'appel d'offres correspondant
router.patch('/:tender', auth.required, controller.publish);

// DELETE : http://<url-site-web:port>/api/tenders/:tender
// Supprime un appel d'offres existant
router.delete('/:tender', auth.required, controller.delete);

// POST : http://<url-site-web:port>/api/tenders/:tender/comments
// Ajout un nouveau commentaire à l'appel d'offres correspondant
router.post('/:tender/comments', auth.required, controller.comment);

// DELETE : http://<url-site-web:port>/api/tenders/:tender/comments
// Supprime un commentaire de l'appel d'offres correspondant
router.delete('/:tender/comments/:comment', auth.required, controller.uncomment);

// POST : http://<url-site-web:port>/api/tenders/:tender/comments
// Ajout un nouveau like à l'appel d'offres correspondant
router.post('/:tender/likes', auth.required, controller.like);

// DELETE : http://<url-site-web:port>/api/tenders/:tender/comments
// Supprime un like de l'appel d'offres correspondant
router.delete('/:tender/likes/:like', auth.required, controller.unlike);

// Exportation du router
module.exports = router;
