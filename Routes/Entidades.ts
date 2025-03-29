import express from 'express';
import EntidadeController from '../Controller/Controller-Entidade';
const Router = express.Router();
const Controller = new EntidadeController();


    Router.get('/dados', Controller.EntidadeDados);
    Router.get('/produtos/:idEntidade', Controller.ProdutosEntidade);

export default Router; 