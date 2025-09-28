import 'dotenv/config'
import { sendEmail } from '../Modules/SendEmail'


  export const sendcodigo2fa=async (email: string, OTP: string)=> {
  try{

    await sendEmail(email, "Código 2FA BPA NET", 2, {OTP:OTP})
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
}
}
