
const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d");
const debugCanvas = document.getElementById("debugCanvas");
const debugCtx = debugCanvas.getContext("2d");

let iteradorDebug;
let evidencia;
let pilha = [];
let automato = [];

class Instancia {
    constructor(instancia) {
        if (instancia != null) {
            this.estadoAtual = instancia.estadoAtual;
            this.pilha = instancia.pilha;
            this.cor = instancia.cor;
            this.erro = instancia.erro;
        } else {
            this.estadoAtual = 0;
            this.pilha = [];
            this.cor = "#00FA9A";
            this.erro = false;
        }
    }
}

class Transicao {
    constructor(origem, destino, valor, numero, empilha, desempilha) {
        this.origem = origem;
        this.destino = destino;
        this.valor = valor;
        this.numero = numero;
        this.empilha = empilha;
        this.desempilha = desempilha;
    }

}

class Estado {
    constructor(num) {
        this.numero = num;
        this.x = 0;
        this.y = 0;
        this.raio = 20;
        this.isDragging = false;
        this.cor = "#00BFFF";
        this.transicoes = [];
        this.final = false;
    }
    adiciona_transisao(i, valor, empilha, desempilha) {

        this.transicoes.push(new Transicao(this.numero, i, valor, this.transicoes.length, empilha, desempilha));
        desenha(ctx);
    }
    remove_transicao(i) {
        this.transicoes = this.transicoes.filter(objeto => objeto.numero !== i);
        for (i = 0; i < this.transicoes.length; ++i) {
            this.transicoes[i].numero = i;
        }
        desenha(ctx);
    }
    torna_final() {
        this.final = !this.final;
        desenha(ctx);
    }
}

function adiciona_estado(x, y) {
    const estado = new Estado(automato.length);
    estado.x = x;
    estado.y = y;
    automato.push(estado);
    desenha(ctx);
}

//aqui fica a logica de execução do automato
function executa_automato(passo) {
    palavra = document.getElementById("palavra");
    let instancias = [];
    let passou = false;

    instancias[0] = new Instancia();

    for (i = 0; i <= passo; i++) {
        let proximosEstados = [];
        let temp;
        let temp_lanb = [];

        instancias.forEach(instancia => {
            if (!instancia.erro) {
                automato[instancia.estadoAtual].transicoes.forEach(transicao => {
                    if (transicao.desempilha == instancia.pilha[instancia.pilha.length - 1] || transicao.desempilha == "") {
                        if (palavra.value[i] == transicao.valor) {
                            temp = new Instancia();
                            temp.estadoAtual = transicao.destino;
                            temp.pilha = [...instancia.pilha];
                            if (transicao.desempilha != "") {
                                temp.pilha.pop();
                            }
                            for (const char of transicao.empilha) {
                                temp.pilha.push(char);
                            }
                            proximosEstados.push(temp);
                            passou = true;

                        } else if (transicao.valor == "") {
                            temp_lanb = executa_lanbda(transicao, palavra.value[i], [...instancia.pilha]);
                            if (temp_lanb.length != 0) {
                                temp_lanb.forEach(proximo => {
                                    proximosEstados.push(proximo);
                                });
                                passou = true;
                                temp_lanb = [];
                            }

                        }
                    }
                });
                if (!passou) {
                    instancia.erro = true;
                }
                passou = false;
            }

        });

        instancias = [];
        proximosEstados.forEach(proximo => {
            instancias.push(new Instancia(proximo));
        });

        console.log(instancias);
    }

    if (passo == palavra.value.length) {
        const aceita = instancias.some(instancia => automato[instancia.estadoAtual].final && instancia.pilha.length === 0 && !instancia.erro);
        if (aceita) {
            alert("palavra aceita");
        } else {
            alert("palavra recusada");
        }
    }
    return instancias;
}

function executa_lanbda(transicao, char, pilha) {

    if (transicao.desempilha != "") {
        pilha.pop();
    }
    for (const empilhado of transicao.empilha) {
        pilha.push(empilhado);
    }

    let proximosEstados = [];
    let temp;
    let temp_lanb = [];
    automato[transicao.destino].transicoes.forEach(transicao2 => {
        if (transicao2.desempilha == pilha[pilha.length - 1] || transicao2.desempilha == "") {

            if (transicao2.valor == "") {

                temp_lanb = executa_lanbda(transicao, palavra.value[i], [...pilha]);
                if (temp_lanb.length != 0) {
                    temp_lanb.forEach(proximo => {
                        proximosEstados.push(proximo);
                    });
                    passou = true;
                    temp_lanb = [];
                }

            } else if (char == transicao2.valor) {


                temp = new Instancia();
                temp.estadoAtual = transicao2.destino;
                temp.pilha = [...pilha];
                if (transicao2.desempilha != "") {
                    temp.pilha.pop();
                }
                for (const char of transicao2.empilha) {
                    temp.pilha.push(char);
                }
                proximosEstados.push(temp);
                passou = true;

            }
        }

    });
    return proximosEstados;
}

