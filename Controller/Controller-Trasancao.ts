import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { formatarmoeda } from "../Utils/Moeda";
import { sendlevantamento } from "../Modules/SendCodeLenvatamento";
import { formatDate } from "../Utils/Datas";
import { codigoreferencia } from "../Utils/Codigos";
import { sendcodigo2fa } from "../Modules/Send2fa";
const prisma = new PrismaClient();

export default class Trasacao {
  private generatecodigo2fa(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  // tranferencia do mesmo banco
  public tranferenciaintrabancaria = async (req: Request, res: Response): Promise<void> => {
    const { idconta, contadestino, descricao, valor, benefeciario } = req.body;

    const contaFrom = await prisma.conta.findFirst({
      where: { n_Idconta: parseInt(idconta) },
      select: {
        n_saldo: true,
        n_Idconta: true,
        t_Iban: true,
        t_numeroconta: true,
        cliente: { select: { t_nomeclient: true } },
      },
    });
    const contaTO = await prisma.conta.findFirst({
      where: { t_numeroconta: contadestino.toString() },
      select: {
        n_saldo: true,
        n_Idconta: true,
      },
    });

    // verifica se a contaorigem existe
    if (contaFrom) {
      if (contaFrom.n_saldo < valor) {
        res.status(400).json({ message: "Saldo insuficiente" });
        return;
      }
      // verifica se a destino existe ou
      if (!contaTO || contadestino == contaFrom.t_numeroconta) {
        res
          .status(400)
          .json({ message: "erro ao solicitar sua operação tente outra vez mais tarde" });
        return;
      }
      try {
        const saldoactualizadoFrom = contaFrom?.n_saldo - parseFloat(valor);
        const saldoactualizadoTo = (contaTO?.n_saldo ?? 0) + parseFloat(valor);

        await Promise.all([
          // actuliza o saldo na conta origem
          prisma.conta.update({
            where: { n_Idconta: contaFrom.n_Idconta },
            data: { n_saldo: saldoactualizadoFrom },
          }),
          // actuliza o saldo na conta destino
          prisma.conta.update({
            where: { n_Idconta: contaTO?.n_Idconta },
            data: { n_saldo: saldoactualizadoTo },
          }),
        ]);

        const trasacaoFrom = await prisma.trasacao.create({
          data: {
            t_contadestino: contadestino,
            n_contaorigem: contaFrom.n_Idconta,
            t_descricao: descricao,
            t_datatrasacao: formatDate(new Date()),
            t_debito: valor,
            t_saldoactual: formatarmoeda(saldoactualizadoFrom),
            t_benefeciario: benefeciario.toString(),
          },
        });

        const trasacaoTO = await prisma.trasacao.create({
          data: {
            t_contadestino: "",
            n_contaorigem: contaTO.n_Idconta,
            t_descricao: descricao,
            t_datatrasacao: formatDate(new Date()),
            t_credito: valor,
            t_saldoactual: formatarmoeda(saldoactualizadoTo),
          },
        });

        res.status(200).json({
          message: "Trasacao efectuada com sucesso",
          saldoactualizado: saldoactualizadoFrom,
          idtransacao: trasacaoFrom.n_Idtrasacao,
        });

        return;
      } catch (erro) {
        res.status(400).json({ message: "Erro ao efectuar a trasacao" + erro });
        return;
      }
    } else {
      res.status(400).json({ message: "Erro ao efectuar a trasacao conta nao encontrada" });
      return;
    }
  };

  // trenferencia de  bancos diferentes
  public tranferenciainterbancaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idconta, contadestino, descricao, valor, benefeciario } = req.body;
      const contaFrom = await prisma.conta.findFirst({
        where: { n_Idconta: parseInt(idconta) },
        select: {
          n_saldo: true,
          n_Idconta: true,
          t_Iban: true,
          cliente: { select: { t_nomeclient: true } },
        },
      });

