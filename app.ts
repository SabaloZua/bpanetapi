import express from 'express';
import cliente from './Routes/Cliente'
import openAccount from './Routes/OpenAccount'
import adessao from './Routes/Adesao'
import login from './Routes/Login'
import trasacao from './Routes/Trasancao';
import Conta from './Routes/Conta';
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
   });
   
app.use('/cliente', cliente);
app.use('/openacount',openAccount);
app.use('/login',login);
app.use('/adesao',adessao);
app.use('/trasacao',trasacao);
app.use('/conta',Conta);

app.listen(port, () => {
    console.log('Server is running on port 5000');
});  