function testa_palavra() {
    executa_automato(document.getElementById("palavra").value.length);
}

function desenha_etapa() {
    let instancias = executa_automato(iteradorDebug);

    botao_evidencia(instancias);
    desenha(debugCtx);
    desenha_palavra();
    desenha_botoes(debugCtx);
    desenha_pilha(instancias);

    automato.forEach(estado => {
        estado.cor = "#00BFFF";
    });
    automato[instancias[evidencia].estadoAtual].cor = instancias[evidencia].cor;

}

function botao_evidencia(instancias){

    let form = document.getElementById("evidencia");
    if (instancias.length > form.children.length) {
        let total = form.children.length;
        let botao;
        let div;
        for(let i=total;i<instancias.length;++i){
            div = document.createElement("span");
            botao = document.createElement("input");
            botao.type = "radio";
            botao.innerHTML = i;
            botao.value = i;
            botao.name = "evidencia";
            botao.onclick = ()=>{
                evidencia = i;
                desenha_etapa();
            };
            div.appendChild(botao);
            div.appendChild(document.createTextNode(i+" "));
            form.appendChild(div);
        }
        
    }
}

function debuga_palavra() {
    palavra = document.getElementById("palavra");
    let form = document.getElementById("evidencia");
    if (canvas.style.display == "block" && debugCanvas.style.display == "none") {
        palavra.readOnly = true;

        canvas.style.display = "none";
        debugCanvas.style.display = "block";
        iteradorDebug = 0;

        evidencia = 0;


        desenha_etapa();
    } else {
        palavra.readOnly = false;

        canvas.style.display = "block";
        debugCanvas.style.display = "none";
        form.innerHTML = "";

        desenha(ctx);
    }
}

function desenha_botoes(contexto) {
    let text = "Anterior";
    let x = 20;
    let y = canvas.height - 20 - 50;
    let width = 100;
    let height = 50;
    contexto.fillStyle = '#3498db';
    contexto.fillRect(x, y, width, height);
    contexto.fillStyle = 'black';
    contexto.strokeRect(x, y, width, height);

    contexto.fillStyle = 'white';
    contexto.font = '20px Arial';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(text, x + width / 2, y + height / 2);

    text = "Proximo";
    x += 110;
    contexto.fillStyle = '#3498db';
    contexto.fillRect(x, y, width, height);
    contexto.fillStyle = 'black';
    contexto.strokeRect(x, y, width, height);

    contexto.fillStyle = 'white';
    contexto.font = '20px Arial';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(text, x + width / 2, y + height / 2);
}

debugCanvas.addEventListener("mousedown", function (e) {
    tamanho = document.getElementById("palavra").value.length;
    const mousePos = getMousePos(debugCanvas, e);

    let left = 20;
    let right = 120;
    let topp = debugCanvas.height - 20 - 50;
    let botton = debugCanvas.height - 20;
    if (mousePos.x >= left && mousePos.x <= right && mousePos.y >= topp && mousePos.y <= botton) {
        if (iteradorDebug > 0) {
            iteradorDebug -= 1;
            desenha_etapa();
        }
    } else if (mousePos.x >= left + 110 && mousePos.x <= right + 110 && mousePos.y >= topp && mousePos.y <= botton) {
        if (iteradorDebug < tamanho) {
            iteradorDebug ++;
            desenha_etapa();
        }
    }
});

function desenha_palavra() {
    palavra = document.getElementById("palavra").value;
    let x = 20;
    let y = canvas.height - 20 - 50 - 20;
    debugCtx.font = "25px Arial";
    debugCtx.fillStyle = "black";
    debugCtx.textAlign = 'start';
    debugCtx.fillText(palavra, x, y);

    let posisaoCaracter = debugCtx.measureText(palavra.slice(0, iteradorDebug)).width;
    debugCtx.strokeRect(x + posisaoCaracter, y - 15, debugCtx.measureText("o").width, debugCtx.measureText("o").width * 2);

    debugCtx.fillStyle = "red";
    debugCtx.fillText(palavra[iteradorDebug], x + posisaoCaracter, y);
}

