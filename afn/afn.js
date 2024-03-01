const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d");

let automato = [];

class Transicao{
    constructor(origem, destino, valor,numero){
        this.origem = origem;
        this.destino = destino;
        this.valor = valor;
        this.numero = numero;
    }

}

class Estado{
    constructor(num){
        this.numero = num;
        this.x = 0;
        this.y = 0;
        this.raio = 20;
        this.isDragging = false;
        this.cor = "#00BFFF";
        this.transicoes = [];
        this.final = false;
    }
    adiciona_transisao(i,valor){
        let valida = true;
        this.transicoes.forEach(transicao => {
            if(transicao.valor == valor){
                valida = false;
                alert("transisao invalida para AFD");
            }
        });
        if(valida){
            this.transicoes.push(new Transicao(this.numero,i,valor,this.transicoes.length));
        }
        
        desenha();
    } 
    remove_transicao(i){
        this.transicoes = this.transicoes.filter(objeto => objeto.origem !== this.numero && objeto.destino !== i);
        desenha();
    }
    torna_final(){
        this.final = !this.final;
        desenha();
    }
}

function testa_palavra(){
    palavra = document.getElementById("palavra");
    let j = 0;
    let passou = false;
    let erro = false;
    for(i=0;i<palavra.value.length;i++){
        automato[j].transicoes.forEach(transicao => {
            if(palavra.value[i]==transicao.valor){
                j = transicao.destino;
                passou = true;
            }
        });
        if(!passou){
            erro=true;
            break;
        }
        passou = false;
    }
    if(automato[j].final && !erro){
        alert("palavra aceita");
    }else{
        alert("palavra recusada");
    }
}

function adiciona_estado(x,y){
    const estado = new Estado(automato.length);
    estado.x = x;
    estado.y = y;
    automato.push(estado);
    desenha(estado.x, estado.y, estado.raio);
}

// Função para obter as coordenadas do mouse no canvas
function getMousePos(canvas, event) {
    return {
        x: event.clientX - canvas.getBoundingClientRect().left,
        y: event.clientY - canvas.getBoundingClientRect().top
    };
}


function desenha() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(i=0;i<automato.length;i++){
        desenha_circulo(i);  
    }

}

function desenha_circulo(i){
    ignorar = [];
    automato[i].transicoes.forEach(transicao => {
        if(!ignorar.includes(transicao.numero)){
            iguais = automato[i].transicoes.filter(objeto => objeto.destino == transicao.destino && objeto.numero !== transicao.numero);
            if(iguais.length>0){
                let label = "";
                iguais.forEach(igual=>{
                    ignorar.push(igual.numero);
                    label += igual.valor+","
                });
                label+=transicao.valor;
                desenha_transicao(automato[i].x, automato[i].y,automato[transicao.destino].x, automato[transicao.destino].y,label);
            }else{
                desenha_transicao(automato[i].x, automato[i].y,automato[transicao.destino].x, automato[transicao.destino].y,transicao.valor);
            }
        }  
    });

    let x = automato[i].x;
    let y = automato[i].y;
    ctx.beginPath();
    ctx.arc(x, y, automato[i].raio, 0, 2 * Math.PI);
    ctx.fillStyle = automato[i].cor;
    ctx.fill();
    ctx.stroke();

    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("S"+i, x, y);

    if(automato[i].final){
        ctx.beginPath();
        ctx.arc(x, y, automato[i].raio+5, 0, 2 * Math.PI);
        ctx.stroke();
    }

    if(i == 0){
        let lado = 20;
        let altura = (Math.sqrt(3) / 2) * lado;
        
        x = x-automato[0].raio;
        let x1 = x-altura;
        let y1 = y-(lado/2);
        let x2 = x-altura;
        let y2 = y+(lado/2);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.lineTo(x-lado*2, y);
        ctx.stroke();
    }
}

