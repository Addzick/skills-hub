/*
  Fichier     : routes/api/articles.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des articles
*/

// Importation des ressources externes
var router = require('express').Router();
var mongoose = require('mongoose');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Récupération du controller
var controller = require('../../controllers/articles');

// On précharge l'article s'il est passé en paramètre
router.param('article', controller.preloadArticle);

// On précharge le commentaire s'il est passé en paramètre
router.param('comment', controller.preloadComment);

// On précharge le like s'il est passé en paramètre
router.param('like', controller.preloadLike);

// GET : http://<url-site-web:port>/api/articles/
// Renvoie la liste des articles après pagination
router.get('/', auth.optional, controller.getAll);

// GET : http://<url-site-web:port>/api/articles/:id
// Renvoie l'article correspondant
router.get('/:article', auth.optional, controller.getById);

// GET : http://<url-site-web:port>/api/articles/feed
// Renvoie les articles publiés dans les categories suivies par l'utilisateur
router.get('/feed', auth.required, controller.getFeed);

// GET : http://<url-site-web:port>/api/articles/tags/
// Renvoie la liste complète des tags de tous les articles postés
router.get('/tags', auth.optional, controller.getTags);

// GET : http://<url-site-web:port>/api/articles/comments/:id
// Renvoie la liste complète des commentaires d'un article
router.get('/:article/comments', auth.optional, controller.getComments);

// GET : http://<url-site-web:port>/api/articles/comments/:id
// Renvoie la liste complète des likes d'un articles
router.get('/:article/likes', auth.optional, controller.getLikes);

// POST : http://<url-site-web:port>/api/articles/create
// Crée un article
router.post('/', auth.required, controller.create);

// PUT : http://<url-site-web:port>/api/articles/edit
// Met à jour l'article correspondant
router.put('/:article', auth.required, controller.edit);

// PATCH : http://<url-site-web:port>/api/articles/publish
// Publie l'article correspondant
router.patch('/:article', auth.required, controller.publish);

// DELETE : http://<url-site-web:port>/api/articles/:article
// Supprime un article existant
router.delete('/:article', auth.required, controller.delete);

// POST : http://<url-site-web:port>/api/articles/:article/comments
// Ajout un nouveau commentaire à l'article correspondant
router.post('/:article/comments', auth.required, controller.comment);

// DELETE : http://<url-site-web:port>/api/articles/:article/comments
// Supprime un commentaire de l'article correspondant
router.delete('/:article/comments/:comment', auth.required, controller.uncomment);

// POST : http://<url-site-web:port>/api/articles/:article/comments
// Ajout un nouveau like à l'article correspondant
router.post('/:article/likes', auth.required, controller.like);

// DELETE : http://<url-site-web:port>/api/articles/:article/comments
// Supprime un like de l'article correspondant
router.delete('/:article/likes/:like', auth.required, controller.unlike);

// Exportation du router
module.exports = router;
