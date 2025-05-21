import path from 'path';
import { formatarmoeda } from '../Utils/Moeda'
import ejs from 'ejs'
import puppeteer from "puppeteer-core";
import chromium from '@sparticuz/chromium-min';
import { formatDate } from '../Utils/Datas';


interface dadosComprovativo {
    nomecliente: string,
    ibanFrom: string,
    contaFrom: string,
    montate: string,
    ibanTO: string,
    benefeciario: string,
    descricao: string,
    idtransacao: number,
    tipo: string

}
interface dadosExtrato {
    trasacoes: {
        t_debito: string | null;
        t_credito: string | null;
        t_descricao: string | null;
        t_datatrasacao: string | null;
        t_saldoactual: string | null;
    }[];
    nomeclient: string,
    iban: string,
    numeroconta: string
    datainicio: string,
    datafim: string
    saldoinicial: number
}

// função para gerar comprovativo
export const comprovativo = async (dados: dadosComprovativo): Promise<Buffer> => {
    try {
        const executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar");
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: true,
        });

        const page = await browser.newPage();
        const filePath1 = path.join(__dirname, "../", "Views", "comprovativo.ejs");

        const html = await ejs.renderFile(filePath1, {
            nomecliente: dados.nomecliente,
            ibanFrom: dados.ibanFrom,
            contaFrom: dados.contaFrom,
            benefeciario: dados.benefeciario,
            ibaTO: dados.ibanTO,
            montate: formatarmoeda(parseInt(dados.montate)),
            descricao: dados.descricao,
            idtransacao: dados.idtransacao,
            data: formatDate(new Date()),
            tipo: dados.tipo
        });

        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `<div></div>`,
            footerTemplate: `<div style="width:100%; text-align:right; font-size:8px; margin-right:20px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
            width: '210mm',
            height: '297mm',
            margin: {
                top: "40px",
                bottom: "40px",
                left: "50px",
                right: "40px"
            }

        });

        await browser.close();
        return Buffer.from(pdfBuffer); // convert Uint8Array to Buffer

    } catch (error) {
        throw error;
    }
}

// função para gerar extrato
export const extrato = async (dados: dadosExtrato): Promise<Buffer> => {
    try {

        const executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar");;
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        const filePath1 = path.join(__dirname, "../", "Views", "extrato.ejs");

        const trasacoesFormatadas = dados.trasacoes.map(item => ({
            ...item,
            t_descricao: item.t_descricao ? item.t_descricao.split(" ").slice(0, 5).join(" ") : null,
            t_credito: item.t_credito ? formatarmoeda(parseInt(item.t_credito)) : null,
            t_debito: item.t_debito ? formatarmoeda(parseInt(item.t_debito)) : null
        }));

        const html = await ejs.renderFile(filePath1, {
            trasacoes: trasacoesFormatadas,
            nomeclient: dados.nomeclient,
            iban: dados.iban,
            numeroconta: dados.numeroconta,
            dataInicio: dados.datainicio,
            dataFim: dados.datafim,
            saldoinicial: formatarmoeda(dados.saldoinicial)
        });

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `<div></div>`,
            footerTemplate: `<div style="width:100%; text-align:right; font-size:8px; margin-right:20px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
            width: '210mm',
            height: '297mm',
            margin: {
                top: "5px",
                bottom: "20px",
                left: "20px",
                right: "20px"
            },
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
    } catch (error) {
        throw error;
    }
}
