import express, { Router } from 'express';
import cliente from './Routes/Cliente'
import openAccount from './Routes/OpenAccount'
import adessao from './Routes/Adesao'
import login from './Routes/Login'
import trasacao from './Routes/Trasancao';
import Conta from './Routes/Conta';
import Pdfs from './Routes/Pdfs'
import Entidade from './Routes/Entidades'
import cookieParser from 'cookie-parser';
import Admin from './Routes/Admin';
import Deposito from './Routes/Deposito';
import "./Modules/Depositos";
import "./Modules/VerificaCartão";
import "./Modules/Lenvantamentos";
import { Request, Response } from 'express';

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
   });

app.get('/', (req:Request, res:Response) => {
    res.send('API  funcionando');	
});

app.use('/cliente', cliente);
app.use('/login',login);
app.use('/adesao',adessao);
app.use('/trasacao',trasacao);
app.use('/openacount',openAccount);
app.use('/login',login);
app.use('/adesao',adessao);
app.use('/trasacao',trasacao);
app.use('/conta',Conta);
app.use('/entidade',Entidade);
app.use('/pdf',Pdfs);
app.use('/admin',Admin)
app.use('/deposito',Deposito);



app.listen(port, () => {
    console.log('Server is running on port 5000');
});  

//Alteracoes

/**
 * Coloquei o openaccount em minusculo
 * 
 */