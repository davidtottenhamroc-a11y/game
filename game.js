const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let personagemAtual = "Vader";
let faseAtual = 1;
let jogoPausado = false;

const planetas = [
    { id: 1, nome: "Moraband / Korriban", cor: "#ff0033", fundo: "#1a080c" },
    { id: 2, nome: "Coruscant Nível 1313", cor: "#00f0ff", fundo: "#06151a" },
    { id: 3, nome: "Mustafar", cor: "#ff6600", fundo: "#1c0d05" },
    { id: 4, nome: "Ilum / Starkiller", cor: "#64c8ff", fundo: "#0a131a" },
    { id: 5, nome: "O Véu do Vazio", cor: "#8c28dc", fundo: "#12081c" }
];

let jogador = {
    x: 100, y: 450, largura: 38, altura: 65,
    velX: 0, velY: 0, gravidade: 0.55, noChao: false,
    velocidade: 5, pulo: -13, hp: 6, hpMax: 6, cor: "#ff0033"
};

let inimigos = [];
let particulas = [];
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
    jogador.hpMax = cfg.hp;
    jogador.cor = cfg.cor;
    jogador.velocidade = cfg.vel;
    jogador.pulo = cfg.pulo;
    mudarTela("menu-screen");
}

function selecionarMundo(faseNum) {
    faseAtual = faseNum;
    iniciarJogo();
}

function iniciarJogo() {
    mudarTela("game-screen");
    carregarFase(faseAtual);
    jogoPausado = false;
    loopJogo();
}

function retornarJogo() {
    document.getElementById("pause-screen").classList.add("hidden");
    jogoPausado = false;
    loopJogo();
}

function fecharPausa() {
    jogoPausado = false;
}

function carregarFase(num) {
    jogador.x = 100;
    jogador.y = 450;
    jogador.velY = 0;
    particulas = [];
    
    if (num % 10 === 0) {
        // Chefe de Planeta
        inimigos = [{ x: 850, y: 480, largura: 65, altura: 85, hp: 10, maxHp: 10, corChefe: "#ff00ff" }];
    } else {
        inimigos = [
            { x: 550, y: 530, largura: 40, altura: 50, hp: 2, maxHp: 2 },
            { x: 900, y: 530, largura: 40, altura: 50, hp: 2, maxHp: 2 }
        ];
    }
}

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Escape" && !document.getElementById("game-screen").classList.contains("hidden")) {
        if (!jogoPausado) {
            jogoPausado = true;
            document.getElementById("pause-screen").classList.remove("hidden");
        } else {
            retornarJogo();
        }
    }
    if (e.code === "Space" && !jogoPausado) {
        if (jogador.noChao) {
            jogador.velY = jogador.pulo;
            jogador.noChao = false;
            criarParticulas(jogador.x + 15, jogador.y + 60, "#ffffff", 5);
        }
    }
    // Pogo Attack (Seta para baixo ou tecla S no ar)
    if ((e.code === "ArrowDown" || e.code === "KeyS") && !jogador.noChao && !jogoPausado) {
        inimigos.forEach((inimigo, index) => {
            if (jogador.x < inimigo.x + inimigo.largura && jogador.x + jogador.largura > inimigo.x &&
                jogador.y + jogador.altura >= inimigo.y && jogador.y <= inimigo.y + inimigo.altura) {
                jogador.velY = -11.5; // Pogo Bounce
                inimigo.hp -= 1;
                criarParticulas(inimigo.x + 20, inimigo.y + 20, "#00f0ff", 8);
                if (inimigo.hp <= 0) inimigos.splice(index, 1);
            }
        });
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

function criarParticulas(x, y, cor, qtd) {
    for (let i = 0; i < qtd; i++) {
        particulas.push({
            x: x, y: y,
            velX: (Math.random() - 0.5) * 6,
            velY: (Math.random() - 0.5) * 6,
            vida: 30,
            cor: cor
        });
    }
}

function atualizar() {
    if (jogoPausado) return;

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

    // Atualizar partículas
    particulas.forEach((p, idx) => {
        p.x += p.velX;
        p.y += p.velY;
        p.vida--;
        if (p.vida <= 0) particulas.splice(idx, 1);
    });

    // Avançar de fase se derrotar todos os inimigos
    if (inimigos.length === 0) {
        if (faseAtual < 50) {
            faseAtual++;
            carregarFase(faseAtual);
        } else {
            alert("Glória galáctica! Você completou todas as 50 fases!");
            faseAtual = 1;
            mudarTela("menu-screen");
        }
    }
}

function desenhar() {
    let idPlaneta = Math.min(5, Math.floor((faseAtual - 1) / 10) + 1);
    let planeta = planetas[idPlaneta - 1];

    // Fundo dinâmico por planeta
    ctx.fillStyle = planeta.fundo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chão detalhado com linha de neon
    ctx.fillStyle = "#161b26";
    ctx.fillRect(0, 580, canvas.width, 140);
    ctx.strokeStyle = planeta.cor;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = planeta.cor;
    ctx.beginPath();
    ctx.moveTo(0, 580);
    ctx.lineTo(canvas.width, 580);
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Desenhar Partículas
    particulas.forEach(p => {
        ctx.fillStyle = p.cor;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    // Desenhar Jogador com efeito de brilho
    ctx.shadowBlur = 12;
    ctx.shadowColor = jogador.cor;
    ctx.fillStyle = jogador.cor;
    ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Lâmina de Sabre de Luz Estilizada
    let sabreX = (jogador.velX < 0) ? jogador.x - 25 : jogador.x + jogador.largura + 5;
    ctx.fillStyle = "#ffffff"; // Núcleo branco do plasma
    ctx.fillRect(sabreX, jogador.y + 22, 25, 6);
    ctx.shadowBlur = 0;

    // Desenhar Inimigos / Chefes
    inimigos.forEach(inm => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0033";
        ctx.fillStyle = inm.corChefe || "#dc3c3c";
        ctx.fillRect(inm.x, inm.y, inm.largura, inm.altura);
        ctx.shadowBlur = 0;
    });

    // Atualizar HUD com Corações estilizados
    let coracoes = "💖".repeat(jogador.hp) + "🖤".repeat(Math.max(0, jogador.hpMax - jogador.hp));
    document.getElementById("hud-planeta").innerText = `Planeta ${idPlaneta}: ${planeta.nome}`;
    document.getElementById("hud-fase").innerText = `Fase ${faseAtual}/50`;
    document.getElementById("hud-heroi").innerText = `Herói: ${personagemAtual}`;
    document.getElementById("hud-hp").innerText = `HP: ${coracoes}`;
}

function loopJogo() {
    if (document.getElementById("game-screen").classList.contains("hidden") || jogoPausado) return;
    atualizar();
    desenhar();
    requestAnimationFrame(loopJogo);
}
