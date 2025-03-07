import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default class Conta {

    public  getalldata=async(req: Request, res: Response): Promise<void> =>{
        const id:number = parseInt(req.params.idconta);
       const data= await prisma.conta.findUnique({
              where:{
                 n_Idconta:id
              }, 
              select:{
                n_Idconta:true,
                n_saldo:true,
                t_Iban:true,
                t_estado:true,
                t_Nba:true,
                t_dataAbertura:true,
                t_numeroconta:true,
                n_Idtipoconta:true,
                cartao:true,
                cliente:
              {
                select:{
                  t_nomeclient:true,
                  t_BI:true,
                  client_email:{
                    select:{
                      t_email_address:true
                    }
                  },
                }  
              },
             }
         });
            if(!data){
                res.status(404).json({message: 'Cliente não encontrado'});
                return;
            }
          
            res.json({dados:data});     
    }
}