import 'dotenv/config'
import { sendEmail } from '../Modules/SendEmail'




  export const SendRecuparaCredencias=async (email: string, OTP: string)=> {
  try{
     await sendEmail(email, "Recuperação de Credenciais BPA NET", 2, {OTP:OTP })
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
}
}
