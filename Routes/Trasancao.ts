import express from "express";
import ControllerTrasancao from "../Controller/Controller-Trasancao";
import { verifystate } from "../helpers/Virigystate";
const Controller = new ControllerTrasancao();
const Router = express.Router();

// Rota para transferência do mesmo banco
// Parâmetros esperados no corpo da requisição: { idconta, contadestino, valor, descricao}
// Retorno saldoactualizado
Router.post("/transferenciaintra", verifystate, Controller.tranferenciaintrabancaria);

// Rota para transferência de  bancos diferentes
// Parâmetros esperados no corpo da requisição: { idconta, ibancontadestino, valor, descricao}
// Retorno saldoactualizado
Router.post("/transferenciainter", verifystate, Controller.tranferenciainterbancaria);

// Rota para levantamento
// Parâmetros esperados no corpo da requisição: { pin, valor,emaildestino,idconta}
// Retorno saldoactualizado
Router.post("/levantamento", verifystate, Controller.levantamento);

// Rota para obter transações com filtro de data
// Parâmetro esperado na URL: idconta
// Retorno trasacoes
Router.get("/gettrasacao/:idconta/:datainicio/:datafim", Controller.getTrasacao);

// Rota para levantamento
// Parâmetros esperados no corpo da requisição: { idconta, valor,telefonecontadestino}
// Retorno saldoactualizado
Router.post("/nahora", verifystate, Controller.nahora);
Router.post("/beneficiarionahora/",verifystate, Controller.beneficiarioNaHora);

// Rota para obter transações recentes limite 6
// Parâmetro esperado na URL: idconta
// Retorno trasacoes

Router.get("/trasacoesrecentes/:idconta", Controller.trasnacaoPrincipal);

Router.post("/pagamentoentidade", verifystate, Controller.pagamentosEntidade);

Router.post("/codigo", Controller.codigoOTP);

Router.post("/verificacodigo", Controller.virificaCodigo);
Router.get("/benefeciario/:numeroconta", Controller.benfeciario);

Router.get("/levantamentos/:idconta", Controller.levantametosRecentes);
Router.post("/beneficiariolevantamento/",verifystate, Controller.beneficiarioLevantamento);
Router.post("/Cancelarlevantamento", Controller.CancelarLevantamento);

export default Router;
