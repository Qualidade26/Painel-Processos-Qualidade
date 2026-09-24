/* ==========================================================
   PÁGINA — DESCARTE
========================================================== */


/* ==========================================================
   CORES — DESCARTE
========================================================== */

const coresOrigemDescarte = {

    /* AZUL */
    "Avaria de Importação": "#2855D9",
    "Avaria Importação": "#2855D9",

    /* ROSA */
    "Devolução avaria": "#FF6FAE",
    "Devolução Avaria": "#FF6FAE",

    /* VERDE */
    "Avaria estoque": "#55D98A",
    "Avaria Estoque": "#55D98A",

    /* LARANJA */
    "Avaria Nacional": "#FF7A1A",
    "Avaria de Transporte Nacional": "#FF7A1A",

    /* ROXO */
    "Certificação": "#8B6CFF",

    /* VERMELHO */
    "Vencido": "#EF4444",

    /* AZUL CLARO */
    "Desvio de Qualidade": "#79BFF2",
    "Desvio": "#79BFF2"
};
/* ==========================================================
   COR POR DESCRIÇÃO — DESCARTE
========================================================== */

function obterCorOrigemDescarte(descricao){

    const nome =
        String(descricao || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

    const mapaCores = {

        "vencido":
            "#EF4444",

        "desvio de qualidade":
            "#79BFF2",

        "desvio":
            "#79BFF2",

        "devolução avaria":
            "#FF6FAE",

        "avaria de importação":
            "#2855D9",

        "avaria importação":
            "#2855D9",

        "avaria nacional":
            "#FF7A1A",

        "avaria de transporte nacional":
            "#FF7A1A",

        "avaria estoque":
            "#55D98A",

        "certificação":
            "#8B6CFF"
    };

    return (
        mapaCores[nome] ||
        "#2855D9"
    );
}
/* ==========================================================
   FUNÇÕES AUXILIARES
========================================================== */

function calcularPercentualDescarte(valor, total){

    const valorNumerico =
        Number(valor || 0);

    const totalNumerico =
        Number(total || 0);

    if(totalNumerico <= 0){
        return 0;
    }

    return (
        valorNumerico /
        totalNumerico
    ) * 100;
}


function formatarPercentualDescarte(valor){

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:1,
                maximumFractionDigits:1
            }
        ) + "%";
}


