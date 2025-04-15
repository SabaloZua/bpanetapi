import express from 'express';
import AdminController from '../Controller/Controller-Admin';
const Router = express.Router();
const Controller = new AdminController();


    Router.get('/dados', Controller.buscardados);
    Router.get('/dadosCleinte',Controller.getDadosCliente);
    Router.post('/bloquearconta',Controller.bloquearConta);
    Router.get('/transacoes',Controller.getTransacoes);

export default Router; 