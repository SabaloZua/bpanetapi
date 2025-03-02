import express from 'express';
import CrendetiasController from '../Controller/Controller-OpenAccount'
const Routes = express.Router();
const Controller = new CrendetiasController();


// Parâmetros esperados no corpo da requisição: email
Routes.post('/emailvalidete', Controller.sendvalideemail);// 

Routes.get('/validatemail/:email/:tolken', Controller.valideteemail);

/*
Parâmetros esperados no corpo da requisição: 
nomecliente, emailcliente, 
telefonecliente:É DO TIPO INTEIRO,
datanasci, 
numerobi, ocupacao, rua, municipio, bairro . !TODO O RESTO É STRING
idpoconta -> aqui será o id do tipo da conta que está na tabela tipo_conta

*/
Routes.post('/createcliente', Controller.createclient);


// Parâmetros esperados no corpo da requisição: email, navegador, sistemaoperativo iddispositivo

Routes.post('/', Controller.generatecredentias); 

export default Routes;