function desenha_pilha(instancias) {
    let y = canvas.height - 20 - 50 - 20;

    debugCtx.fillStyle = instancias[evidencia].cor;
    debugCtx.strokeStyle = instancias[evidencia].cor;

    debugCtx.beginPath();
    debugCtx.moveTo(debugCanvas.width - 30, y - 200);
    debugCtx.lineTo(debugCanvas.width - 30, y + 10);
    debugCtx.lineTo(debugCanvas.width - 1, y + 10);
    debugCtx.lineTo(debugCanvas.width - 1, y - 200);
    debugCtx.stroke();

    debugCtx.strokeStyle = '#000000';

    let altura = 0;


    debugCtx.font = '25px Arial';
    debugCtx.textAlign = 'center';
    debugCtx.textBaseline = 'middle';

    instancias[evidencia].pilha.forEach(elemento => {
        debugCtx.fillText(elemento, debugCanvas.width - 15, y - altura);
        altura += debugCtx.measureText("0").width * 2;
    });
    debugCtx.fillStyle = 'black';
}

function getMousePos(canvas, event) {
    return {
        x: event.clientX - canvas.getBoundingClientRect().left,
        y: event.clientY - canvas.getBoundingClientRect().top
    };
}

function desenha(contexto) {
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    for (i = 0; i < automato.length; i++) {
        desenha_circulo(contexto, i);
    }
}

function desenha_circulo(contexto, i) {
    ignorar = [];
    automato[i].transicoes.forEach(transicao => {
        if (!ignorar.includes(transicao.numero)) {
            iguais = automato[i].transicoes.filter(objeto => objeto.destino == transicao.destino && objeto.numero !== transicao.numero);
            let label = "";
            let valor = "";
            let empilha = "";
            let desempilha = "";
            if (iguais.length > 0) {
                iguais.forEach(igual => {
                    ignorar.push(igual.numero);
                    if (igual.valor == "") {
                        valor = "λ";
                    } else {
                        valor = igual.valor;
                    }
                    if (igual.desempilha == "") {
                        desempilha = "λ";
                    } else {
                        desempilha = igual.desempilha;
                    }
                    if (igual.empilha == "") {
                        empilha = "λ";
                    } else {
                        empilha = igual.empilha;
                    }
                    label += "(" + valor + "," + desempilha + "/" + empilha + "),";
                });
                if (transicao.valor == "") {
                    valor = "λ";
                } else {
                    valor = transicao.valor;
                }
                if (transicao.desempilha == "") {
                    desempilha = "λ";
                } else {
                    desempilha = transicao.desempilha;
                }
                if (transicao.empilha == "") {
                    empilha = "λ";
                } else {
                    empilha = transicao.empilha;
                }
                label += "(" + valor + "," + desempilha + "/" + empilha + ")";
                desenha_transicao(contexto, automato[i].x, automato[i].y, automato[transicao.destino].x, automato[transicao.destino].y, label);
            } else {
                if (transicao.valor == "") {
                    valor = "λ";
                } else {
                    valor = transicao.valor;
                }
                if (transicao.desempilha == "") {
                    desempilha = "λ";
                } else {
                    desempilha = transicao.desempilha;
                }
                if (transicao.empilha == "") {
                    empilha = "λ";
                } else {
                    empilha = transicao.empilha;
                }
                label = valor + "," + desempilha + "/" + empilha;
                desenha_transicao(contexto, automato[i].x, automato[i].y, automato[transicao.destino].x, automato[transicao.destino].y, label);
            }
        }
    });

    let x = automato[i].x;
    let y = automato[i].y;
    contexto.beginPath();
    contexto.arc(x, y, automato[i].raio, 0, 2 * Math.PI);
    contexto.fillStyle = automato[i].cor;
    contexto.fill();
    contexto.stroke();

    contexto.font = "12px Arial";
    contexto.fillStyle = "black";
    contexto.fillText("S" + i, x, y);

    if (automato[i].final) {
        contexto.beginPath();
        contexto.arc(x, y, automato[i].raio + 5, 0, 2 * Math.PI);
        contexto.stroke();
    }

    if (i == 0) {
        let lado = 20;
        let altura = (Math.sqrt(3) / 2) * lado;

        x = x - automato[0].raio;
        let x1 = x - altura;
        let y1 = y - (lado / 2);
        let x2 = x - altura;
        let y2 = y + (lado / 2);

        contexto.beginPath();
        contexto.moveTo(x, y);
        contexto.lineTo(x1, y1);
        contexto.lineTo(x2, y2);
        contexto.closePath();
        contexto.lineTo(x - lado * 2, y);
        contexto.stroke();
    }
}

