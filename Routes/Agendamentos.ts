import express from 'express';
import ControllerAjendamentos from '../Controller/Controller-Ajendamentos';
const Router=express.Router();
const Controller=new ControllerAjendamentos();

Router.get('/cron',Controller.Agendamentos);


export default Router;