function desenha_transicao(x1,y1,x2,y2,valor){
    let fugaX = Math.sign(x1-x2)*25;
    let fugaY = Math.sign(y1-y2)*25;

    if(x1 == x2 && y1 == y2){
        ctx.beginPath();
        ctx.arc(x1+25, y1-20, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(valor, x1+25, y1-45);
    }else{
        ctx.fillText(valor, ((x1+x2)/2)+fugaX, ((y1+y2)/2)-fugaY);
    }
    
    const angle = Math.atan2(((y1+y2)/2)-fugaY - y2, ((x1+x2)/2)+fugaX - x2);
    x1 = x1 + Math.cos(angle) * (-20);
    y1 = y1 + Math.sin(angle) * (-20);
    x2 = x2 + Math.cos(angle) * (20);
    y2 = y2 + Math.sin(angle) * (20);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(((x1+x2)/2)+fugaX, ((y1+y2)/2)-fugaY, x2, y2);
    ctx.stroke();
    
    
    let arrowPoint1X = x2 + Math.cos(angle - Math.PI / 6) * (10);
    let arrowPoint1Y = y2 + Math.sin(angle - Math.PI / 6) * (10);
    let arrowPoint2X = x2 + Math.cos(angle + Math.PI / 6) * (10);
    let arrowPoint2Y = y2 + Math.sin(angle + Math.PI / 6) * (10);
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(arrowPoint1X, arrowPoint1Y);
    ctx.lineTo(arrowPoint2X, arrowPoint2Y);
    ctx.closePath();
    ctx.fill();
    
    
}

// Adiciona evento de clique no mouse
canvas.addEventListener("mousedown", function (e) {
    const mousePos = getMousePos(canvas, e);
    for(i=0;i<automato.length;i++){
        left = automato[i].x - automato[i].raio;
        right = automato[i].x + automato[i].raio;
        topp = automato[i].y - automato[i].raio;
        botton = automato[i].y + automato[i].raio;
        if(mousePos.x >= left && mousePos.x <= right && mousePos.y >= topp && mousePos.y <= botton){
            automato[i].isDragging = true;
        }
    }
});

// Adiciona evento de soltar o botão do mouse
canvas.addEventListener("mouseup", function () {
    for(i=0;i<automato.length;i++){
        automato[i].isDragging = false;
    }
});

// Adiciona evento de movimento do mouse
canvas.addEventListener("mousemove", function (e) {
    for(i=0;i<automato.length;i++){
        if (automato[i].isDragging) {
            const mousePos = getMousePos(canvas, e);
            automato[i].x = mousePos.x;
            automato[i].y = mousePos.y;
            desenha();
        }
    }
});

canvas.addEventListener("contextmenu", function(event) {
    // Impede o menu de contexto padrão de aparecer
    event.preventDefault();

    // Calcula as coordenadas relativas ao canvas
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;
    let posicaoX = event.clientX+20;
    let posicaoY = event.clientY-40;
    // Cria um menu de contexto personalizado
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.backgroundColor = "white";
    menu.style.border = "1px solid black";
    menu.style.padding = "5px";
    menu.style.left = posicaoX + "px";
    menu.style.top = posicaoY + "px";

    let estado_selecionado = false;
    for(i=0;i<automato.length;i++){
        left = automato[i].x - automato[i].raio;
        right = automato[i].x + automato[i].raio;
        topp = automato[i].y - automato[i].raio;
        botton = automato[i].y + automato[i].raio;
        if(mouseX >= left && mouseX <= right && mouseY >= topp && mouseY <= botton){
            estado_selecionado = true;
            menu.innerHTML = "S"+i+"<br>";

            const final = document.createElement("button");
            final.innerText = "tornar final";
            final.value = i;
            menu.appendChild(final);
            final.addEventListener("click", function() {
                automato[final.value].torna_final();
            });
            
            const adiciona = document.createElement("button");
            adiciona.innerText = "adicionar transicao";
            adiciona.value = i;
            menu.appendChild(adiciona);
            adiciona.addEventListener("click", function() {
                let lista_de_estados = [];
                valor = document.createElement("input");
                valor.placeholder = "valor";
                valor.size = 3;
                menu.appendChild(valor);
                for(j=0;j<automato.length;j++){
                    lista_de_estados[j] = document.createElement("button");
                    lista_de_estados[j].innerText = "S"+j;
                    (function (indice) {
                        lista_de_estados[j].addEventListener("click", function(){
                            automato[adiciona.value].adiciona_transisao(indice,valor.value);
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
            remove.addEventListener("click", function() {
                let lista_de_estados = [];
                let j = 0;
                automato[remove.value].transicoes.forEach(transicao => {
                    lista_de_estados[j] = document.createElement("button");
                    lista_de_estados[j].innerText = "S"+transicao.destino;
                    (function (indice) {
                        lista_de_estados[j].addEventListener("click", function(){
                            automato[remove.value].remove_transicao(transicao.destino);
                        });
                    })(transicao.destino);
                    menu.appendChild(lista_de_estados[j]);
                    ++j;
                });
                
            });
            
        }
    }
    if(!estado_selecionado){
        const opcao1 = document.createElement("button");
        opcao1.innerText = "adiciona estado";
        opcao1.addEventListener("click", function(){
            adiciona_estado(mouseX,mouseY);
        });
        menu.appendChild(opcao1);
    }

    document.body.appendChild(menu);

    // Adiciona um listener para remover o menu ao clicar em qualquer lugar fora dele
    document.addEventListener("mousedown", function(e) {
        if (!menu.contains(e.target)) {
            document.body.removeChild(menu);
        }
    });
});