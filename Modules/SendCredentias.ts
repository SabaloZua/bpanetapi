import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from '../Modules/SendEmail'

   export const sendcrendetias =  async (
    email: string | undefined,
    account_number: string | null,
    account_iban: string | null,
    card_number: string | null,
    numeroAdessao: string | null,
    accessCode: string | null
   ) => {
  
try{
    await sendEmail(email!, "Credenciais de Acesso BPA NET", 6, {account_number: account_number, account_iban: account_iban, card_number: card_number, numeroAdessao: numeroAdessao, accessCode: accessCode})
  }catch(err){
    throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
  }
}

