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


//Nunca se sabe se no meio do processso o usuário pense em desistir, se ele desistisse na tela de Envio de fotografias, os dados já poderiam estar na base de dados através da rota /createcliente, o que pode originar armazenamento de dados que não serão utilizados. Para isso, a inserção dos dados tem que ser realizada no fim do processo

// Parâmetros esperados no corpo da requisição: numerobi, nomecliente, datanasci
Routes.post('/verificarDadosPessoais', Controller.verificaDadosPessoais)


export default Routes;
