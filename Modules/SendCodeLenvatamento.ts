import 'dotenv/config'
import { sendEmail } from '../Modules/SendEmail'

	function formato(number: string): string {
    const cleaned = (`${number}`).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{1})$/);

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return number;
	}


  export const sendlevantamento=async (referencia:string,email:string)=> {
   try{
    const referencia_fomatada=formato(referencia);
          await sendEmail(email, "Código De Levantamento Sem Cartão BPA NET", 4, {referencia: referencia_fomatada})
}catch(erro){
 throw erro;
}

}