function escaparHtmlDescarte(valor){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function nomeExibicaoOrigemDescarte(nome){

    const chave =
        String(nome || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();


    if(chave.includes("devol")){
        return "Devolução";
    }


    if(chave.includes("import")){
        return "Importação";
    }


    if(
        chave.includes("desvio") &&
        chave.includes("qualidade")
    ){
        return "Desvio de Qualidade";
    }


    if(chave.includes("nacional")){
        return "Nacional";
    }


    if(chave.includes("estoque")){
        return "Estoque";
    }


    return nome;
}

/* ==========================================================
   TOP 10 — QUANTIDADE E COR DA ORIGEM
========================================================== */

function obterCorTop10Descarte(origem) {

    const normalizar = texto =>
        String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

    const chave = normalizar(origem);

    const equivalencias = {
        "importacao": "Avaria de Importação",
        "devolucao": "Devolução avaria",
        "devolucao importacao": "Devolução avaria",
        "nacional": "Avaria Nacional",
        "estoque": "Avaria estoque",
        "desvio qualidade": "Desvio de Qualidade"
    };

    const nomeOriginal =
        equivalencias[chave] ||
        Object.keys(coresOrigemDescarte).find(
            nome => normalizar(nome) === chave
        );

    return nomeOriginal
        ? obterCorOrigemDescarte(nomeOriginal)
        : null;
}


/* ==========================================================
   ADICIONAR COLUNAS AO TOP 10
========================================================== */

function aplicarColunasTop10Descarte(produtos) {

    const tabela = document.querySelector(
        ".descarte-top10-scroll table"
    );

    if (!tabela) return;

    const cabecalhos =
        tabela.querySelectorAll("thead th");

    [2, 3].forEach(indice => {
        if (cabecalhos[indice]) {
            cabecalhos[indice].style.textAlign = "center";
        }
    });

    const linhas =
        tabela.querySelectorAll("tbody tr");

    linhas.forEach((linha, indice) => {

        const item = produtos[indice];

        const celulas =
            linha.querySelectorAll("td");

        if (!item || celulas.length !== 3) {
            if (celulas.length === 1 &&
                celulas[0].colSpan === 3) {
                celulas[0].colSpan = 5;
            }
            return;
        }

        /* QUANTIDADE */

        const quantidade =
            item.quantidade ??
            item.qtd ??
            item.qtde ??
            null;

        const tdQuantidade =
            document.createElement("td");

        tdQuantidade.style.textAlign = "center";

        tdQuantidade.textContent =
            quantidade === null || quantidade === ""
                ? "—"
                : Number.isFinite(Number(quantidade))
                    ? Number(quantidade).toLocaleString("pt-BR")
                    : String(quantidade);


        /* ORIGEM */

        const tdOrigem =
            document.createElement("td");

        tdOrigem.style.textAlign = "center";

        const origens =
            Array.isArray(item.origens) &&
            item.origens.length
                ? item.origens
                : [
                    item.origem ??
                    item.motivo ??
                    item.descricaoOrigem ??
                    null
                ];

        const coresIncluidas = new Set();

        origens.forEach(entrada => {

            const nome =
                typeof entrada === "string"
                    ? entrada
                    : entrada?.nome ??
                      entrada?.origem ??
                      entrada?.descricao ??
                      "";

            const cor =
                obterCorTop10Descarte(nome);

            if (!cor || coresIncluidas.has(cor)) {
                return;
            }

            coresIncluidas.add(cor);

            const bolinha =
                document.createElement("span");

            bolinha.style.cssText = `
                display:inline-block;
                width:10px;
                height:10px;
                border-radius:50%;
                background-color:${cor};
                vertical-align:middle;
                margin:0 2px;
            `;

            bolinha.title =
                nomeExibicaoOrigemDescarte(nome);

            bolinha.setAttribute(
                "aria-label",
                nome
            );

            tdOrigem.appendChild(bolinha);

        });

        if (!coresIncluidas.size) {
            tdOrigem.textContent = "—";
        }


        /* INSERIR AS COLUNAS ANTES DO VALOR */

        linha.insertBefore(
            tdQuantidade,
            celulas[2]
        );

        linha.insertBefore(
            tdOrigem,
            celulas[2]
        );

        celulas[2].style.textAlign = "right";

    });

}
/* ==========================================================
   TOP 3 ORIGENS
========================================================== */

function montarTop3Descarte(origens){

    const lista =
        Array.isArray(origens)
            ? [...origens]
            : [];


    const top3 =
        lista
            .sort(
                (a,b) =>
                    Number(b.valor || 0) -
                    Number(a.valor || 0)
            )
            .slice(0,3);


    if(!top3.length){

        return `

            <div class="descarte-top3-vazio">

                Nenhuma origem registrada.

            </div>
        `;
    }


    return `

        <div class="descarte-top3-grid">

            ${top3.map((item, indice) => {

              const nomeOriginal =
    item.nome ||
    item.origem ||
    "Sem origem";


const nome =
    nomeExibicaoOrigemDescarte(
        nomeOriginal
    );


const valor =
    Number(item.valor || 0);


/* COR CONTINUA USANDO O NOME ORIGINAL */
const cor =
    obterCorOrigemDescarte(
        nomeOriginal
    );


                return `

                    <article class="descarte-top3-card">

                        <div class="descarte-top3-cabecalho">

                            <span
                                class="descarte-top3-posicao"
                                style="background:${cor};"
                            >
                                ${indice + 1}
                            </span>


                            <span class="descarte-top3-nome">

                                ${escaparHtmlDescarte(nome)}

                            </span>


                            <span class="descarte-top3-seta">

                                ◆

                            </span>

                        </div>


                        <strong class="descarte-top3-valor">

                            ${moeda(valor)}

                        </strong>

                    </article>
                `;

            }).join("")}

        </div>
    `;
}


/* ==========================================================
   DESTRUIR GRÁFICOS
========================================================== */

function destruirGraficosDescarte(){

    if(
        window.graficoDescarteBarra &&
        typeof window.graficoDescarteBarra.destroy ===
        "function"
    ){

        window.graficoDescarteBarra.destroy();

        window.graficoDescarteBarra =
            null;
    }
}

/* ==========================================================
   SCROLL INFINITO — ESTILO PAINEL DE AEROPORTO
========================================================== */

let animacaoScrollTop10Descarte = null;

function pararScrollAutomaticoTop10Descarte(){

    if(animacaoScrollTop10Descarte){

        cancelAnimationFrame(
            animacaoScrollTop10Descarte
        );

        animacaoScrollTop10Descarte = null;
    }
}


function iniciarScrollAutomaticoTop10Descarte(){

    pararScrollAutomaticoTop10Descarte();


    const areaScroll =
        document.querySelector(
            ".descarte-top10-scroll .table-scroll"
        );


    if(!areaScroll){
        return;
    }


    const tabela =
        areaScroll.querySelector("table");


    const corpoTabela =
        tabela?.querySelector("tbody");


    if(
        !tabela ||
        !corpoTabela
    ){
        return;
    }


    /*
    Remove uma duplicação anterior, caso a aba
    seja renderizada novamente.
    */

    corpoTabela
        .querySelectorAll(
            'tr[data-scroll-copia="true"]'
        )
        .forEach(
            linha => linha.remove()
        );


    const linhasOriginais =
        Array.from(
            corpoTabela.querySelectorAll(
                "tr"
            )
        );


    if(!linhasOriginais.length){
        return;
    }


    /*
    Se não existir conteúdo suficiente para rolar,
    não inicia a animação.
    */

    if(
        areaScroll.scrollHeight <=
        areaScroll.clientHeight
    ){
        return;
    }


    /*
    Duplica as linhas originais.
    A segunda lista cria a continuidade visual.
    */

    linhasOriginais.forEach(
        linhaOriginal => {

            const linhaCopia =
                linhaOriginal.cloneNode(true);

            linhaCopia.setAttribute(
                "data-scroll-copia",
                "true"
            );

            linhaCopia.setAttribute(
                "aria-hidden",
                "true"
            );

            corpoTabela.appendChild(
                linhaCopia
            );
        }
    );


    /*
    A altura da primeira lista é exatamente
    a distância necessária para reiniciar
    sem que o usuário perceba.
    */

    const primeiraLinha =
        linhasOriginais[0];


    const primeiraLinhaCopia =
        corpoTabela.querySelector(
            'tr[data-scroll-copia="true"]'
        );


    if(
        !primeiraLinha ||
        !primeiraLinhaCopia
    ){
        return;
    }


    const inicioOriginal =
        primeiraLinha.offsetTop;


    const inicioCopia =
        primeiraLinhaCopia.offsetTop;


    const alturaListaOriginal =
        inicioCopia -
        inicioOriginal;


    if(alturaListaOriginal <= 0){
        return;
    }


    areaScroll.scrollTop = 0;


    let pausado = false;

    let posicaoAtual = 0;

    let tempoAnterior = null;


    /*
    Velocidade em pixels por segundo.
    Diminua para deixar mais lento.
    Aumente para deixar mais rápido.
    */

    const velocidade = 18;


    areaScroll.onmouseenter = () => {

        pausado = true;
    };


    areaScroll.onmouseleave = () => {

        pausado = false;

        tempoAnterior = null;
    };


    areaScroll.onfocusin = () => {

        pausado = true;
    };


    areaScroll.onfocusout = () => {

        pausado = false;

        tempoAnterior = null;
    };


    function animarScroll(tempoAtual){

        if(!document.body.contains(areaScroll)){

            pararScrollAutomaticoTop10Descarte();

            return;
        }


        if(tempoAnterior === null){

            tempoAnterior = tempoAtual;
        }


        const tempoDecorrido =
            tempoAtual -
            tempoAnterior;


        tempoAnterior = tempoAtual;


        if(!pausado){

            posicaoAtual +=
                velocidade *
                (
                    tempoDecorrido /
                    1000
                );


            /*
            Quando chega ao início da lista duplicada,
            remove exatamente a altura da lista original.

            Visualmente, nada muda porque a cópia
            é idêntica à primeira lista.
            */

            if(
                posicaoAtual >=
                alturaListaOriginal
            ){

                posicaoAtual -=
                    alturaListaOriginal;
            }


            areaScroll.scrollTop =
                posicaoAtual;
        }


        animacaoScrollTop10Descarte =
            requestAnimationFrame(
                animarScroll
            );
    }


    animacaoScrollTop10Descarte =
        requestAnimationFrame(
            animarScroll
        );
}

/* ==========================================================
   ABA INTERNA — DESCARTE
========================================================== */

let abaInternaDescarte = "atual";


/* ==========================================================
   TROCAR ABA INTERNA
========================================================== */

function trocarAbaDescarte(aba){

    if(
        aba !== "atual" &&
        aba !== "descartado"
    ){
        return;
    }

    abaInternaDescarte = aba;

    renderDescarte();
}


/* ==========================================================
   CRIAR GRÁFICO — DESCARTE POR ORIGEM
   MOSTRA % + VALOR EM R$
========================================================== */

function criarGraficoDescarteOrigemResumo(
    origens,
    canvasId = "graficoDescarteOrigem"
){

    const canvas =
        document.getElementById(canvasId);

    if(!canvas){
        return;
    }


    /*
       Destrói gráfico anterior.
    */

    if(
        window.graficoDescarteBarra &&
        typeof window.graficoDescarteBarra.destroy ===
        "function"
    ){

        window.graficoDescarteBarra.destroy();

        window.graficoDescarteBarra = null;
    }


    const lista =
        Array.isArray(origens)
            ? [...origens]
            : [];


    /*
       Ordena maior → menor.
    */

    lista.sort(
        (a,b) =>
            Number(b.valor || 0) -
            Number(a.valor || 0)
    );


    const total =
        lista.reduce(
            (soma,item) =>
                soma +
                Number(item.valor || 0),
            0
        );


   const labels =
    lista.map(
        item =>
            nomeExibicaoOrigemDescarte(
                item.nome ||
                item.origem ||
                "Sem origem"
            )
    );


    const valores =
        lista.map(
            item =>
                Number(item.valor || 0)
        );

const cores =
    lista.map(item => {

        const nome =
            item.nome ||
            item.origem ||
            "";

        return obterCorOrigemDescarte(
            nome
        );
    });


  /* ======================================================
   PLUGIN — PORCENTAGEM + VALOR NO FINAL DA BARRA
====================================================== */

const rotuloPercentualValorDescarte = {

    id:"rotuloPercentualValorDescarte",

    afterDraw(chart){

        const dataset =
            chart.data.datasets[0];

        const meta =
            chart.getDatasetMeta(0);

        if(
            !dataset ||
            !meta ||
            !Array.isArray(meta.data)
        ){
            return;
        }


        const ctx =
            chart.ctx;

        const area =
            chart.chartArea;


        ctx.save();


        /* ==================================================
           POSIÇÃO DA COLUNA DE PORCENTAGEM
        ================================================== */

        const colunaPercentual =
            area.right + 68;


        /* ==================================================
           CABEÇALHO
        ================================================== */

        ctx.textBaseline =
            "middle";

        ctx.font =
            "900 10px 'Segoe UI', Arial, sans-serif";

        ctx.fillStyle =
            "#0647f5";

        ctx.textAlign =
            "right";

        ctx.fillText(
            "PORCENTAGEM",
            colunaPercentual,
            area.top - 13
        );


        /* ==================================================
           DADOS
        ================================================== */

        meta.data.forEach(
            (barra, indice) => {

                const valor =
                    Number(
                        dataset.data[indice] || 0
                    );


                if(valor <= 0){
                    return;
                }


                const percentual =
                    calcularPercentualDescarte(
                        valor,
                        total
                    );


                const propriedades =
                    barra.getProps(
                        ["x","y"],
                        true
                    );

                /* ==========================================
                   COLUNA DE PORCENTAGEM
                ========================================== */

                ctx.textAlign =
                    "right";

                ctx.fillStyle =
                    "#0f2557";

                ctx.fillText(
                    formatarPercentualDescarte(
                        percentual
                    ),
                    colunaPercentual,
                    propriedades.y
                );
            }
        );


        ctx.restore();
    }
};
   
    /* ======================================================
       CHART
    ====================================================== */

    window.graficoDescarteBarra =
        new Chart(
            canvas,
            {

                type:"bar",

                plugins:[
                    rotuloPercentualValorDescarte
                ],

                data:{

                    labels,

                    datasets:[{

                        label:
                            "Descarte por origem",

                        data:
                            valores,

                        backgroundColor:
                            cores,

                        borderWidth:
                            0,

                        borderRadius:
                            5,

                        borderSkipped:
                            false,

                        barPercentage:
                            .68,

                        categoryPercentage:
                            .74
                    }]
                },


                options:{

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false,

                    animation:{

                        duration:300
                    },


                    layout:{

                       padding:{
    top:26,
    right:120,
    bottom:4,
    left:4
}
                    },

plugins:{

    datalabels:{
        display:false
    },

    rotulosExternos:{
        display:false
    },

    legend:{
        display:false
    },

                        tooltip:{

                            displayColors:false,

                            callbacks:{

                                title(context){

                                    return (
                                        context[0]?.label ||
                                        "Sem origem"
                                    );
                                },


                                label(context){

                                    const valor =
                                        Number(
                                            context.raw || 0
                                        );


                                    const percentual =
                                        calcularPercentualDescarte(
                                            valor,
                                            total
                                        );


                                    return (
                                        formatarPercentualDescarte(
                                            percentual
                                        ) +
                                        " | " +
                                        moeda(valor)
                                    );
                                }
                            }
                        }
                    },


                    scales:{

                        x:{

                            beginAtZero:true,

                            grace:"8%",

                            border:{

                                display:false
                            },

                            grid:{

                                color:
                                    "rgba(15,37,87,.08)",

                                drawBorder:false
                            },

                            ticks:{

                                color:"#64748b",

                                maxTicksLimit:6,

                                font:{

                                    size:10,

                                    weight:"800"
                                },


                                callback(valor){

                                    const numero =
                                        Number(valor || 0);


                                    if(
                                        Math.abs(numero) >=
                                        1000000
                                    ){

                                        return (
                                            "R$ " +
                                            (
                                                numero /
                                                1000000
                                            )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:1
                                                }
                                            ) +
                                            " mi"
                                        );
                                    }


                                    if(
                                        Math.abs(numero) >=
                                        1000
                                    ){

                                        return (
                                            "R$ " +
                                            (
                                                numero /
                                                1000
                                            )
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    maximumFractionDigits:0
                                                }
                                            ) +
                                            " mil"
                                        );
                                    }


                                    return (
                                        "R$ " +
                                        numero.toLocaleString(
                                            "pt-BR"
                                        )
                                    );
                                }
                            }
                        },


                        y:{

                            border:{

                                display:false
                            },

                            grid:{

                                display:false
                            },

                            ticks:{

                                color:"#0f2557",

                                padding:8,

                                autoSkip:false,

                                font:{

                                    size:11,

                                    weight:"900"
                                }
                            }
                        }
                    }
                }
            }
        );


    graficoAtual =
        window.graficoDescarteBarra;
}