      if (contaFrom) {
        if (contaFrom.t_Iban == contadestino) {
          res.status(400).json({ message: "Não pode enviar denheiro para se mesmo" });
          return;
        }
        if (contaFrom.n_saldo < valor) {
          res.status(400).json({ message: "Saldo insuficiente" });
          return;
        }

        const saldoactualizadoFrom = contaFrom?.n_saldo - parseFloat(valor);

        await prisma.conta.update({
          where: { n_Idconta: contaFrom.n_Idconta },
          data: { n_saldo: saldoactualizadoFrom },
        });

        const trasacaoFrom = await prisma.trasacao.create({
          data: {
            t_contadestino: contadestino,
            n_contaorigem: contaFrom.n_Idconta,
            t_descricao: descricao,
            t_datatrasacao: formatDate(new Date()),
            t_debito: formatarmoeda(valor),
            t_saldoactual: formatarmoeda(saldoactualizadoFrom),
            t_benefeciario: benefeciario.toString(),
          },
        });

        res.status(200).json({
          message: "Trasacao efectuada com sucesso",
          saldoactualizado: saldoactualizadoFrom,
          idtransacao: trasacaoFrom.n_Idtrasacao,
        });
        return;
      } else {
        res
          .status(400)
          .json({ message: "erro ao realizar a trasação conta Origem não encontrada" });
      }
    } catch (erro) {
      res.status(400).json({ message: "Erro na solicitação tente mais tarde" + erro });
    }
  };
  public levantamento = async (req: Request, res: Response): Promise<void> => {
    const valor: number = parseInt(req.body.valor);
    const emaildestino = req.body.emaildestino;
    const idconta = req.body.idconta;
    const pin = req.body.pin;
    if(!valor || !emaildestino || !idconta || !pin) {
      res.status(400).json({ message: "Todos os campos são obrigatórios" });
    return
    }

    try {
      const conta = await prisma.conta.findFirst({
        where: {
          n_Idconta: parseInt(idconta),
        },
        select: {
          n_saldo: true,
          n_Idconta: true,
          cartao:{
            select:{
             t_estado:true,
            }
          }
        },
      });
      if (!conta) {
        res.status(400).json({ message: "Conta não encontrada" });
        return;
      }
      if (conta?.cartao[0].t_estado == "expirado") {
        res.status(400).json({ message: "Cartão expirado" });
        return;
      }
      if ((conta?.n_saldo || 0) < valor) {
        res.status(200).json({ message: "Saldo insuficiente" });
        return;
      }
      const saldoactualizado: number = (conta?.n_saldo || 0) - valor;

      const referencia = codigoreferencia().toString();
      console.log( valor);
      
      await prisma.conta.update({
        where: {
          n_Idconta: conta?.n_Idconta,
        },
        data: {
          n_saldo: saldoactualizado,
        },
      });

      const trasacao = await prisma.trasacao.create({
        data: {
          t_datatrasacao: formatDate(new Date()),
          t_debito: valor.toString(),
          t_descricao: "Levantamento Sem Cartão",
          t_saldoactual: formatarmoeda(saldoactualizado),
          n_contaorigem: conta?.n_Idconta || 0,
        },
      });
      const Levantamento = await prisma.levantamentoSemCartao.create({
        data: {
          n_Idconta: conta?.n_Idconta || 0,
          n_valor: valor,
          t_referencia: referencia,
          t_estado: "pendente",
          t_pin: pin.toString(),
        },
      });
      sendlevantamento(referencia, emaildestino);
      res.status(200).json({
        message: "Levantamento efectuado com sucesso",
        saldoactualizado: saldoactualizado,
        idtransacao: trasacao.n_Idtrasacao,
      });
    } catch (err) {
      res.status(400).json({ status: false, message: "Erro ao efectuar o levantamento"+err });
    }
  };

  // transações  com filtros de data
  public getTrasacao = async (req: Request, res: Response): Promise<void> => {
    try {
      const idconta = parseInt(req.params.idconta);
      const dataInicio = new Date(req.params.datainicio).toISOString().split("T")[0]; // "YYYY-MM-DD"
      const dataFim = new Date(req.params.datafim).toISOString().split("T")[0]; // "YYYY-MM-DD"
      const trasacao = await prisma.trasacao.findMany({
        where: {
          n_contaorigem: idconta,
          t_datatrasacao: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        select: {
          t_datatrasacao: true,
          t_descricao: true,
          t_credito: true,
          t_debito: true,
          t_contadestino: true,
          t_saldoactual: true,
          n_Idtrasacao: true,
        },
        orderBy: {
          n_Idtrasacao: "asc",
        },
      });
      const dados = trasacao.map((el) => ({
        id: el.n_Idtrasacao,
        Descricao: el.t_descricao,
        data: el.t_datatrasacao,
        debito: el.t_debito,
        credtio: el.t_credito,
        saldoactual: el.t_saldoactual,
      }));

      if (trasacao.length > 0) {
        res.status(200).json({ trasacoes: dados });
        return;
      } else {
        res.status(400).json({ message: "Nao foi possivel encontrar a trasacao" });
        return;
      }
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar a sua solicitação" });
    }
  };

  // transações da tela princiapl limit 6
  public trasnacaoPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
      const idconta = parseInt(req.params.idconta);
      const dataInicio = req.params.datainicio;
      const dataFim = req.params.datafim;
      const session = req.cookies;

      const trasacao = await prisma.trasacao.findMany({
        where: {
          n_contaorigem: idconta,
          t_datatrasacao: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        select: {
          n_Idtrasacao: true,
          t_datatrasacao: true,
          t_descricao: true,
          t_credito: true,
          t_debito: true,
          t_contadestino: true,
          t_saldoactual: true,
        },
        take: 6,
        orderBy: {
          n_Idtrasacao: "desc",
        },
      });
      const dados = trasacao.map((el) => ({
        id: el.n_Idtrasacao,
        Descricao: el.t_descricao,
        data: el.t_datatrasacao,
        debito: el.t_debito,
        credtio: el.t_credito,
        saldoactual: el.t_saldoactual,
      }));
      if (trasacao.length > 0) {
        res.status(200).json({ trasacoes: dados });
        return;
      } else {
        res.status(400).json({ message: "Nao foi possivel encontrar a trasacao" });
        return;
      }
    } catch (erro) {
      res.status(400).json("erro" + erro);
    }
  };
  public levantametosRecentes = async (req: Request, res: Response): Promise<void> => {
    try {
      const idconta = parseInt(req.params.idconta);
      const levantamentos = await prisma.levantamentoSemCartao.findMany({
        where: { n_Idconta: idconta },
        take: 6,
        orderBy: {
          n_Idlevantamento: "desc",
        },
      });
      const dados = levantamentos.map((el) => ({
        idLevantamento: el.n_Idlevantamento,
        data: el.t_data_solicitacao,
        estado: el.t_estado,
        referencia: el.t_referencia,
        valor: el.n_valor,
      }));
      if (levantamentos.length > 0) {
        res.status(200).json({ Levantamentos: dados });
        return;
      } else {
        res.status(400).json({ message: "Nao foi possivel encontrar Levantamento" });
        return;
      }
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar a sua solicitaçãoo" });
    }
  };

  //node-cron
  public CancelarLevantamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const idLevantamento = req.body.idlevantamento;
      const Levantamento = await prisma.levantamentoSemCartao.findFirst({
        where: { n_Idlevantamento: idLevantamento },
        select: {
          n_valor: true,
          n_Idconta: true,
          conta: {
            select: {
              n_saldo: true,
            },
          },
        },
      });

      const novosaldo = (Levantamento?.conta?.n_saldo ?? 0) + (Levantamento?.n_valor ?? 0);

      await prisma.conta.update({
        where: {
          n_Idconta: Levantamento?.n_Idconta,
        },
        data: {
          n_saldo: novosaldo,
        },
      });
      await prisma.levantamentoSemCartao.delete({
        where: { n_Idlevantamento: idLevantamento },
      });
      res.status(200).json({ message: "Levantamento Cancelado" });
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar a sua solicitação" });
    }
  };

  public nahora = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idconta, valor, telefonecontadestino } = req.body;
      const telefonecliente = await prisma.telefone.findFirst({
        where: { n_numero: parseInt(telefonecontadestino) },
        select: { n_Idcliente: true },
      });
      if (!telefonecliente) {
        res
          .status(400)
          .json({ message: "Este numero de telefone não está associado a nenhuma conta" });
        return;
      }
      const [contaFrom, contaTo] = await Promise.all([
        await prisma.conta.findFirst({
          where: { n_Idconta: idconta },
          select: { n_saldo: true, n_Idconta: true },
        }),
        await prisma.conta.findFirst({
          where: { n_Idcliente: telefonecliente?.n_Idcliente },
          select: {
            n_Idconta: true,
            n_saldo: true,
            t_numeroconta: true,
            cliente: { select: { t_nomeclient: true } },
          },
        }),
      ]);
      if (contaFrom) {
        if (contaFrom?.n_saldo < valor) {
          res.status(400).json({ message: "Saldo insuficiente" });
          return;
        }
        if (contaTo?.n_Idconta == idconta) {
          res.status(400).json({ message: "Não pode enviar dinheiro para si mesmo" });
          return;
        }
        const saldoactualizadoFrom = contaFrom?.n_saldo - parseFloat(valor);
        const saldoactualizadoTo = (contaTo?.n_saldo ?? 0) + parseFloat(valor);

        await Promise.all([
          // actuliza o saldo na conta origem
          prisma.conta.update({
            where: { n_Idconta: contaFrom.n_Idconta },
            data: { n_saldo: saldoactualizadoFrom },
          }),
          // actuliza o saldo na conta destino
          prisma.conta.update({
            where: { n_Idconta: contaTo?.n_Idconta },
            data: { n_saldo: saldoactualizadoTo },
          }),
        ]);

        const trasacaoFrom = await prisma.trasacao.create({
          data: {
            t_contadestino: contaTo?.t_numeroconta,
            n_contaorigem: contaFrom.n_Idconta,
            t_descricao: "Transferencia intrabancaria",
            t_datatrasacao: formatDate(new Date()),
            t_debito: formatarmoeda(valor),
            t_saldoactual: formatarmoeda(saldoactualizadoFrom),
            t_benefeciario: contaTo?.cliente.t_nomeclient,
          },
        });

        const trasacaoTO = await prisma.trasacao.create({
          data: {
            t_contadestino: "",
            n_contaorigem: contaTo!.n_Idconta,
            t_descricao: "Trasnferencia intrabancaria",
            t_datatrasacao: formatDate(new Date()),
            t_credito: formatarmoeda(parseInt(valor)),
            t_saldoactual: formatarmoeda(saldoactualizadoTo),
          },
        });

        res.status(200).json({
          message: "Trasacao efectuada com sucesso",
          saldoactualizado: saldoactualizadoFrom,
          idtransacao: trasacaoFrom.n_Idtrasacao,
        });
      }
    } catch (err) {
      res.status(400).json({ message: "erro ao processar a sua solicitação" + err });
    }
  };

  public beneficiarioNaHora = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idconta, valor, telefonecontadestino } = req.body;
      console.log(req.body);
      const telefonecliente = await prisma.telefone.findFirst({
        where: { n_numero: parseInt(telefonecontadestino) },
        select: { n_Idcliente: true },
      });
      if (!telefonecliente) {
        res
          .status(400)
          .json({ message: "Este numero de telefone não está associado a nenhuma conta" });

        return;
      }
      const [contaFrom, contaTo] = await Promise.all([
        await prisma.conta.findFirst({
          where: { n_Idconta: idconta },
          select: { n_saldo: true, n_Idconta: true },
        }),
        await prisma.conta.findFirst({
          where: { n_Idcliente: telefonecliente?.n_Idcliente },
          select: {
            n_Idconta: true,
            n_saldo: true,
            t_numeroconta: true,
            cliente: { select: { t_nomeclient: true } },
          },
        }),
      ]);

      if (contaFrom) {
        if (contaFrom?.n_saldo < valor) {
          res.status(400).json({ message: "Saldo insuficiente" });
          return;
        }
        if (contaTo?.n_Idconta == idconta) {
          res.status(400).json({ message: "Não pode enviar dinheiro para si mesmo" });
          return;
        }

        res.status(200).json({ beneficiario: contaTo?.cliente.t_nomeclient, montante: valor });
      } else {
        res.status(400).json({ message: "Conta de origem não encontrada!" });
      }
    } catch (err) {
      res.status(400).json({ message: "erro ao processar a sua solicitação" + err });
    }
  };

  public beneficiarioLevantamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { emaildestino } = req.body;

      const cliente_email = await prisma.client_email.findFirst({
        where: { t_email_address: emaildestino },
        select: { n_Idcliente: true },
      });

      if (cliente_email) {
        const id_cliente = cliente_email?.n_Idcliente || 0;

        const cliente = await prisma.cliente.findFirst({
          where: { n_Idcliente: id_cliente },
          select: { t_nomeclient: true },
        });

      

        res.status(200).json({ nome: cliente?.t_nomeclient });
      }else{
        res.status(200).json({ nome: emaildestino });
      }
    } catch (err) {
      res.status(400).json({ message: "erro ao processar a sua solicitação" });
    }
  };

  public pagamentosEntidade = async (req: Request, res: Response): Promise<void> => {
    try {
      const idconta = req.body.idconta;
      const identidade = req.body.identidade;
      const idproduto = req.body.idproduto;

      const conta = await prisma.conta.findFirst({
        where: { n_Idconta: idconta },
        select: {
          n_saldo: true,
          n_Idconta: true,
          cliente: { select: { t_nomeclient: true } },
        },
      });
      if (!conta) {
        res.status(400).json({ message: "Ocorreu algum erro tente novamente mais tarde" });
        return;
      }
      const proudto = await prisma.produtos.findFirst({
        where: {
          n_Idproduto: idproduto,
          n_Identidade: identidade,
        },
        select: {
          t_preco: true,
          t_descricao: true,
          entidade: {
            select: {
              t_nome: true,
              n_Identidade: true,
              t_referencia: true,
            },
          },
        },
      });
      if (proudto) {
        if (proudto?.t_preco === null || (conta?.n_saldo ?? 0) < proudto.t_preco) {
          res.status(400).json({ message: "Saldo insuficiente" });
          return;
        }
      }
      const saldoactualizado =
        parseInt(conta?.n_saldo?.toString() ?? "0") - parseInt(proudto?.t_preco?.toString() ?? "0");
      prisma.conta.update({
        where: { n_Idconta: conta.n_Idconta },
        data: { n_saldo: saldoactualizado },
      });

      const trasacaoFrom = await prisma.trasacao.create({
        data: {
          t_contadestino: proudto?.entidade?.t_referencia
            ? proudto.entidade.t_referencia.toString()
            : "",
          n_contaorigem: conta.n_Idconta,
          t_descricao: `Pagamento  a entidade ${proudto?.entidade.t_nome} - ${proudto?.t_descricao}`,
          t_datatrasacao: formatDate(new Date()),
          t_debito: proudto?.t_preco?.toString(),
          t_saldoactual: formatarmoeda(saldoactualizado),
          t_benefeciario: proudto?.entidade.t_nome,
        },
      });

      res.status(200).json({
        message: "Trasacao efectuada com sucesso",
        saldoactualizado: saldoactualizado,
        idtransacao: trasacaoFrom.n_Idtrasacao,
      });
    } catch (err) {
      res.status(400).json({ message: "erro ao processar a sua solicitação" });
    }
  };

  public codigoOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const idconta = parseInt(req.body.idconta);

      const cliente = await prisma.conta.findFirst({
        where: { n_Idconta: idconta },
        select: { n_Idcliente: true, usuario: { select: { n_id_usuario: true } } },
      });
      const email = await prisma.client_email.findFirst({
        where: { n_Idcliente: cliente?.n_Idcliente },
        select: { t_email_address: true },
      });
      const codigo2fa = this.generatecodigo2fa().toString();
      await prisma.usuario.update({
        where: { n_id_usuario: cliente?.usuario[0].n_id_usuario },
        data: { t_codigo2fa: codigo2fa },
      });
      if (email) {
        sendcodigo2fa(email.t_email_address, codigo2fa).catch((err) =>
          console.error("Erro ao enviar código 2FA:", err)
        );
        res
          .status(200)
          .json({ message: "Email enviado para a sua caixa de entrada. Por favor verifique" });
      }
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar a sua solicitação" });
    }
  };
  public virificaCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { codigo2fa } = req.body;
      const usuario = await prisma.usuario.findFirst({
        where: {
          t_codigo2fa: codigo2fa,
        },
        select: { n_id_usuario: true },
      });

      if (!usuario) {
        res.status(400).json({ message: "Código 2FA inválido" });
        return;
      }
      await prisma.usuario.update({
        where: { n_id_usuario: usuario?.n_id_usuario },
        data: { t_codigo2fa: "" },
      });
      res.status(200).json({ message: "Codigo verificado com sucesso!" });
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar a sua solicitação" });
    }
  };
  public benfeciario = async (req: Request, res: Response): Promise<void> => {
    try {
      const numeroConta = req.params.numeroconta;
      const conta = await prisma.conta.findFirst({
        where: { t_numeroconta: numeroConta },
        select: { cliente: { select: { t_nomeclient: true } } },
      });
      if (conta) {
        res.status(200).json({ nomeCliente: conta.cliente.t_nomeclient });
      } else {
        res.status(400).json({ messega: "conta nao enontrada" });
      }
    } catch (erro) {
      res.status(400).json({ message: "Erro ao processar solicitação" });
    }
  };
}
