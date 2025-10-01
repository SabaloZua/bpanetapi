import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from '../Modules/SendEmail'

interface EmailOptions {
  email: string | undefined,
  nomeDP: string | null,
  valor: string | null,
  jurosBruto: string | null,
  jurosLiquido: string | null,
  dataAplicacao: string | null,
  dataVencimento: string | null,
  total: string | null,
}


   export const senddeposito =  async (EmailOptions:EmailOptions) => {
  
try{
    const { email, nomeDP, valor, jurosBruto, jurosLiquido, dataAplicacao, dataVencimento, total } = EmailOptions;
    await sendEmail(email!, `Dados do Deposito a prazo ${EmailOptions.nomeDP} BPA NET`, 5, {nomeDP: nomeDP, valor: valor, jurosBruto: jurosBruto, jurosLiquido: jurosLiquido, dataAplicacao: dataAplicacao, dataVencimento: dataVencimento, total: total})
  }catch(err){
    throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
  }
}

