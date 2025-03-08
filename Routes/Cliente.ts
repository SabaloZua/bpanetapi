import express from 'express';
import ClienteController from '../Controller/Controller-Cliente';
const Router = express.Router();
const Controller = new ClienteController();

   // Router.get('/:id', Controller.getalldata);


export default Router; 