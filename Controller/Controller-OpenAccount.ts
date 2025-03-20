import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');
import crypto from 'crypto'
import axios from "axios";
import { sendcrendetias } from '../Modules/SendCredentias'
import { sendeemailverfy } from '../Modules/SendEmailVerify';
import {numerocartao, codigodeacesso, numeroadessao,createIBAN,numeroconta} from '../Utils/Codigos';
import {formatDate} from '../Utils/Datas'
const prisma = new PrismaClient();


export default class CredenciaisController {

    private async encrypt(pin: string) {
        const salt = await bcrypt.genSalt(12);
        const OTPHash = await bcrypt.hash(pin, salt);
        return OTPHash;
    }

    private verificaridade = async (dataString: string): Promise<boolean> => {
        const dataNascimento = new Date(dataString);
        const dataAtual = new Date();

        const idade = dataAtual.getFullYear() - dataNascimento.getFullYear();
        if (idade >= 18) {
            return true
        }
        return false
    }

    public sendvalideemail = async (req: Request, res: Response): Promise<void> => {
        const email = req.body.email;
        const result = await prisma.client_email.findFirst({
            where: { t_email_address: email },
            select: { t_verified: true, n_email_id: true, n_Idcliente: true }
        })
        if (result && result?.t_verified) {
            res.status(400).json({ message: "O email já está associado a uma conta" })
            return;
        }
        try {
            const token = crypto.randomBytes(32).toString('hex');
            const url = `http://localhost:5000/openacount/validatemail/${email}/${token}`
            await prisma.client_email.create({
                data: {
                    t_email_address: email,
                    t_verified: false,
                    t_token: token,
                }
            })
            sendeemailverfy(email, url)
                .catch(err => console.error("Erro ao enviar código 2FA:", err));
            res.status(200).json({ message: 'Email de Verificação enviado verifique a sua caixa de entrada' })

        } catch (erro) {
            res.status(400).json({ message: erro })
        }
    }
    public valideteemail = async (req: Request, res: Response): Promise<void> => {
        const Usertolken = req.params.tolken;
        const email = req.params.email;

        const result = await prisma.client_email.findFirst({
            where: {
                t_email_address: email, AND: { t_token: Usertolken }
            },
            select: {

                t_verified: true,

            }

        })

        if (!result || result.t_verified == true) {
            res.redirect('http://localhost:3000/token-expired');
            return;
        }
        const updateClienteEmail = await prisma.client_email.update({
            where: {
                t_email_address: email
            },
            data: {
                t_verified: true,
                t_token: ""
            }
        })

        res.redirect('http://localhost:3000/registo/tipo-conta')
    }


    public verificaDadosPessoais = async (req: Request, res:Response): Promise<void> => {
        const {numeroBi, dataNascimento, nomeCliente} = req.body;
        const  vifirybi=await prisma.cliente.findFirst({
            where:{t_BI:numeroBi.toString()}
        })

        if(vifirybi){
            res.status(400).json({message:'Este número do BI já se encontra associado a outra conta'});
            return;
        }

        if (await this.verificaridade(dataNascimento)) 
        {
            try {
                //Quando testei com o meu numero de bi 009084648LA043 nao estava a retornar dados. Isso significa que a api esta com algumas limitacoes. Poderiamos simplesmente nao verificar se o BI pertence ao Minjud, mas nos casos em que ele retornar os dados (como no caso do bi do Pascoal) podemos aproveitar para verificar os nomes (so nos casos em que a api retornar dados)
                const result = await axios.get(`https://www.sepe.gov.ao/ao/actions/bi.ajcall.php?bi=${numeroBi}`);
                
                if(result.data.sucess){
                   
                    
                    let biNome = result.data.data.nome;
                    
                    biNome = biNome.trim().replace(/\s/g, "");
                    
                  
                    if(biNome !== nomeCliente.trim().replace(/\s/g, "")) {

                        res.status(400).json({ message: "Introduza o nome conforme consta no seu BI!" });
                        
                    }else{
                        res.status(200).json({ message: 'Dados verificados com sucesso' });
                    }

                }else{
                    res.status(400).json({ message: "BI não cadastrado nos serviços de identificação do MINJUD!" })
                }


                
            } catch (error) {
                const  vifirybi2=await prisma.cliente.findFirst({
                    where:{t_BI:numeroBi.toString()}
                })

                if(vifirybi2){
                    res.json(400).json('Este numero do BI já se encontra associado a outra conta');
                    return;
                }
            }
        }
        else 
        {
            res.status(400).json({ message: "Menor de idade" })
        }

     
    }

   

