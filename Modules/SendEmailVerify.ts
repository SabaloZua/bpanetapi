import 'dotenv/config'
import nodemailer from 'nodemailer'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port:465,
    secure:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSEKEYEMAIL,
    },
  })

 export const sendeemailverfy= async (email: string,  url: string) => { 
  try{
 await  transporter.sendMail({  
  from: process.env.EMAIL,
  to: email,
 		subject: "Verifcação de EMail",
		html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
                <h1 style="color:  #1674E3;">Confirme seu email</h1>
                <p style="margin-bottom: 20px;">Por favor, clique no link abaixo para verificar seu email no BPA NET:</p>
                <a href=${url} style="display: inline-block; padding: 10px 20px; background-color:  #1674E3; color: #ffffff; text-decoration: none; border-radius: 5px;">Verificar Email</a>
                  <p style="margin-top: 20px;">Se você não tentou realizar esta operação, entre em contacto com nosso suporte em <a href="https://www.bpa.ao/particulares/apoio-ao-cliente/" style="color: #1674E3; text-decoration: underline;">Linha de Atendimento do BPA</a>. Por favor, não compartilhe este email com ninguém.</p>
            </div>`,
      
 })
}catch(err){
  throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
}
}
