import express from 'express';
 import ContaController from '../Controller/Controller-Conta';
const Router = express.Router();
const Controller = new ContaController();

// retorna todos os dados da conta cartão e nome,BI e email do cliente
// essa rota vai ser usada apos o login para pegar os dados do usuario e armazernar no localSotera ou Zustand 
// fica a toa escolha.
/*
    Exemplo da saida 
    {
  "dados": {
    "n_Idconta": 11,
    "n_saldo": 8000,
    "t_Iban": "AO06006000079667179340768",
    "t_estado": "pendente",
    "t_Nba": "AO06006000083124654193202",
    "t_dataAbertura": "2025-03-02",
    "t_numeroconta": "543583084.30.001",
    "n_Idtipoconta": 2,
    "cartao": [
      {
        "n_Idcartao": 11,
        "t_descricao": "Cartão de Debito",
        "t_datavalidade": "2027-12-31",
        "n_Idconta": 11,
        "t_estado": "Ativo",
        "t_numero": "5720292099891461"
      }
    ],
    "cliente": {
      "t_nomeclient": "SABALO ZEFERINO ZUA",
      "t_BI": "009150453",
      "client_email": [
        {
          "t_email_address": "sabalovieira@gmail.com"
        }
      ]
    }
  }
}
*/ 
Router.get('/dadoscliente/:idconta',Controller.getalldata)
Router.post('/cartao/bloquear',Controller.blouquarcartao);

export default Router; 