    public generatecredentias = async (req: Request, res: Response): Promise<void> => {
        try {

            const { nomeCliente, emailCliente, telefone, dataNascimento, numeroBi, idTipoConta, local, areaActividade, municipio } = req.body;

            const morada = await prisma.morada.create({
                 data: {
                     t_municipio: municipio,
                
                    }
                })


            
            const cliente = await prisma.cliente.create({
                data: {
                    t_nomeclient: nomeCliente,
                    t_datanasci: dataNascimento,
                    t_BI: numeroBi,
                    morada: {
                        connect: {
                            n_Idmorada: morada.n_Idmorada
                        }
                    }
                }
            })
            const [client_email, numerotelefone] = await Promise.all([
                prisma.client_email.update({
                    where: {
                        t_email_address: emailCliente
                    },
                    data: {
                        cliente: {
                            connect: {
                                n_Idcliente: cliente.n_Idcliente
                            }
                        }
                    }
                }),
                prisma.telefone.create({
                    data: {
                        n_numero: parseInt(telefone),
                        t_descricao: 'principal',
                        cliente: {
                            connect: {
                                n_Idcliente: cliente.n_Idcliente
                            }
                        }
                    }
                })
            ]);

            const numeroAdessao = numeroadessao();
            const createAccessCode = codigodeacesso();
            const acessCodeHash = await this.encrypt(createAccessCode.toString());
            const numeroConta= numeroconta()
            const IBAN=createIBAN(numeroConta.substring(0,9))
            const navegador=req.body.navegador;
            const sistemaoperativo=req.body.sistemaoperativo;
            const iddispositivo=req.body.iddispositivo
            const clientEmail = await prisma.client_email.findFirst({
                where: {
                    t_email_address: emailCliente
                },
                select: {
                    n_Idcliente: true,
                    t_email_address: true
                }
            })
          
            const account = await prisma.conta.create({
                data: {
                    t_numeroconta:numeroConta,
                    t_Iban:IBAN ,
                    cliente: { connect: { n_Idcliente: clientEmail?.n_Idcliente || 0 } },
                    tipo_cota: { connect: { n_Idtipoconta: parseInt(idTipoConta) } },
                    t_Nba: IBAN.replace('AO06',""),
                    t_estado: "Ativo",
                    n_saldo: 0.00,
                    t_dataAbertura: formatDate(new Date()),
                    t_area: areaActividade,
                    t_local: local
                }
            })

          const usuario=  await prisma.usuario.create({
                data: {
                    n_adesao: numeroAdessao,
                    t_password: acessCodeHash,
                    conta:{
                        connect:{
                            n_Idconta:account.n_Idconta
                        }
                    }
                }
            })
            // Criação do cartão e dispositivo em paralelo
            const [card, dispositivo] = await Promise.all([
                prisma.cartao.create({
                    data: {
                        conta: { connect: { n_Idconta: account.n_Idconta } },
                        t_numero: numerocartao().toString(),
                        t_descricao: "Cartão de Debito",
                        t_datavalidade: '2027-12-31',
                        t_estado: "Ativo"
                    }
                }),
                prisma.dispositivo.create({
                    data: {
                        t_Iddispositivo: iddispositivo.toString(),
                        usuario: { connect: { n_id_usuario:usuario.n_id_usuario  || 0 } },
                        t_navegador: navegador,
                        t_sistemaoperativo: sistemaoperativo
                    }
                })
            ]);

            sendcrendetias(clientEmail?.t_email_address, account.t_numeroconta, account.t_Iban, card.t_numero, numeroAdessao.toString(), createAccessCode.toString())
                .catch(err => console.error("Erro ao enviar credenciais:", err));


            res.status(200).json({
                message: "As suas credenciais já foram enviadas para o seu email!",
            });
        } catch (error) {
            res.status(400).json({
                message: "erro ao processar a solicitação Tenete novamente mais tarde "+error

            })
        }

    }

   
}

