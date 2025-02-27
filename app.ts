import express from 'express';
import cliente from './Routes/Cliente'
import OpenAccount from './Routes/OpenAccount'
import Adessao from './Routes/Adesao'
import Login from './Routes/Login'
import Trasacao from './Routes/Trasancao';
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));


app.use('/cliente', cliente);
app.use('/Openacount',OpenAccount);
app.use('/login',Login);
app.use('/adesao',Adessao);
app.use('/trasacao',Trasacao);

app.listen(port, () => {
    console.log('Server is running on port 5000');
});  