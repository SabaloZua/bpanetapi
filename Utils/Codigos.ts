export const  codigoreferencia=(): number=> {
        let numero = '';
        for (let i = 0; i < 10; i++) {
          
            numero += Math.floor(Math.random() * 10);
        }
        return parseInt(numero); 
    }




    export const numerocartao=(): number => {
        let numero = "";
        for (let i = 0; i < 16; i++) {
            numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
        }
        return parseInt(numero, 10); // Converte a string para um número inteiro
    }
  export  const  codigodeacesso=(): number=> {
        let numero = "";
        for (let i = 0; i < 8; i++) {
            numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
        }
        return parseInt(numero, 10); // Converte a string para um número inteiro
    }
 export const numeroadessao=(): number => {
        let numero = "";
        for (let i = 0; i < 6; i++) {
            numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
        }
        return parseInt(numero, 10); // Converte a string para um número inteiro
    }

    export const createIBAN=(numeroconta:string): string => {
            const numeroAleatorio = Math.floor(Math.random() * 100);
            const numeroFormatado = numeroAleatorio.toString().padStart(2,"4");
            return `AO0600800000${numeroconta}10${numeroFormatado}`;
        }
      export const numeroconta=(): string=> {
            const numerosAleatorios = Array.from({ length: 9 }, () =>
                Math.floor(Math.random() * 10),
            ).join("");
            return `${numerosAleatorios}.10.001`;
        }