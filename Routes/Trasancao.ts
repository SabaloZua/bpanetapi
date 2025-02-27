import express from 'express';
import ControllerTrasancao from '../Controller/Controller-Trasancao'
import { verifystate } from '../helpers/Virigystate';
const Controller=new ControllerTrasancao();
const Router= express.Router();

// Rota para transferência
// Parâmetros esperados no corpo da requisição: { n_idcliente, contaDestino, valor, descricao, estado}
// Explicação o parametro estado é para fazer a verificação no midlawere do estado da conta para saber e está pendente ou activada
// caso estiver pendente ele nao podera fazer nehuma transação    
Router.post('/transferencia',verifystate,Controller.tranferencia);

// Rota para levantamento
// Parâmetros esperados no corpo da requisição: { pin, valor,emaildestino,idcliente,estado}
Router.post('/levantamento',verifystate,Controller.levantamento);

// Rota para obter transações
// Parâmetro esperado na URL: idconta
Router.get('/getTrasacao/:idconta',Controller.getTrasacao);

// Rota para obter extrato em PDF
// Parâmetro esperado na URL: idconta
Router.get('/getpdf/:idconta',Controller.getextrato);

export default Router;