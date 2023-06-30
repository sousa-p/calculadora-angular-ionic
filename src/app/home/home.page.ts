import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  constructor() {}

  historicoOperacoes: Array<any> = [];
  operacao: string = '';
  resultado: any = '';

  addOperacao(char: string): void {
    // Checa se juntar determinado caracter é valido
    if (this.operacaoEhValida(this.operacao, char)) {
      this.operacao += char;
      // Se é valido o caracter e o mesmo é porcentagem, calcula a esta operação
      if (char === '%') this.calcPorcentagem();
      this.calcResultado();
    }
  }

  operacaoEhValida(
    operacao: string = this.operacao,
    char: string = ''
  ): boolean {
    const ultimoChar: any = operacao?.at(-1); // Pega o ultimo caracter da operação
    const regexCharsEspeciais = /[+%./*-]/; // Expressão regular para verificação dos caracteres especiais
    const regexDecimalErrado = /[.]\d+[.]/; // Expressão regular para verificação de números decimais errados,como: 0.0.3 ou 5.0000.5

    const ultimoCharEhEspecial = regexCharsEspeciais.test(ultimoChar);
    const charEhEspecial = regexCharsEspeciais.test(char);

    if (regexDecimalErrado.test(operacao + char)) return false; // Se adicionar o novo caracter o decimal estara correto
    if (operacao === '' && charEhEspecial) return false; // Não poder iniciar operações com caracteres especiais
    if (!ultimoCharEhEspecial && charEhEspecial) return true; // Se o ultimo caracter da operação não é especial (número) e o novo caracter é especial, logo é valido
    if (ultimoCharEhEspecial && charEhEspecial) return false; // Se o ultimo caracter da operação e o caracter são especias, logo é invalido

    // Tenta resolver a operaçãom se não há erro, a mesma é valida
    try {
      eval(operacao + char);
      return true;
    } catch (_) {
      return false;
    }
  }

  mudarOperacao(novaOperacao: string): void {
    this.operacao = novaOperacao;
    this.calcResultado();
  }

  inverterSinal(): void {
    const regexOperacoes = /[+/*-]/; // Expressão regular para todas as operações possiveis
    const ultimoNumero: any = this.operacao.split(regexOperacoes).at(-1); // Separa a operação em um array, pelas suas operações, e pega o seu ultimo elemento, ou seja o ultimo numero
    if (ultimoNumero.at(-1) === ')') { // Se o número já for negativo apenas, retiramos seu "(-" e ")"
      this.limparCharOperacao();
    } else if (ultimoNumero != '') {
      //Evita casos em que não há nenhum número na operação, por consequencia gerando: (-)
      const pos = this.operacao.lastIndexOf(ultimoNumero); //É necessario pegar a posição do número do array, para usarmos o substring, como sempre é o ultimo número, sempre sera o ultimo indice
      this.operacao = `${this.operacao.substring(0, pos)}(-${ultimoNumero})`;
      this.calcResultado();
    }
  }

  calcPorcentagem(): void {
    const numeros: any = this.operacao.match(/\d+[.]*\d*/g); // Expressão regular para conseguirmos separar todos os números da operação
    const porcentagem = Number(numeros?.at(-1)) / 100; // Como sempre o ultimo número é a porcentagem, já calculamos a mesma
    const regexNumeroPorcentagem = /\d+[.]*\d*%/;
    const operacaoSemPorcentagem = this.operacao.split(
      regexNumeroPorcentagem
    )[0]; // Pegamos a operação antes da porcentagem
    const operacao = operacaoSemPorcentagem.at(-1); // Como antes da porcentagem sempre sera a operação que iremos realizar, pegamos a mesma
    const penultimoNumero = numeros?.at(-2); // Pegamos o penultimo número, pois talvez utilizaremos ele para o resultado da porcentagem

    // Existe duas maneiras de retornarmos a porcentagem, seja ela baseada num número prévio, como sendo apenas ela, então verificamos a mesma
    const resultado =
      numeros?.length > 1 && operacao != '*' && operacao != '/'
        ? eval(`${penultimoNumero}*${porcentagem}`)
        : porcentagem;

    this.operacao = operacaoSemPorcentagem + resultado?.toString(); // Unimos a parte sem a porcentagem + o resultado final da porcentagem
  }

  calcResultado(operacao: string = this.operacao): void {
    // Se tivermos a operação, testamos ela, se for possivel realizar a mesma, e seu resultado for um número finito, atribuimos o resultado
    if (operacao != '') {
      try {
        const calc = eval(operacao);
        operacao
          ? (this.resultado = !isNaN(calc) && isFinite(calc) ? calc : 'error')
          : (this.resultado = 'error');
      } catch (_) {
        this.resultado = 'error';
      }
    }
  }

  finalizaOperacao(): void {
    // Fazemos todas essas verificações antes, pois a operação sera guardada no historico e o resultado sera atribuido na operação, logo sem ela poderiam acorrer erros
    if (
      this.operacao != '' &&
      this.resultado != 'error' &&
      isFinite(this.resultado)
    ) {
      this.calcResultado(); // Calcula novamente para caso de erros
      this.salvarHistorico(this.operacao, this.resultado);
      this.operacao = String(this.resultado);
    }
  }

  limparOperacao(): void {
    this.operacao = '';
    this.resultado = '';
  }

  limparCharOperacao(): void {
    // Temos dois casos para apagarmos
    if (this.operacao.at(-1) === ')') {
      // Quando vamos apagar ")", entendemos que é um número negativo, ou seja devemos apagar os "(-" e o ")", deixando o número intacto
      const regexNumeroNegativo = /(-\d+[.]*\d*)/; // Expressão regular para encontramos todos os números negativos na operação
      const ultimoNumeroNegativo: any = this.operacao.match(regexNumeroNegativo)?.at(-1); // Por meio da expresão regular encontramoso número que iremos manipular
      this.operacao =
        this.operacao.slice(0, -(ultimoNumeroNegativo?.length + 2)) // Retorna operação sem o número negativo
        + Number(ultimoNumeroNegativo) * -1; // Transformos o número em positvo e adicionamos ele
      } else {
        // Caso for outro caracter
        this.operacao = this.operacao.slice(0, -1); // Retira o ultimo caracter
      }
      this.calcResultado();
  }

  salvarHistorico(operacao: string, resultado: number): void {
    //Adicionar ao array do historicom, um objeto que sera exibido no html
    this.historicoOperacoes.push({
      operacao: operacao,
      resultado: resultado,
    });
}
}
