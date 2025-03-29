import express from 'express';
import ClienteController from '../Controller/Controller-Cliente';
const Router = express.Router();
const Controller = new ClienteController();

   // Router.get('/:id', Controller.getalldata);
    Router.post('/actualizaSenha', Controller.actualizaSenha);

    Router.post('/emailverifica', Controller.EnviaEmail);
    Router.post('/verificacodigo', Controller.verificaCodigo);
    Router.post('/validardados',Controller.Validardados);
    Router.post('/novascredencias', Controller.GeranovasCredenciais);
export default Router; 