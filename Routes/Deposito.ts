import express from 'express';
import DepostioController from '../Controller/Controller-Deposito';
const Router = express.Router();
const Controller = new DepostioController();

Router.post('/depositar', Controller.criarDeposito);
Router.get('/listar', Controller.TipoDeposito);

export default Router; 