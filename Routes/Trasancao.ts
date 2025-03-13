import express from 'express';
import ControllerTrasancao from '../Controller/Controller-Trasancao'
import { verifystate } from '../helpers/Virigystate';
const Controller=new ControllerTrasancao();
const Router= express.Router();

// Rota para transferência do mesmo banco
// Parâmetros esperados no corpo da requisição: { idconta, contadestino, valor, descricao}
// Retorno saldoactualizado
Router.post('/transferenciaintra',verifystate,Controller.tranferenciaintrabancaria);

// Rota para transferência de  bancos diferentes
// Parâmetros esperados no corpo da requisição: { idconta, ibancontadestino, valor, descricao}
// Retorno saldoactualizado
Router.post('/transferenciainter',verifystate,Controller.tranferenciainterbancaria);

// Rota para levantamento
// Parâmetros esperados no corpo da requisição: { pin, valor,emaildestino,idconta}
// Retorno saldoactualizado
Router.post('/levantamento',verifystate,Controller.levantamento);

// Rota para obter transações
// Parâmetro esperado na URL: idconta
// Retorno trasacoes
Router.get('/gettrasacao/:idconta',Controller.getTrasacao);

// Rota para obter extrato em PDF
// Parâmetro esperado na URL: idconta
Router.get('/getpdf/:idconta',Controller.getextrato);


Router.post('/nahora',verifystate,Controller.nahora);
export default Router;