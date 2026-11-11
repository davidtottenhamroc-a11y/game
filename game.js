const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let personagemAtual = "Vader";
let faseAtual = 1;
const planetas = [
    { nome: "Moraband / Korriban", cor: "#ff0033" },
    { nome: "Coruscant Nível 1313", cor: "#00f0ff" },
    { nome: "Mustafar", cor: "#ff6600" },
    { nome: "Ilum / Starkiller", cor: "#64c8ff" },
    { nome: "O Véu do Vazio", cor: "#8c28dc" }
];

let jogador = {
    x: 100, y: 450, largura: 36, altura: 64,
    velX: 0, velY: 0, gravidade: 0.55, noChao: false,
    velocidade: 5, pulo: -13, hp: 6, cor: "#ff0033"
};

let inimigos = [];
let keys = {};

const personagensConfig = {
    "Vader": { hp: 6, cor: "#ff0033", vel: 4.5, pulo: -13 },
    "Kylo": { hp: 4, cor: "#ff0033", vel: 6.0, pulo: -14 },
    "Luke": { hp: 5, cor: "#32ff78", vel: 5.5, pulo: -14.5 },
    "Rey": { hp: 4, cor: "#ffd700", vel: 6.5, pulo: -14 }
};

function mudarTela(idTela) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(idTela).classList.remove("hidden");
}

function escolherPersonagem(nome) {
    personagemAtual = nome;
    let cfg = personagensConfig[nome];
    jogador.hp = cfg.hp;
    jogador.cor = cfg.cor;
    jogador.velocidade = cfg.vel;
    jogador.pulo = cfg.pulo;
    mudarTela("menu-screen");
}

function iniciarJogo() {
    mudarTela("game-screen");
    carregarFase(faseAtual);
    loopJogo();
}

function carregarFase(num) {
    jogador.x = 100;
    jogador.y = 450;
    jogador.velY = 0;
    inimigos = [
        { x: 500, y: 530, largura: 40, altura: 50, hp: 2 },
        { x: 850, y: 530, largura: 40, altura: 50, hp: 2 }
    ];
}

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space") {
        if (jogador.noChao) {
            jogador.velY = jogador.pulo;
            jogador.noChao = false;
        }
    }
    // Pogo Attack (Seta para baixo ou tecla S no ar)
    if ((e.code === "ArrowDown" || e.code === "KeyS") && !jogador.noChao) {
        inimigos.forEach((inimigo, index) => {
            if (jogador.x < inimigo.x + inimigo.largura && jogador.x + jogador.largura > inimigo.x &&
                jogador.y + jogador.altura >= inimigo.y && jogador.y <= inimigo.y + inimigo.altura) {
                jogador.velY = -11; // Quicar no ar (Pogo)
                inimigo.hp -= 1;
                if (inimigo.hp <= 0) inimigos.splice(index, 1);
            }
        });
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

function atualizar() {
    jogador.velX = 0;
    if (keys["ArrowLeft"] || keys["KeyA"]) jogador.velX = -jogador.velocidade;
    if (keys["ArrowRight"] || keys["KeyD"]) jogador.velX = jogador.velocidade;

    jogador.velY += jogador.gravidade;
    jogador.x += jogador.velX;
    jogador.y += jogador.velY;

    // Colisão com o solo
    if (jogador.y + jogador.altura >= 580) {
        jogador.y = 580 - jogador.altura;
        jogador.velY = 0;
        jogador.noChao = true;
    }

    if (jogador.x < 0) jogador.x = 0;
    if (jogador.x > canvas.width - jogador.largura) jogador.x = canvas.width - jogador.largura;

    // Condição de vitória da fase (se derrotar todos os inimigos)
    if (inimigos.length === 0) {
        if (faseAtual < 50) {
            faseAtual++;
            carregarFase(faseAtual);
        } else {
            alert("Parabéns! Você completou todas as 50 fases!");
            faseAtual = 1;
            mudarTela("menu-screen");
        }
    }
}

function desenhar() {
    ctx.fillStyle = "#0b0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let idPlaneta = Math.min(5, Math.floor((faseAtual - 1) / 10) + 1);
    let planeta = planetas[idPlaneta - 1];

    // Chão
    ctx.fillStyle = planeta.cor;
    ctx.fillRect(0, 580, canvas.width, 140);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 580);
    ctx.lineTo(canvas.width, 580);
    ctx.stroke();

    // Jogador
    ctx.fillStyle = jogador.cor;
    ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Inimigos
    ctx.fillStyle = "#dc3c3c";
    inimigos.forEach(inm => {
        ctx.fillRect(inm.x, inm.y, inm.largura, inm.altura);
    });

    // Atualizar HUD na tela
    document.getElementById("hud-planeta").innerText = `Planeta ${idPlaneta}: ${planeta.nome}`;
    document.getElementById("hud-fase").innerText = `Fase ${faseAtual}/50`;
    document.getElementById("hud-heroi").innerText = `Herói: ${personagem_atual}`;
}

function loopJogo() {
    if (document.getElementById("game-screen").classList.contains("hidden")) return;
    atualizar();
    desenhar();
    requestAnimationFrame(loopJogo);
}