function desenha_transicao(contexto, x1, y1, x2, y2, valor) {
    let fugaX = Math.sign(x1 - x2) * 25;
    let fugaY = Math.sign(y1 - y2) * 25;

    if (x1 == x2 && y1 == y2) {
        contexto.beginPath();
        contexto.arc(x1 + 25, y1 - 20, 20, 0, 2 * Math.PI);
        contexto.stroke();
        contexto.fillText(valor, x1 + 25, y1 - 45);
    } else {
        contexto.fillText(valor, ((x1 + x2) / 2) + fugaX, ((y1 + y2) / 2) - fugaY);
    }

    const angle = Math.atan2(((y1 + y2) / 2) - fugaY - y2, ((x1 + x2) / 2) + fugaX - x2);
    x1 = x1 + Math.cos(angle) * (-20);
    y1 = y1 + Math.sin(angle) * (-20);
    x2 = x2 + Math.cos(angle) * (20);
    y2 = y2 + Math.sin(angle) * (20);

    contexto.beginPath();
    contexto.moveTo(x1, y1);
    contexto.quadraticCurveTo(((x1 + x2) / 2) + fugaX, ((y1 + y2) / 2) - fugaY, x2, y2);
    contexto.stroke();


    let arrowPoint1X = x2 + Math.cos(angle - Math.PI / 6) * (10);
    let arrowPoint1Y = y2 + Math.sin(angle - Math.PI / 6) * (10);
    let arrowPoint2X = x2 + Math.cos(angle + Math.PI / 6) * (10);
    let arrowPoint2Y = y2 + Math.sin(angle + Math.PI / 6) * (10);

    contexto.beginPath();
    contexto.moveTo(x2, y2);
    contexto.lineTo(arrowPoint1X, arrowPoint1Y);
    contexto.lineTo(arrowPoint2X, arrowPoint2Y);
    contexto.closePath();
    contexto.fill();


}


canvas.addEventListener("mousedown", function (e) {
    const mousePos = getMousePos(canvas, e);
    for (i = 0; i < automato.length; i++) {
        left = automato[i].x - automato[i].raio;
        right = automato[i].x + automato[i].raio;
        topp = automato[i].y - automato[i].raio;
        botton = automato[i].y + automato[i].raio;
        if (mousePos.x >= left && mousePos.x <= right && mousePos.y >= topp && mousePos.y <= botton) {
            automato[i].isDragging = true;
        }
    }
});


canvas.addEventListener("mouseup", function () {
    for (i = 0; i < automato.length; i++) {
        automato[i].isDragging = false;
    }
});


canvas.addEventListener("mousemove", function (e) {
    for (i = 0; i < automato.length; i++) {
        if (automato[i].isDragging) {
            const mousePos = getMousePos(canvas, e);
            automato[i].x = mousePos.x;
            automato[i].y = mousePos.y;
            desenha(ctx);
        }
    }
});

