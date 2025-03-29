import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default class Conta {
  public getalldata = async (req: Request, res: Response): Promise<void> => {
    try{
    const id: number = parseInt(req.params.idconta);
    const data = await prisma.conta.findUnique({
      where: {
        n_Idconta: id,
      },
      select: {
        n_Idconta: true,
        n_saldo: true,
        t_Iban: true,
        t_estado: true,
        t_Nba: true,
        t_dataAbertura: true,
        t_numeroconta: true,
        cartao: true,
        cliente: {
          select: {
            t_nomeclient: true,
            t_BI: true,
            client_email: {
              select: {
                t_email_address: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      res.status(404).json({ message: "Cliente não encontrado" });
      return;
    }

    const formatedData = {
      
        id:data.n_Idconta,
        iban:data.t_Iban,
        saldo:data.n_saldo,
        nba:data.t_Nba,
        dataAbertura:data.t_dataAbertura,
        numeroConta:data.t_numeroconta,
      

      cartao:{
        idCartao:data.cartao[0].n_Idcartao,
        descricao:data.cartao[0].t_descricao,
        dataValidade:data.cartao[0].t_datavalidade,
        estado:data.cartao[0].t_estado,
        numero:data.cartao[0].t_numero,
      },

      cliente:{
        nome:data.cliente.t_nomeclient,
        bi:data.cliente.t_BI,
        email:data.cliente.client_email
      }
    };

    res.json({ dados: formatedData });
  }catch(err){
    res.status(400).json({message:err})
  }
  };
}