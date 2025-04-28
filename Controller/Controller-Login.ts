import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { sendcodigo2fa } from '../Modules/Send2fa'
import { sendalert } from '../Modules/SendAlert'
import { pid } from "process";

const bcrypt = require('bcrypt');
const prisma = new PrismaClient();


export default class CredenciaisController {

    private compareHas = async (NormalCode: string, CodeHash: string | null,) => {
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

    public generate2fa = async (req: Request, res: Response): Promise<void> => {
        try {

            const numeroadessao: number = parseInt(req.body.numeroAdesao);
            const accessCode: string = req.body.codigoAcesso
            const usuario = await prisma.usuario.findFirst({
                where: {
                    n_adesao: numeroadessao
                },
                select: {
                    t_password: true,
                    n_id_usuario: true,
                    conta: {
                        select: {
                            n_Idcliente: true
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
                   await sendcodigo2fa(client_email.t_email_address, codigo2fa)
                        .catch(err => console.error("Erro ao enviar código 2FA:", err));
                    res.status(200).json({ message: "Email enviado para a sua caixa de entrada. Por favor verifique" });
                }

            } else {
                res.status(400).json({ message: "Codigo de acesso  inválido " })
            }

        } catch (error) {
            res.status(400).json({ message: `Erro ao gerar o código 2FA Tentar novamente mais tarde ${error} ` })
        }
    }
    public async verify2fa(req: Request, res: Response): Promise<void> {
        try {
            const codigo2fa: string = req.body.codigo2fa;

            const client = await prisma.usuario.findFirst({
                where: {
                    t_codigo2fa: codigo2fa.toString()
                },
                select: {
                    t_codigo2fa:true,
                    conta: {
                        select: {
                            n_Idconta: true
                        }
                    }

                }
            });

            if (client) {
                    // sempre que ele faz o Login o sistema envia o id da conta e se é o primeiro Login true ou false
                    res.status(200).json({ message: "Autenticação concluida!", contaid: client.conta.n_Idconta})
                
            } else {
                res.status(400).json({ message: "Código 2FA inválido" })
            }
        } catch (erro) {
            res.status(400).json({ message: "Erro ao processar a sua solicitação tente mais tarde" })
        }

    }

    public verificalogin =async(req: Request, res: Response): Promise<void> =>{
       try{
        const codigo2fa=req.params.codigo2fa
        const usuario= await prisma.usuario.findFirst({
            where:{
                t_codigo2fa:codigo2fa
            },
            select:{
                t_primeiroLogin:true,
                n_id_usuario:true,
                n_Idconta:true
            }  
        })
        if(!usuario){
            res.status(400).json({ message: "Código 2FA inválido" });
            return;
        }
        await prisma.usuario.update({where:{n_id_usuario:usuario?.n_id_usuario},data:{t_codigo2fa:"" } })
        res.status(200).json({contaid:usuario.n_Idconta,primeirologin:usuario?.t_primeiroLogin})
    }catch(error){
        res.status(400).json({message:"Erro ao processar a solicitação"})
    }
    }

    // rota do primeiro login
    public primeirologin = async (req: Request, res: Response): Promise<void> => {
        try {
            const idconta = req.body.idconta
            const codigoacesso = req.body.codigoacesso;
            const pergunta = req.body.pergunta;
            const resposta: string = req.body.resposta;

            const codigoacessoHash = await this.encrypt(codigoacesso)
            const respostaformatada = resposta.toLowerCase().trim().replace(/\s/g, "")

            // actualiza a senha do usuario
            await prisma.usuario.update({
                where: {
                    n_Idconta: parseInt(idconta)
                },
                data: {
                    t_password: codigoacessoHash.toString(),
                    t_primeiroLogin: false
                }
            })

            // cria a pergunta de segurança
            await prisma.perguntaSeguranca.create({
                data: {
                    t_pergunta: pergunta,
                    t_resposta: respostaformatada.toString(),
                    conta: {
                        connect: { n_Idconta: parseInt(idconta) }
                    }
                }
            })
            res.status(200).json({ message: 'Dados Actualizados com sucesso' })

        }
        catch (erro) {
            res.status(400).json({ message: "Erro ao processar a sua solicitação tente mais tarde" });
        }
    }

    public verificarResposta=async (req:Request,res:Response): Promise<void>=>{
        try{
        const resposta=req.body.resposta;
        const respostaformatada = resposta.toLowerCase().trim().replace(/\s/g, "")
        const iddispositivo=req.body.iddispositivo;
        const idusuario=req.body.idusuario || 0
        const conta = await prisma.usuario.findFirst({
            where: { n_id_usuario: parseInt(idusuario) },
            select: { n_Idconta: true }
        });

        if (conta) {
            const confirmaResposta = await prisma.perguntaSeguranca.findFirst({
                where: { t_resposta: respostaformatada, n_Idconta: conta.n_Idconta }
            });
            if(confirmaResposta){
               await prisma.dispositivo.create({
                    data:{
                        t_Iddispositivo:iddispositivo,
                        n_id_usuario:parseInt(idusuario)
                    }
                })

                await prisma.conta.update({
                    where:{n_Idconta:conta.n_Idconta},
                    data:{
                        t_estado:'Activa'
                    }
                })
                res.status(200).json({message:"Dados confimados com sucesso"})
            }else{
                res.status(400).json({message:"Respotas incorrecta"})
            }
        }

        }catch(erro){
            res.status(400).json({message:"erro ao processar a sua solicitação"})
        }
    }

    public buscarPergunta=async (req:Request,res:Response):Promise<void>=>{
        try{
        const idusuario=parseInt(req.params.idusuario);

        const conta=await prisma.usuario.findFirst({
            where:{
                n_id_usuario:idusuario
            },
            select:{n_Idconta:true}
        })
        const pergunta= await prisma.perguntaSeguranca.findFirst({
            where:{
                n_Idconta:conta?.n_Idconta
            },
            select:{
                t_pergunta:true
            }
        })
            res.status(200).json({pergunta:pergunta?.t_pergunta})

        }catch(erro){
            res.status(400).json({message:"Erro ao processar a solicitação"})
        }
    } 


   
}