canvas.addEventListener("contextmenu", function (event) {
    // Impede o menu de contexto padrão de aparecer
    event.preventDefault();

    // Calcula as coordenadas relativas ao canvas
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;
    let posicaoX = event.clientX + 20;
    let posicaoY = event.clientY - 40;
    // Cria um menu de contexto personalizado
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.style.position = "absolute";
    menu.style.backgroundColor = "white";
    menu.style.border = "1px solid black";
    menu.style.padding = "5px";
    menu.style.left = posicaoX + "px";
    menu.style.top = posicaoY + "px";

    let estado_selecionado = false;
    for (i = 0; i < automato.length; i++) {
        left = automato[i].x - automato[i].raio;
        right = automato[i].x + automato[i].raio;
        topp = automato[i].y - automato[i].raio;
        botton = automato[i].y + automato[i].raio;
        if (mouseX >= left && mouseX <= right && mouseY >= topp && mouseY <= botton) {
            estado_selecionado = true;
            menu.innerHTML = "S" + i + "<br>";

            const final = document.createElement("button");
            final.innerText = "tornar final";
            final.value = i;
            menu.appendChild(final);
            final.addEventListener("click", function () {
                automato[final.value].torna_final();
            });

            const adiciona = document.createElement("button");
            adiciona.innerText = "adicionar transicao";
            adiciona.value = i;
            menu.appendChild(adiciona);
            adiciona.addEventListener("click", function () {
                let lista_de_estados = [];
                valor = document.createElement("input");
                empilha = document.createElement("input");
                desempilha = document.createElement("input");
                valor.placeholder = "valor";
                empilha.placeholder = "empilha";
                desempilha.placeholder = "desempilha";
                valor.size = 3;
                menu.appendChild(valor);
                menu.appendChild(desempilha);
                menu.appendChild(empilha);
                for (j = 0; j < automato.length; j++) {
                    lista_de_estados[j] = document.createElement("button");
                    lista_de_estados[j].innerText = "S" + j;
                    (function (indice) {
                        lista_de_estados[j].addEventListener("click", function () {
                            automato[adiciona.value].adiciona_transisao(indice, valor.value, empilha.value, desempilha.value);
                        });
                    })(j);
                    menu.appendChild(lista_de_estados[j]);
                }
            });

            const remove = document.createElement("button");
            remove.innerText = "remover transicao";
            remove.value = i;
            menu.appendChild(remove);
            menu.appendChild(document.createElement("br"));
            remove.addEventListener("click", function () {
                let lista_de_estados = [];
                let j = 0;
                automato[remove.value].transicoes.forEach(transicao => {
                    lista_de_estados[j] = document.createElement("button");
                    lista_de_estados[j].innerText = "S" + transicao.destino + "(" + transicao.valor + ")";
                    (function (indice) {
                        lista_de_estados[j].addEventListener("click", function () {
                            automato[remove.value].remove_transicao(transicao.numero);
                        });
                    })(transicao.destino);
                    menu.appendChild(lista_de_estados[j]);
                    ++j;
                });

            });

        }
    }
    if (!estado_selecionado) {
        const opcao1 = document.createElement("button");
        opcao1.innerText = "adiciona estado";
        opcao1.addEventListener("click", function () {
            adiciona_estado(mouseX, mouseY);
        });
        menu.appendChild(opcao1);
    }

    document.body.appendChild(menu);

    // Adiciona um listener para remover o menu ao clicar em qualquer lugar fora dele
    document.addEventListener("mousedown", function (e) {
        if (!menu.contains(e.target)) {
            document.body.removeChild(menu);
        }
    });
});

function exportar() {
    const jsonData = automato;

    // Converte o objeto JSON em uma string
    const jsonString = JSON.stringify(jsonData);

    // Cria um Blob com a string JSON
    const blob = new Blob([jsonString], { type: "application/json" });

    // Cria um link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "APN.json"; // Nome do arquivo a ser baixado

    // Adiciona o link à página e simula o clique
    document.body.appendChild(link);
    link.click();

    // Limpa o URL do objeto Blob após o download
    URL.revokeObjectURL(url);
}

document.getElementById("uploadInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return; // Se nenhum arquivo foi selecionado, saia da função

    // Cria um objeto FileReader para ler o conteúdo do arquivo
    const reader = new FileReader();

    // Define a função de callback a ser chamada quando a leitura for concluída
    reader.onload = function (event) {
        const jsonData = JSON.parse(event.target.result);
        automato = jsonData;
        automato.forEach(estado => {
            estado.adiciona_transisao = function (i, valor, empilha, desempilha) {
                let valida = true;
                this.transicoes.forEach(transicao => {
                    if (transicao.valor == valor) {
                        valida = false;
                        alert("transisao invalida para APN");
                    }
                });
                if (valor == "") {
                    valida = false;
                    alert("transisao invalida para APN");
                }
                if (valida) {
                    this.transicoes.push(new Transicao(this.numero, i, valor, this.transicoes.length, empilha, desempilha));
                }

                desenha(ctx);
            };

            estado.remove_transicao = function (i) {
                this.transicoes = this.transicoes.filter(objeto => objeto.numero !== i);
                for (i = 0; i < this.transicoes.length; ++i) {
                    this.transicoes[i].numero = i;
                }
                desenha(ctx);
            };

            estado.torna_final = function () {
                this.final = !this.final;
                desenha(ctx);
            };
        });
        desenha(ctx);
    };

    // Inicia a leitura do arquivo como texto
    reader.readAsText(file);
});


window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', resizeCanvas);

function resizeCanvas() {
    let width = window.innerWidth * 0.6;
    let height = window.innerHeight * 0.6;

    canvas.width = width;
    canvas.height = height;
    desenha(ctx);

    debugCanvas.width = width;
    debugCanvas.height = height;
    desenha(debugCtx);
}