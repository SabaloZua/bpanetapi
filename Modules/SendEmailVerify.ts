import 'dotenv/config'
import { sendEmail } from '../Modules/SendEmail'

 export const sendeemailverfy= async (email: string,  url: string) => { 
  try{

    await sendEmail(email, "Verifique Seu Endereço de Email", 1, {verification_url: url})
     
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred'+err);
}
}
