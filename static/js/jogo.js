let estado = { recursos: 50, comunidade: 50, seguranca: 50 };
let typewriterInterval; 
let digitando = false; 
let textoCompletoAtual = ""; 
let callbackEscolhas = null; 

document.addEventListener("DOMContentLoaded", () => {
    atualizarHUD();
    
    const urlParams = new URLSearchParams(window.location.search);
    // Alterado para Tereza de Benguela
    const idInicial = urlParams.get('historia') || 'tereza_inicio'; 
    
    carregarNo(idInicial);

    document.body.addEventListener("click", pularAnimacaoTexto);
});

async function carregarNo(id) {
    const container = document.getElementById("historia-container");
    
    if (container.style.opacity === "1" || container.style.opacity === "") {
        await gsap.to(container, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
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
            gsap.fromTo(container, { x: -10 }, { x: 10, repeat: 5, yoyo: true, duration: 0.05 });
        }

        montarTela(dados);
        
        gsap.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });

    } catch (error) {
        console.error("Erro ao carregar a história:", error);
    }
}

function montarTela(dados) {
    document.getElementById("titulo").innerText = dados.titulo;
    
    const boxFato = document.getElementById("box-fato");
    if (dados.fato_historico) {
        document.getElementById("texto-fato").innerText = dados.fato_historico;
        boxFato.style.display = "block";
        gsap.fromTo(boxFato, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.2 });
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
        btn.onclick = (e) => {
            e.stopPropagation(); 
            aplicarImpacto(escolha.impacto);
            carregarNo(escolha.proximo_id);
        };
        containerEscolhas.appendChild(btn);
    });

    textoCompletoAtual = dados.texto_principal;
    callbackEscolhas = () => {
        gsap.to(containerEscolhas, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" });
    };

    efeitoMaquinaDeEscrever(textoCompletoAtual, callbackEscolhas);
}

function efeitoMaquinaDeEscrever(texto, callback) {
    const el = document.getElementById("texto-principal");
    el.innerText = "";
    clearInterval(typewriterInterval); 
    digitando = true;
    
    let i = 0;
    typewriterInterval = setInterval(() => {
        if (i < texto.length) {
            el.innerText += texto.charAt(i);
            i++;
        } else {
            clearInterval(typewriterInterval);
            digitando = false;
            if (callback) callback();
        }
    }, 20); 
}

function pularAnimacaoTexto() {
    if (digitando) {
        clearInterval(typewriterInterval);
        document.getElementById("texto-principal").innerText = textoCompletoAtual;
        digitando = false;
        if (callbackEscolhas) callbackEscolhas();
    }
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
            estado[atributo] = Math.max(0, Math.min(100, estado[atributo] + valor));
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
    
    gsap.fromTo(span, 
        { opacity: 1, y: 0 }, 
        { opacity: 0, y: -30, duration: 1.2, ease: "power1.out", onComplete: () => span.remove() }
    );
}

function gerarRelatorioFinal(dados) {
    gsap.to(["#hud", "#historia-container"], { opacity: 0, duration: 0.5, onComplete: () => {
        document.getElementById("hud").style.display = "none";
        document.getElementById("historia-container").style.display = "none";
        
        const relatorio = document.getElementById("relatorio-container");
        relatorio.style.display = "block";
        document.body.className = "clima-normal"; 

        document.getElementById("res-recursos").innerText = `💰 ${estado.recursos}`;
        document.getElementById("res-comunidade").innerText = `🤝 ${estado.comunidade}`;
        document.getElementById("res-seguranca").innerText = `🛡️ ${estado.seguranca}`;

        let textoFinal = dados.conclusao_falha;
        if (estado.comunidade >= 60 || estado.seguranca >= 60) {
            textoFinal = dados.conclusao_sucesso;
        }

        document.getElementById("texto-conclusao").innerText = textoFinal;


        gsap.fromTo(relatorio, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
    }});
}