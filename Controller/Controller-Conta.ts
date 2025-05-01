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
            images_cliente: {
              select: {
                t_caminho:true
              	}
            }
          },
        },
      },
    });
    if (!data) {
      res.status(404).json({ message: "Cliente não encontrado" });
      return;
    }

    const formatedData = {
      
        id:data?.n_Idconta,
        iban:data?.t_Iban,
        saldo:data?.n_saldo,
        nba:data?.t_Nba,
        dataAbertura:data?.t_dataAbertura,
        numeroConta:data?.t_numeroconta,
      

      cartao:{
        idCartao:data?.cartao[0]?.n_Idcartao,
        descricao:data?.cartao[0]?.t_descricao,
        dataValidade:data?.cartao[0]?.t_datavalidade,
        estado:data?.cartao[0]?.t_estado,
        numero:data?.cartao[0]?.t_numero,
      },

      cliente:{
        nome:data?.cliente.t_nomeclient,
        bi:data?.cliente?.t_BI,
        email:data?.cliente.client_email[0]?.t_email_address,
        imagem:data?.cliente.images_cliente[0]?.t_caminho,
      }
    };

    res.json({ dados: formatedData });
  }catch(err){
    console.error("Erro ao buscar dados:", err);
    res.status(400).json({message:err})
  }
  };
  public blouquarcartao=async (req:Request,res:Response): Promise <void> =>{
    const numerocartao=req.body.numerocartao;

    if(!numerocartao){
      res.status(400).json({message:'dados vazios'});
      return;
    }
    const cartão=await prisma.cartao.findFirst({
      where:{
        t_numero:numerocartao
      },
      select:{
        n_Idcartao:true
      }
    })
    await prisma.cartao.update({
      where:{
        n_Idcartao:cartão?.n_Idcartao
      },
      data:{
        t_estado:"bloqueado"
      }
    })
    res.status(200).json({message:"Cartão bloqueado com sucesso"});

  }

}