import express from 'express';
import CrendetiasController from '../Controller/Controller-OpenAccount'
const Routes = express.Router();
const Controller = new CrendetiasController();


Routes.post('/emailvalidete', Controller.SendvalideEmail);// parametros email

Routes.get('/validatEmail/:email/:tolken', Controller.ValideteEmail);

// paramentros nomecliente, emailcliente, telefonecliente:É DO TIPO INTEIRO, datanasci, numerobi, ocupacao, rua, municipio, bairro . !TODO O RESTO É STRING
Routes.post('/createCliente', Controller.createClient);

Routes.post('/', Controller.generatecredentias); // parametros email, navegador, sistemaoperativo

export default Routes;
