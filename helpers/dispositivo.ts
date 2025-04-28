import { Request, Response, NextFunction } from "express";
import { PrismaClient } from '@prisma/client';
import { sendalert } from '../Modules/SendAlert'
import 'dotenv/config'
const prisma = new PrismaClient();


export const dispositivo = async (req: Request, res: Response, next: NextFunction) => {
    try{
    const codigo2fa: string = req.body.codigo2fa;
    const iddispositivo: string = req.body.iddispositivo;
    const sitemaDispositvo: string = req.body.sistemadispositivo;
    const navegadorDispositivo: string = req.body.navegadordispositivo;
    const BPAapi=process.env.bpaAPI //
    const BPAfront=process.env.bpaFront//
    const client = await prisma.usuario.findFirst({
        where: {
            t_codigo2fa: codigo2fa.toString()
        },
        select: {
            n_id_usuario: true,
            conta: {
                select: {
                    n_Idconta: true,
                    cliente: {
                        select: {
                            n_Idcliente: true
                        }
                    }
                }
            }

        }
    });


    if (client) {
        const dispositivo = await prisma.dispositivo.findFirst({
                where: { n_id_usuario: client?.n_id_usuario, t_Iddispositivo: iddispositivo }
            })


        if (!dispositivo) {

            const client_email = await prisma.client_email.findFirst({
                where: { n_Idcliente: client?.conta.cliente.n_Idcliente },
                select: { t_email_address: true }
            });

            const conta = await prisma.conta.update({
                where: {
                    n_Idconta: client.conta?.n_Idconta
                },
                data: {
                    t_estado: "pendente"
                }
            })

            if (client_email) {
                const urlSim = `${BPAfront}/confirmar?dispositivo=${iddispositivo}&usuario=${client.n_id_usuario}`

               await sendalert(client_email.t_email_address, navegadorDispositivo, sitemaDispositvo, urlSim)
        
            }
            res.status(400).json({ message: "Tentativa de iniciar sessão em um Dispositivo desconhecido responda ao email enviado para confirmar a sua identidade" })
            return;
        } 
          
        
    }else{
        res.status(400).json({ message: "Código 2FA inválido" })
        return;
    }
    next();
}catch(erro){
    res.status(400).json({message:"Erro ao processar a solicitação"});
}

}