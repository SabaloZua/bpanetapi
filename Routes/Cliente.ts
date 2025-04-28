import express from 'express';
import ClienteController from '../Controller/Controller-Cliente';
import multer from 'multer';
const Router = express.Router();
const Controller = new ClienteController();

const upload=multer({
    storage:multer.memoryStorage()
})

   // Router.get('/:id', Controller.getalldata);
    Router.post('/actualizaSenha', Controller.actualizaSenha);

    Router.post('/emailverifica', Controller.EnviaEmail);
    Router.post('/verificacodigo', Controller.verificaCodigo);
    Router.post('/validardados',Controller.Validardados);
    Router.post('/novascredencias', Controller.GeranovasCredenciais);
    Router.get('/perguntaseguranca/:email',Controller.buscarPergunta);
    Router.post("/resposta",Controller.verificarResposta);
    Router.post ('/uploadfoto/:idconta', upload.single('image'),Controller.uploadFoto);
export default Router; 