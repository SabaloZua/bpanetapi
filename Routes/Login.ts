import express from 'express';
import LoginController from '../Controller/Controller-Login';
const Router = express.Router();
const controller = new LoginController();

Router.post('/generate2fa', controller.generate2fa);// parametros numeroadessao, accessCode
Router.post('/verify2fa', controller.verify2fa); // parametros codigo2fa, idDispositivo, sistemaDispositivo, navegadorDispositivo  !TODO DO TIPO STRING

export default Router;