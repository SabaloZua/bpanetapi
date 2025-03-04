import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { sendcodigo2fa } from '../Modules/Send2fa'
import {sendalert} from '../Modules/SendAlert'

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
            const accessCode: string = req.body.accesscode;
            const usuario = await prisma.usuario.findFirst({
                where: {
                    n_adesao: numeroadessao
                },
                select: {
                    t_password: true,
                    n_id_usuario:true,
                    conta:{
                        select:{
                            n_Idcliente:true
                        }
                    }
                }
            });


            if (!usuario) {
                res.status(400).json({ message: "Número de adesão inválido " })
                return;
            }
            if (await this.compareHas(accessCode.toString(), usuario.t_password)) {
                const codigo2fa = this.generatecodigo2fa().toString();
                await prisma.usuario.update({
                    where: { n_id_usuario: usuario?.n_id_usuario },

                    data: { t_codigo2fa: codigo2fa }

                })
                const client_email = await prisma.client_email.findFirst({
                    where: {
                        n_Idcliente: usuario?.conta.n_Idcliente,
                    },
                    select: {
                        t_email_address: true
                    }
                });

                if (client_email) {
                    sendcodigo2fa(client_email.t_email_address, codigo2fa)
                     .catch(err => console.error("Erro ao enviar código 2FA:", err));
                    res.status(200).json({ message: "Email enviado para a sua caixa de entrada. Por favor verifique" }) ;
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
        const iddispositivo:string = req.body.iddispositivo;    
        const sitemaDispositvo:string = req.body.sistemadispositivo;
        const navegadorDispositivo:string = req.body.navegadordispositivo;
        
        const client = await prisma.usuario.findFirst({
            where: {
                t_codigo2fa: codigo2fa.toString()
            },
            select: {
                n_id_usuario:true,
                conta:{
                    select:{
                        n_Idconta:true,
                        cliente:{
                            select:{
                                n_Idcliente:true
                            }
                        }
                    }
                }

            }
        }); 



        if(client){
            
            const dispositivo= await prisma.dispositivo.findFirst({
                    where: { n_id_usuario: client?.n_id_usuario, t_Iddispositivo: iddispositivo }
                });
            
        if(!dispositivo){
            
          const client_email= await prisma.client_email.findFirst({
                where: { n_Idcliente: client?.conta.cliente.n_Idcliente },
                select: { t_email_address: true }
            });

            const conta =await prisma.conta.update({
                where:{
                    n_Idconta:client.conta?.n_Idconta
                },
                data:{
                    t_estado:"pendente"
                }
            })

            if(client_email){
                sendalert(client_email.t_email_address,navegadorDispositivo,sitemaDispositvo)
            }
            
            res.status(200).json({message:"Dispositivo desconhecido",contaid:client.conta.n_Idconta})
        }else{
            res.status(200).json({message:"Autenticação concluida!",contaid:client.conta.n_Idconta})
        }
    }else{
        res.status(400).json({message:"Código 2FA inválido"})
    }
}

}