import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default class ClienteController {

    public async EntidadeDados(req: Request, res: Response): Promise<void> {
        try{
           const DadosEntidade = await prisma.entidade.findMany({
                select:{
                    t_nome:true,
                    t_referencia:true,
                    n_Identidade:true,
                    logo:true,
                }

            })

            const Dados=DadosEntidade.map((entidade)=>({
                id:entidade.n_Identidade,
                nome:entidade.t_nome,
                referencia:entidade.t_referencia,
                logo:entidade.logo,
                
            }))
            res.status(200).json({entidade:Dados});
        }catch(erro){
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde' });
        }
    }
    public async ProdutosEntidade(req: Request, res: Response): Promise<void> {
        const idEntidade = parseInt(req.params.idEntidade);
        try{
            const DadosProdutos = await prisma.produtos.findMany({
                select:{
                    t_descricao:true,
                    t_preco:true,
                    n_Idproduto:true,
                    n_Identidade:true,
                }

            })
            const Dados=DadosProdutos.map((produto)=>({
                id:produto.n_Idproduto,
                descricao:produto.t_descricao,
                preco:produto.t_preco,
                id_entidade:produto.n_Identidade,
            }))
            res.status(200).json({produtos:Dados});
        }catch(erro){
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde' });
        }
    }

    public async SubProdutos(req: Request, res: Response): Promise<void> {
        const idEntidade = parseInt(req.params.idEntidade);
        try{
            const DadosSubProdutos = await prisma.sub_produtos.findMany({
                select:{
                    n_Idsubproduto:true,
                    t_descricao:true,
                    t_preco:true,
                    n_Idproduto:true,
                }

            })
            const Dados=DadosSubProdutos.map((produto)=>({
                id:produto.n_Idsubproduto,
                id_produto:produto.n_Idproduto,
                descricao:produto.t_descricao,
                preco:produto.t_preco,
            }))
            res.status(200).json({subProdutos:Dados});
        }catch(erro){
            res.status(400).json({ message: 'Erro ao processar a sua solicitação tenta mais tarde' });
        }
    }

}