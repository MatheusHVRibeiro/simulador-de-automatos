const slider = document.getElementById("zoom");

slider.addEventListener("input", () => {
    escala = slider.value / 100;
    altera_zoom(escala);
});

canvas.addEventListener("wheel", (e) => {

    if (e.deltaY < 0 && escala < 1.95  ) {
        //scroll pra cima
        escala = escala + 0.1;
        altera_zoom(escala);
        document.getElementById("zoom").value = escala*100;

    } else if (escala > 0.35) {
        //scroll pra baixo
        escala = escala - 0.1;
        altera_zoom(escala);
        document.getElementById("zoom").value = escala*100;
    }

    // evita rolar a página junto
    e.preventDefault();
}, { passive: false });


function altera_zoom(num) {
    ctx.setTransform(num, 0, 0, num, 0, 0);
    debugCtx.setTransform(num, 0, 0, num, 0, 0);
    document.getElementById("%").innerText = Math.trunc(num * 100) + "%";
    desenha(ctx);
    desenha(debugCtx);
}


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