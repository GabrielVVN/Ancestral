let estado = { recursos: 50, comunidade: 50, seguranca: 50 };
let typewriterInterval; 

document.addEventListener("DOMContentLoaded", () => {
    atualizarHUD();
    
    // Captura o ID da história escolhida na URL (ex: ?historia=firmina_inicio)
    const urlParams = new URLSearchParams(window.location.search);
    const idInicial = urlParams.get('historia') || 'ciata_inicio'; // Fallback de segurança
    
    carregarNo(idInicial);
});

async function carregarNo(id) {
    const container = document.getElementById("historia-container");
    
    if (container.classList.contains("animar-entrada")) {
        container.classList.remove("animar-entrada");
        container.classList.add("animar-saida");
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    try {
        const response = await fetch(`/api/no/${id}`);
        const dados = await response.json();
        
        if (dados.tipo === "final") {
            gerarRelatorioFinal(dados);
            return;
        }

        document.body.className = `clima-${dados.clima}`;
        if (dados.clima === "tenso") {
            container.classList.add("tremida");
            setTimeout(() => container.classList.remove("tremida"), 400);
        }

        montarTela(dados);
        
        container.classList.remove("animar-saida");
        void container.offsetWidth; 
        container.classList.add("animar-entrada");

    } catch (error) {
        console.error("Erro:", error);
    }
}

function montarTela(dados) {
    document.getElementById("titulo").innerText = dados.titulo;
    
    const boxFato = document.getElementById("box-fato");
    if (dados.fato_historico) {
        document.getElementById("texto-fato").innerText = dados.fato_historico;
        boxFato.style.display = "block";
    } else {
        boxFato.style.display = "none";
    }

    const containerEscolhas = document.getElementById("escolhas-container");
    containerEscolhas.innerHTML = ""; 
    containerEscolhas.style.opacity = "0"; 

    dados.escolhas.forEach((escolha) => {
        const btn = document.createElement("button");
        btn.innerText = escolha.texto;
        btn.className = "btn-escolha";
        btn.onclick = () => {
            aplicarImpacto(escolha.impacto);
            carregarNo(escolha.proximo_id);
        };
        containerEscolhas.appendChild(btn);
    });

    efeitoMaquinaDeEscrever(dados.texto_principal, () => {
        containerEscolhas.style.transition = "opacity 0.5s ease";
        containerEscolhas.style.opacity = "1";
    });
}

function efeitoMaquinaDeEscrever(texto, callback) {
    const el = document.getElementById("texto-principal");
    el.innerText = "";
    clearInterval(typewriterInterval); 
    
    let i = 0;
    typewriterInterval = setInterval(() => {
        if (i < texto.length) {
            el.innerText += texto.charAt(i);
            i++;
        } else {
            clearInterval(typewriterInterval);
            if (callback) callback();
        }
    }, 20); 
}

function atualizarHUD() {
    document.getElementById("val-recursos").innerText = estado.recursos;
    document.getElementById("val-comunidade").innerText = estado.comunidade;
    document.getElementById("val-seguranca").innerText = estado.seguranca;
}

function aplicarImpacto(impacto) {
    if (!impacto) return;
    for (const atributo in impacto) {
        const valor = impacto[atributo];
        if (valor !== 0) {
            estado[atributo] += valor;
            mostrarNumeroFlutuante(atributo, valor);
        }
    }
    atualizarHUD();
}

function mostrarNumeroFlutuante(atributo, valor) {
    const hudItem = document.getElementById(`hud-${atributo}`);
    if (!hudItem) return;

    const span = document.createElement("span");
    span.className = `floating-number ${valor > 0 ? 'float-pos' : 'float-neg'}`;
    span.innerText = valor > 0 ? `+${valor}` : valor;

    hudItem.appendChild(span);
    setTimeout(() => span.remove(), 1200);
}

function gerarRelatorioFinal(dados) {
    document.getElementById("hud").style.display = "none";
    document.getElementById("historia-container").style.display = "none";
    document.body.className = "clima-normal"; 
    
    const relatorio = document.getElementById("relatorio-container");
    relatorio.style.display = "block";

    document.getElementById("res-recursos").innerText = `💰 ${estado.recursos}`;
    document.getElementById("res-comunidade").innerText = `🤝 ${estado.comunidade}`;
    document.getElementById("res-seguranca").innerText = `🛡️ ${estado.seguranca}`;

    // Lógica inteligente: o relatório muda de acordo com a pontuação final daquele eixo de história específico
    let textoFinal = dados.conclusao_falha;
    if (estado.comunidade >= 60 || estado.seguranca >= 60) {
        textoFinal = dados.conclusao_sucesso;
    }

    document.getElementById("texto-conclusao").innerText = textoFinal;
}