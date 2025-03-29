import express from 'express';
import ControllerTrasancao from '../Controller/Controller-Pdfs'

const Controller=new ControllerTrasancao();
const Router= express.Router();

Router.get('/extrato/:idconta/:datainicio/:datafim',Controller.gerarextrato);

Router.get('/comprovativo/:idtransacao',Controller.gerarcomprovativo);


export default Router;