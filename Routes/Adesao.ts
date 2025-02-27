import express from 'express'
const Router=express.Router();
import ControllerAdessao from '../Controller/Controller-Adessao';
const Controller=new ControllerAdessao();


Router.post('/emailvalidate',Controller.SendvalideEmail);// parametros email
Router.get('/validatEmail/:email/:tolken',Controller.ValideteEmail);
Router.post('/Sendcredential',Controller.generatecredentias); // parametros email, navegador, sistemaoperativo
Router.post('/findAccounts/:email',Controller.findAccounts); // parametros, numeroconta, bi,

export default Router;