/* ==========================================================
   TABELA — GASTO AMBIENTAL
========================================================== */

function montarTabelaGastoAmbiental(custoAmbiental){

    const dados =
        custoAmbiental &&
        typeof custoAmbiental === "object"
            ? custoAmbiental
            : {};


    const primeiroSemestre =
        Number(
            dados.totalPrimeiroSemestre || 0
        );


    const segundoSemestre =
        Number(
            dados.totalSegundoSemestre || 0
        );


    /* ======================================================
       DESCOBRIR MÊS COM GASTO
    ====================================================== */

    const nomesMeses = {
        janeiro:"Janeiro",
        fevereiro:"Fevereiro",
        marco:"Março",
        abril:"Abril",
        maio:"Maio",
        junho:"Junho",
        julho:"Julho",
        agosto:"Agosto",
        setembro:"Setembro",
        outubro:"Outubro",
        novembro:"Novembro",
        dezembro:"Dezembro"
    };


    function obterMesComGasto(objeto){

        if(
            !objeto ||
            typeof objeto !== "object"
        ){
            return "-";
        }


        const encontrado =
            Object.entries(objeto)
                .find(
                    ([mes,valor]) =>
                        Number(valor || 0) > 0
                );


        if(!encontrado){
            return "-";
        }


        return (
            nomesMeses[encontrado[0]] ||
            encontrado[0]
        );
    }


    const mesPrimeiroSemestre =
        obterMesComGasto(
            dados.primeiroSemestre
        );


    const mesSegundoSemestre =
        obterMesComGasto(
            dados.segundoSemestre
        );


    return `

        <div class="descarte-ambiental-tabela">

            <table>

                <thead>

                    <tr>

                        <th>
                            Período
                        </th>

                        <th>
                            Valor
                        </th>

                        <th>
                            Observação
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            1º Semestre
                        </td>

                        <td>
                            ${moeda(primeiroSemestre)}
                        </td>

                        <td>
                            ${mesPrimeiroSemestre}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            2º Semestre
                        </td>

                        <td>
                            ${moeda(segundoSemestre)}
                        </td>

                        <td>
                            ${mesSegundoSemestre}
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>
    `;
}
/* ==========================================================
   RENDERIZAR PÁGINA
========================================================== */

