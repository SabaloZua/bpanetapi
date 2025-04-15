import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { formatarmoeda } from '../Utils/Moeda'
const prisma = new PrismaClient();
export default class Admin {

	public buscardados = async (req: Request, res: Response): Promise<void> => {
		try {
			// Número total de clientes e transações
			const totalClientes = await prisma.cliente.count();
			const totalTransacoes = await prisma.trasacao.count();

			// Soma dos valores das transações (assumindo que t_credito e t_debito são números em formato string)
			const transacoes = await prisma.trasacao.findMany({
				select: { t_credito: true, t_debito: true }
			});
			let valorTotalTransacoes = 0;
			transacoes.forEach(tx => {
				if (tx.t_credito) valorTotalTransacoes += parseFloat(tx.t_credito) || 0;
				if (tx.t_debito) valorTotalTransacoes += parseFloat(tx.t_debito) || 0;
			});

			// Calcular a percentagem de contas ativas (assumindo que t_estado === "Activa" indica conta ativa)
			const contasAtivas = await prisma.conta.count({
				where: { t_estado: "Activa" }
			});
			const totalContas = await prisma.conta.count();
			const percentagemContasAtivas = totalContas > 0 ? (contasAtivas / totalContas) * 100 : 0;

			const dados= {
				valorTotalTransacoes:formatarmoeda(valorTotalTransacoes),
				totalClientes,
				totalTransacoes,
				percentagemContasAtivas
			}

			res.status(200).json({dados:dados});
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Erro ao obter estatísticas" });
		}
	}

	public getDadosCliente = async (req: Request, res: Response): Promise<void> => {
		try {
			const clientes = await prisma.cliente.findMany({
				select: {
					t_nomeclient: true,
					client_email: {
						select: { t_email_address: true }
					},
					conta: {
						select: { t_numeroconta: true, t_Iban: true }
					}
				}
			});

			// Mapeia o resultado para retornar um único email e conta (primeiro elemento de cada array)
			const resultado = clientes.map(cliente => ({
				nome: cliente.t_nomeclient,
				email: cliente.client_email[0]?.t_email_address || null,
				numeroConta: cliente.conta[0]?.t_numeroconta || null,
				iban: cliente.conta[0]?.t_Iban || null
			}));

			res.status(200).json(resultado);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Erro ao obter dados do cliente" });
		}
	}

	public bloquearConta = async (req: Request, res: Response): Promise<void> => {
		try {
			const { idConta } = req.body;
			if (!idConta) {
				res.status(400).json({ error: "O id da conta é obrigatório" });
			}
			const contaBloqueada = await prisma.conta.update({
				where: { n_Idconta: idConta },
				data: { t_estado: "Bloqueada" }
			});
			res.status(200).json({ mensagem: "Conta bloqueada com sucesso", conta: contaBloqueada });
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Erro ao bloquear conta" });
		}
	}

	public getTransacoes = async (req: Request, res: Response): Promise<void> => {
		try {
			const transacoes = await prisma.trasacao.findMany();
			const resultado = transacoes.map(trans => {
				const valor = parseFloat(trans.t_credito || trans.t_debito || "0");
				return { 
					...trans, 
					valorTransacaoFormatada: formatarmoeda(valor) 
				};
			});
			res.status(200).json(resultado);
		} catch (error) {
			console.error(error);
			res.status(400).json({ error: "Erro ao obter transações" });
		}
	}
}