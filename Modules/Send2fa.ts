import 'dotenv/config'
import nodemailer from 'nodemailer'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port:465,
    secure:true,
    pool:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSEKEYEMAIL,
    },
  })




  export const sendcodigo2fa=async (email: string, OTP: string)=> {
  try{
 await  transporter.sendMail({  
  from: process.env.EMAIL,
  to: email,
  subject: 'Verificação de dois fatores BPA',
  text: ``,
  html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
            <h1 style="color: #1674E3;">Autenticação de dois fatores</h1>
            <p style="margin-bottom: 20px;">Código de Autenticação</p>
            <p style="color: black; font-size: 28px; letter-spacing: 10px; font-weight: 600;">${OTP}</p>
            <p style="margin-top: 20px;">Se você não tentou realizar esta operação, entre em contacto com nosso suporte em <a href="https://www.bpa.ao/particulares/apoio-ao-cliente/" style="color: #1674E3; text-decoration: underline;">Linha de Atendimento do BPA</a>. Por favor, não compartilhe este codigo com ninguém.</p>
        </div>`,
      
 })
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
}
}