function renderDescarte(){

  /* ======================================================
   SENHA
   No modo apresentação, o Descarte abre sem senha
====================================================== */

const modoApresentacaoAtivo =
    document.body.classList.contains(
        "modo-apresentacao"
    );


if(
    !senhaDescarteLiberada &&
    !modoApresentacaoAtivo
){

    conteudo.innerHTML = `

        <div class="senha-box">

            <h2>
                🔒 Área Restrita - Descarte
            </h2>

            <p>
                Digite a senha para acessar as informações.
            </p>

            <input
                type="password"
                id="senhaDescarte"
                placeholder="Digite a senha"
                autocomplete="current-password"
                onkeydown="
                    if(event.key === 'Enter'){
                        validarSenhaDescarte();
                    }
                "
            >

            <button
                type="button"
                class="btn"
                onclick="validarSenhaDescarte()"
            >
                Acessar
            </button>

            <p
                id="erroSenha"
                style="
                    color:#ef4444;
                    font-weight:900;
                "
            ></p>

        </div>
    `;

    return;
}
    /* ======================================================
       LIMPEZA
    ====================================================== */

    destruirGraficosDescarte();

    pararScrollAutomaticoTop10Descarte();


  /* ======================================================
   DADOS GERAIS
====================================================== */

const d =
    dados.descarte || {};


/* ======================================================
   VALOR ATUAL
====================================================== */

const valorAtual =
    d.valorAtual || {};

const origensAtual =
    Array.isArray(valorAtual.origens)
        ? valorAtual.origens
        : [];

const totalAtual =
    Number(valorAtual.total || 0);


/* ======================================================
   DESCARTADO NO ANO
====================================================== */

const descartadoAno =
    d.descartadoAno || {};

const origensDescartado =
    Array.isArray(descartadoAno.origens)
        ? descartadoAno.origens
        : [];

const topDescartado =
    Array.isArray(descartadoAno.top10)
        ? [...descartadoAno.top10]
        : [];

topDescartado.sort(
    (a, b) =>
        Number(b.valor || 0) -
        Number(a.valor || 0)
);

const totalDescartado =
    Number(
        descartadoAno.total || 0
    );


/* ======================================================
   CUSTO AMBIENTAL
====================================================== */

const custoAmbiental =
    descartadoAno.custoAmbiental || {};

const totalPrimeiroSemestre =
    Number(
        custoAmbiental.totalPrimeiroSemestre || 0
    );

const totalSegundoSemestre =
    Number(
        custoAmbiental.totalSegundoSemestre || 0
    );

const primeiroSemestre =
    custoAmbiental.primeiroSemestre || {};

const segundoSemestre =
    custoAmbiental.segundoSemestre || {};

    /* ======================================================
       HTML PRINCIPAL
    ====================================================== */

    conteudo.innerHTML = `

        <section class="pagina-descarte">

            <div class="page-title">

                🗑 DESCARTE

            </div>


            <!-- =============================================
                 CARDS
            ============================================== -->

            <section
                class="cards descarte-indicadores"
            >

                ${card(
                    "🗑",
                    "Valor Atual",
                    moeda(totalAtual),
                    "Aguardando destinação"
                )}


                ${card(
                    "📋",
                    "Descartado no Ano",
                    moeda(totalDescartado),
                    "Operações concluídas"
                )}

            </section>


            <!-- =============================================
                 ABAS INTERNAS
            ============================================== -->

            <section
                class="descarte-abas"
            >

                <button
                    type="button"
                    class="
                        descarte-aba
                        ${
                            abaInternaDescarte ===
                            "atual"
                                ? "ativa"
                                : ""
                        }
                    "
                    onclick="
                        trocarAbaDescarte('atual')
                    "
                >

                    <span>
                        🗑
                    </span>

                    <span>

                        <strong>
                            Valor Atual
                        </strong>

                    </span>

                </button>


                <button
                    type="button"
                    class="
                        descarte-aba
                        ${
                            abaInternaDescarte ===
                            "descartado"
                                ? "ativa"
                                : ""
                        }
                    "
                    onclick="
                        trocarAbaDescarte(
                            'descartado'
                        )
                    "
                >

                    <span>
                        📋
                    </span>

                    <span>

                        <strong>
                            Descartado por Ano
                        </strong>
                    </span>

                </button>

            </section>


            <!-- =============================================
                 CONTEÚDO DAS ABAS
            ============================================== -->

            <section
                id="conteudoInternoDescarte"
                class="descarte-conteudo-interno"
            >

                ${
                    abaInternaDescarte ===
                    "atual"

                        ?

                        `

                        <!-- ===================================
                             VALOR ATUAL
                        ==================================== -->

                        <div
                            class="
                                panel
                                descarte-panel-origens
                                descarte-panel-atual
                            "
                        >

                            <h3
                                class="
                                    descarte-titulo-painel
                                "
                            >

                                📊 Descarte por Origem

                            </h3>


                            <div
                                class="
                                    descarte-chart-barra
                                    descarte-chart-barra-atual
                                "
                            >

                                <canvas
                                    id="graficoDescarteOrigem"
                                ></canvas>

                            </div>


                            <section
                                class="
                                    descarte-top3-area
                                "
                            >

                                <h3
                                    class="
                                        descarte-titulo-top3
                                    "
                                >

                                    Top 3 Origens de Destino

                                </h3>


                                ${
                                    montarTop3Descarte(
                                        origensAtual
                                    )
                                }

                            </section>

                        </div>

                        `

                        :

                        `

                        <!-- ===================================
                             DESCARTADO NO ANO
                        ==================================== -->

                        <section
                            class="
                                descarte-grid-ano
                            "
                        >


                            <!-- COLUNA ESQUERDA -->

                            <div
                                class="
                                    descarte-coluna-ano
                                "
                            >

                                <div
                                    class="
                                        panel
                                        descarte-panel-origens
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                        "
                                    >

                                        📊 Descarte por Origem

                                    </h3>


                                    <div
                                        class="
                                            descarte-chart-barra
                                        "
                                    >

                                       <canvas id="graficoDescarteOrigem"></canvas>

                                    </div>


                                    <section
                                        class="
                                            descarte-top3-area
                                        "
                                    >

                                        <h3
                                            class="
                                                descarte-titulo-top3
                                            "
                                        >

                                            Top 3 Origens de Destino

                                        </h3>


                                        ${
                                            montarTop3Descarte(
                                                origensDescartado
                                            )
                                        }

                                    </section>

                                </div>

                            </div>


                            <!-- COLUNA DIREITA -->

                            <div
                                class="
                                    descarte-coluna-ano
                                    descarte-coluna-ano-direita
                                "
                            >


                                <!-- TOP 10 -->

                                <div
                                    class="
                                        panel
                                        descarte-panel-top10
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                            descarte-top10-titulo
                                        "
                                    >

                                        Top 10 Descartados por Produto

                                    </h3>


                                    <div
                                        class="
                                            descarte-top10-scroll
                                        "
                                    >

                                        ${
                                           tabelaFixa(
    [
        "SKU",
        "Descrição",
        "Qtd",
        "Origem",
        "Valor"
    ],

    montarLinhasTopDescarte(
        topDescartado
    ),

    true
)
                                        }

                                    </div>

                                </div>


                                <!-- AMBIENTAL -->

                                <div
                                    class="
                                        panel
                                        descarte-panel-ambiental
                                    "
                                >

                                    <h3
                                        class="
                                            descarte-titulo-painel
                                        "
                                    >

                                        🌱 Gasto com Ambiental Semestral

                                    </h3>


                               ${
    montarTabelaGastoAmbiental(
        custoAmbiental
    )
}

                                </div>


                            </div>

                        </section>

                        `
                }

            </section>

        </section>
    `;

/* ======================================================
   APLICAR QUANTIDADE E ORIGEM AO TOP 10
====================================================== */

if (abaInternaDescarte === "descartado") {

    aplicarColunasTop10Descarte(
        topDescartado
    );

}
    /* ======================================================
       CRIAR GRÁFICO DA ABA ATIVA
    ====================================================== */

    if(
        abaInternaDescarte ===
        "atual"
    ){

        criarGraficoDescarteOrigemResumo(
            origensAtual
        );

        return;
    }


    criarGraficoDescarteOrigemResumo(
        origensDescartado
    );


    /*
       Scroll somente no
       Descartado por Ano.
    */

    setTimeout(
        () => {

            iniciarScrollAutomaticoTop10Descarte();

        },
        80
    );
}
/* ==========================================================
   VALIDAR SENHA
========================================================== */

function validarSenhaDescarte(){

    const campoSenha =
        document.getElementById(
            "senhaDescarte"
        );


    const erroSenha =
        document.getElementById(
            "erroSenha"
        );


    if(!campoSenha){
        return;
    }


    const senha =
        campoSenha.value.trim();


    if(senha === "SGQ2026"){

        senhaDescarteLiberada =
            true;

        renderDescarte();

        return;
    }


    if(erroSenha){

        erroSenha.innerText =
            "Senha incorreta.";
    }


    campoSenha.focus();

    campoSenha.select();
}
