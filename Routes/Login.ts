import express from 'express';
import LoginController from '../Controller/Controller-Login';
const Router = express.Router();
const controller = new LoginController();

// Parâmetros esperados no corpo da requisição: numeroadessao, accesscode
Router.post('/generate2fa', controller.generate2fa);


/*
Parâmetros esperados no corpo da requisição: 
codigo2fa, iddispositivo, sistemadispositivo, navegadordispositivo  !TODO DO TIPO STRING
*/
Router.post('/verify2fa', controller.verify2fa); 

export default Router;