const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d");

let automato = [];

class Estado{
    constructor(){
        this.x = 20;
        this.y = 20;
        this.raio = 20;
        this.isDragging = false;
        this.cor = "#00BFFF";
        this.transisao = new Map();
        this.final = false;
    }
    adiciona_transisao(i,valor){
        this.transisao.set(i,valor);
        desenha();
    } 
    torna_final(){
        this.final = !this.final;
        console.log(this.final);
        desenha();
    }
}

function testa_palavra(){
    palavra = document.getElementById("palavra");
    let j = 0;
    let passou = false;
    let erro = false;
    for(i=0;i<palavra.value.length;i++){
        console.log(palavra.value[i]);
        automato[j].transisao.forEach((valor,estado) => {
            if(palavra.value[i]==valor){
                j = estado;
                console.log("estado atual: "+estado);
                passou = true;
            }
        });
        if(!passou){
            erro=true;
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
    const estado = new Estado();
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
    automato[i].transisao.forEach((valor,estado) => {
        desenha_transicao(automato[i].x, automato[i].y,automato[estado].x, automato[estado].y,valor);
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
        console.log("chegou aqui");
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
    
    if(x1 == x2 && y1 == y2){
        ctx.beginPath();
        ctx.arc(x1+25, y1-20, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(valor, x1+25, y1-45);
    }else{
        ctx.fillText(valor, ((x2+x1)/2)+10, ((y2+y1)/2)-10);
    }
    
    const angle = Math.atan2(y1 - y2, x1 - x2);
    x1 = x1 + Math.cos(angle) * (-20);
    y1 = y1 + Math.sin(angle) * (-20);
    x2 = x2 + Math.cos(angle) * (20);
    y2 = y2 + Math.sin(angle) * (20);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    
    let arrowPoint1X = x2 + Math.cos(angle - Math.PI / 6) * (20);
    let arrowPoint1Y = y2 + Math.sin(angle - Math.PI / 6) * (20);
    let arrowPoint2X = x2 + Math.cos(angle + Math.PI / 6) * (20);
    let arrowPoint2Y = y2 + Math.sin(angle + Math.PI / 6) * (20);
    
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
                for(j=0;j<automato.length;j++){
                    lista_de_estados[j] = document.createElement("button");
                    lista_de_estados[j].innerText = "S"+j;
                    (function (indice) {
                        lista_de_estados[j].addEventListener("click", function(){
                            automato[adiciona.value].adiciona_transisao(indice,"0");
                        });
                    })(j);
                    menu.appendChild(lista_de_estados[j]);
                }
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