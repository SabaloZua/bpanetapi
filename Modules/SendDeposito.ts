import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer'

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
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port:465,
    secure:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSEKEYEMAIL,
    },
  })

   export const senddeposito =  async (EmailOptions:EmailOptions) => {
  
try{
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: EmailOptions.email,
    subject: `Dados do Deposito a prazo ${EmailOptions.nomeDP} BPA NET`,
    text: ``,
    html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
    <h1 style="color: #1674E3;">Dados do Deposito ${EmailOptions.nomeDP} </h1>
    <p style="margin-bottom: 20px;">Abaixo estão os seus dados do seu deposito</p>
    
    <p><strong>Valor aplicado:  </strong>${EmailOptions.valor}</p>
    <p><strong>Juros Bruto:  </strong> ${EmailOptions.jurosBruto}</p>
    <p><strong>Juros Liquido:  </strong>${EmailOptions.jurosLiquido}</p>
    <p><strong>Data de aplicação: </strong>${EmailOptions.dataAplicacao}</p>
    <p><strong>Data de vencimento: </strong>${EmailOptions.dataVencimento}</p>
    <p><strong>Total a receber após o Vencimento do Przo:  </strong>${EmailOptions.total}</p>
    
    
    <p style="margin-top: 20px;">Formulas Usadas</p>
    
    <p style="margin-top: 40px;"><strong>Calculo do Juros Bruto </strong> ((Capital aplicado) × (Taxa de juro) × (Prazo da aplicação÷anoactua))</p>
    <p><strong>Calculo do Juros Liquido  </strong> ((Juros Bruto) - (imposto)) </p>
    <p><strong>Calculo do imposto sobre Aplicação de Capitais (IAC) 10%</strong> ((Juros Bruto) x 10%) </p>
    
     <p style="margin-top: 20px;">Se precisar de ajuda, entre em contacto com o nosso suporte em <a href="https://www.bpa.ao/particulares/apoio-ao-cliente/" style="color: #1674E3 text-decoration: underline;">Linha de Atendimento do BPA</a>.</p>
</div>
`})
  }catch(err){
    throw new Error(typeof err === 'string' ? err : 'An unknown error occurred')
  }
}

