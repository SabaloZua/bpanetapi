import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { SendCodigo2fa } from '../Modules/Send2fa'
import {SendAlert} from '../Modules/SendAlert'

const bcrypt = require('bcrypt');
const prisma = new PrismaClient();


export default class CredenciaisController {

    private  compareHas=async(NormalCode: string, CodeHash: string | null,)=>{
        const response = await bcrypt.compare(NormalCode, CodeHash);
        if (response) {
            return true;
        }
        return false;
    }

    private async encrypt(OTP: string): Promise<string> {
        const salt = await bcrypt.genSalt(12);
        const OTPHash = await bcrypt.hash(OTP, salt);
        return OTPHash;
    }
    private generatecodigo2fa(): number {
        return Math.floor(Math.random() * 900000) + 100000
    }

    public  generate2fa= async(req: Request, res: Response): Promise<void> => {
        try {

            const numeroadessao: number = parseInt(req.body.numeroadessao);
            const accessCode: string = req.body.accessCode;
            const client = await prisma.cliente.findFirst({
                where: {
                    n_adesao: numeroadessao
                },
                select: {
                    n_Idcliente: true,
                    t_password: true
                }
            });


            if (!client) {
                res.status(400).json({ message: "Número de adesão inválido " })
                return;
            }
            if (await this.compareHas(accessCode, client.t_password)) {
                const codigo2fa = this.generatecodigo2fa().toString();
                await prisma.cliente.update({
                    where: { n_Idcliente: client?.n_Idcliente },

                    data: { t_codigo2fa: codigo2fa }

                })
                const client_email = await prisma.client_email.findFirst({
                    where: {
                        n_Idcliente: client?.n_Idcliente,
                    },
                    select: {
                        t_email_address: true
                    }
                });

                if (client_email) {
                     SendCodigo2fa(client_email.t_email_address, codigo2fa)
                     .catch(err => console.error("Erro ao enviar código 2FA:", err));
                    res.status(201).json({ message: "Email enviado para a sua caixa de entrada. Por favor verifique" }) ;
                }

            } else {
                res.status(400).json({ message: "Codigo de acesso  inválido " })
            }

        } catch (error) {
            res.status(400).json({ message: `Erro ao gerar o código 2FA Tentar novamente mais tarde ${error} ` })
        }
    }
    public async verify2fa(req: Request, res: Response): Promise<void> {
        const codigo2fa: string = req.body.codigo2fa;
        const idDispositivo:string = req.body.idDispositivo;    
        const sitemaDispositvo:string = req.body.sistemaDispositivo;
        const navegadorDispositivo:string = req.body.navegadorDispositivo;
        
        const client = await prisma.cliente.findFirst({
            where: {
                t_codigo2fa: codigo2fa.toString()
            },
            select: {
                n_Idcliente: true

            }
        }); 



        if(client){
            const [client_email, dispositivo] = await Promise.all([
                prisma.client_email.findFirst({
                    where: { n_Idcliente: client?.n_Idcliente },
                    select: { t_email_address: true }
                }),
                prisma.dispositivo.findFirst({
                    where: { n_Idcliente: client?.n_Idcliente, t_Iddispositivo: idDispositivo }
                })
            ]);
            
        if(!dispositivo){
            const contaId = await prisma.conta.findFirst({
                where:{
                    n_Idcliente:client?.n_Idcliente},
               select:{
                     n_Idconta:true
               }
            })
            const conta =await prisma.conta.update({
                where:{
                    n_Idconta:contaId?.n_Idconta
                },
                data:{
                    t_estado:"Pendente"
                }
            })
            if(client_email){
                 SendAlert(client_email.t_email_address,navegadorDispositivo,sitemaDispositvo)
            }
            res.status(200).json({message:"Dispositivo desconhecido",user:client?.n_Idcliente})
        }else{
            res.status(200).json({message:"Autenticação concluida!",user:client?.n_Idcliente})
        }
    }else{
        res.status(400).json({message:"Código 2FA inválido"})
    }
}

}