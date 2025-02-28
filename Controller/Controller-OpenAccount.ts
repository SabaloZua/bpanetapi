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
            res.status(201).json({ message: 'Email de Verificação enviado verifique a sua caixa de entrada' })

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

        res.redirect('http://localhost:3000/cadastro')
    }
    public createclient = async (req: Request, res: Response): Promise<void> => {
        try {

            const { nomecliente, emailcliente, telefonecliente, datanasci, numerobi, ocupacao, rua, municipio, bairro } = req.body;

            if (await this.verificaridade(datanasci)) {
                try {
                    const result = await axios.get(`https://www.sepe.gov.ao/ao/actions/bi.ajcall.php?bi=${numerobi}`);
                    if (result.data.sucess) {
                        let biNome = result.data.data.nome;
                        biNome = biNome.trim().replace(/\s/g, "");
                        if (biNome != nomecliente.trim().replace(/\s/g, "")) {
                            res.status(200)
                                .json({ message: "Introduza o nome conforme consta no seu BI!" });
                            return;
                        }

                        const morada = await prisma.morada.create({
                            data: {
                                t_bairro: bairro,
                                t_municipio: municipio,
                                t_rua: rua
                            }
                        })

                        const cliente = await prisma.cliente.create({
                            data: {
                                t_nomeclient: nomecliente,
                                t_datanasci: datanasci,
                                t_ocupacao: ocupacao,
                                t_BI: numerobi,
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
                                    t_email_address: emailcliente
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
                                    n_numero: parseInt(telefonecliente),
                                    t_descricao: 'principal',
                                    cliente: {
                                        connect: {
                                            n_Idcliente: cliente.n_Idcliente
                                        }
                                    }
                                }
                            })
                        ]);
                        res.json({ message: 'Cliente criado com sucesso' });
                        return;
                    } else {
                        res.status(400).json({ message: "BI não cadastrado nos serviços de identificação do MINJUD!" })
                    }

                }
                catch (err) {
                    const morada2 = await prisma.morada.create({
                        data: {
                            t_bairro: bairro,
                            t_municipio: municipio,
                            t_rua: rua
                        }
                    })

                    const cliente2 = await prisma.cliente.create({
                        data: {
                            t_nomeclient: nomecliente,
                            t_datanasci: datanasci,
                            t_ocupacao: ocupacao,
                            t_BI: numerobi,
                            morada: {
                                connect: {
                                    n_Idmorada: morada2.n_Idmorada
                                }
                            }
                        }
                    })
                    const [client_email2, numerotelefone2] = await Promise.all([
                        prisma.client_email.update({
                            where: {
                                t_email_address: emailcliente
                            },
                            data: {
                                cliente: {
                                    connect: {
                                        n_Idcliente: cliente2.n_Idcliente
                                    }
                                }
                            }
                        }),
                        prisma.telefone.create({
                            data: {
                                n_numero: parseInt(telefonecliente),
                                t_descricao: 'principal',
                                cliente: {
                                    connect: {
                                        n_Idcliente: cliente2.n_Idcliente
                                    }
                                }
                            }
                        })
                    ]);
                    res.json({ message: 'Cliente criado com sucesso' });

                }

            }

            else {
                res.status(400).json({ message: "menor de idade" })
            }

        } catch (erro) {
            res.status(500).json({ message: `ocorreu um erro ${erro}` })
        }
    }

    public generatecredentias = async (req: Request, res: Response): Promise<void> => {
        try {

            const numeroAdessao = numeroadessao();
            const createAccessCode = codigodeacesso();
            const acessCodeHash = await this.encrypt(createAccessCode.toString());
            const email=req.body.email;
            const navegador=req.body.navegador;
            const sistemaoperativo=req.body.sistemaoperativo;
            const iddispositivo=req.body.iddispositivo

            const client_email = await prisma.client_email.findFirst({
                where: {
                    t_email_address: email
                },
                select: {
                    n_Idcliente: true,
                    t_email_address: true
                }
            })
            await prisma.cliente.update({
                where: { n_Idcliente: client_email?.n_Idcliente || 0 },
                data: {
                    n_adesao: numeroAdessao,
                    t_password: acessCodeHash
                }
            })
            const account = await prisma.conta.create({
                data: {
                    t_numeroconta: numeroconta(),
                    t_Iban: createIBAN(),
                    cliente: { connect: { n_Idcliente: client_email?.n_Idcliente || 0 } },
                    tipo_cota: { connect: { n_Idtipoconta: 1 } },
                    t_Nba: createIBAN(),
                    t_estado: "Ativo",
                    n_saldo: 0.00,
                    t_dataAbertura: formatDate(new Date())
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
                        cliente: { connect: { n_Idcliente: client_email?.n_Idcliente || 0 } },
                        t_navegador: navegador,
                        t_sistemaoperativo: sistemaoperativo
                    }
                })
            ]);

            sendcrendetias(client_email?.t_email_address, account.t_numeroconta, account.t_Iban, card.t_numero, numeroAdessao.toString(), createAccessCode.toString())
                .catch(err => console.error("Erro ao enviar credenciais:", err));


            res.status(200).json({
                message: "As suas credenciais já foram enviadas para o seu email!",
            });
        } catch (error) {
            res.status(400).json({
                message: "erro ao processar a solicitação Tenete novamente mais tarde"

            })
        }

    }
}

