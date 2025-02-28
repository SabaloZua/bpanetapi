import express from 'express'
const Router=express.Router();
import ControllerAdessao from '../Controller/Controller-Adessao';
const Controller=new ControllerAdessao();

// Parâmetros esperados no corpo da requisição: email
Router.post('/emailvalidate',Controller.sendvalideemail);

Router.get('/validatemail/:email/:tolken',Controller.valideteemail);

// Parâmetros esperados no corpo da requisição: numeroconta, bi, TODO STRING
Router.post('/findaccounts/:email',Controller.findaccounts); 

// Parâmetros esperados no corpo da requisição: navegador, sistemaoperativo email, iddispositivo TODO STRING
Router.post('/sendcredential',Controller.generatecredentias);

export default Router;