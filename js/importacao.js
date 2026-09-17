
/* ==========================================================
   PÁGINA — INSPEÇÃO DE IMPORTAÇÃO
========================================================== */


/* ==========================================================
   INSTÂNCIAS DOS GRÁFICOS
========================================================== */
let graficoMensalImportacao = null;
let graficoSkuImportacao = null;
let abaInternaImportacao = "resumo";


/* ==========================================================
   CONVERSÃO DOS VALORES DOS GRÁFICOS
========================================================== */

function valorGraficoImportacao(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    let valorNormalizado =
        String(valor).trim();


    /*
    ----------------------------------------------------------
    Formatos aceitos:

    10,5       → 10.5
    10.5       → 10.5
    1.250,50   → 1250.50
    1,250.50   → 1250.50
    ----------------------------------------------------------
    */

    if (
        valorNormalizado.includes(".") &&
        valorNormalizado.includes(",")
    ) {

        const ultimoPonto =
            valorNormalizado.lastIndexOf(".");

        const ultimaVirgula =
            valorNormalizado.lastIndexOf(",");


        if (ultimaVirgula > ultimoPonto) {

            valorNormalizado =
                valorNormalizado
                    .replace(/\./g, "")
                    .replace(",", ".");

        } else {

            valorNormalizado =
                valorNormalizado.replace(/,/g, "");
        }

    } else if (
        valorNormalizado.includes(",")
    ) {

        valorNormalizado =
            valorNormalizado.replace(",", ".");
    }


    const numeroConvertido =
        Number(valorNormalizado);


    if (
        !Number.isFinite(numeroConvertido) ||
        numeroConvertido === 0
    ) {
        return null;
    }


    return numeroConvertido;
}


/* ==========================================================
   VERIFICA SE O VALOR É VÁLIDO
========================================================== */

function possuiValorImportacao(valor) {

    return (
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number.isFinite(Number(valor)) &&
        Number(valor) !== 0
    );
}


/* ==========================================================
   ESCAPA TEXTOS PARA EVITAR HTML INDESEJADO
========================================================== */

function escaparTextoImportacao(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================================
   FORMATAÇÃO DAS HORAS
========================================================== */

function formatarHorasImportacao(valor) {

    const horas =
        valorGraficoImportacao(valor);


    if (horas === null) {
        return "0";
    }


    return horas.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}

/* ==========================================================
   PLUGIN LOCAL — RÓTULOS CENTRALIZADOS NAS BARRAS MENSAIS
========================================================== */

const rotulosBarrasMensaisImportacao = {

    id: "rotulosBarrasMensaisImportacao",

    afterDatasetsDraw(chart) {

        const { ctx, chartArea } = chart;

        if (!chartArea) {
            return;
        }

        ctx.save();

        chart.data.datasets.forEach(
            (dataset, datasetIndex) => {

                /*
                --------------------------------------------------
                Exibe valores somente nas barras.
                A linha de horas não recebe rótulo aqui.
                --------------------------------------------------
                */

                if (dataset.type !== "bar") {
                    return;
                }

                const meta =
                    chart.getDatasetMeta(datasetIndex);

                if (
                    !meta ||
                    meta.hidden
                ) {
                    return;
                }

                meta.data.forEach(
                    (elemento, indice) => {

                        const valor =
                            dataset.data[indice];

                        if (
                            !possuiValorImportacao(valor) ||
                            !elemento ||
                            !Number.isFinite(elemento.x) ||
                            !Number.isFinite(elemento.y)
                        ) {
                            return;
                        }

                        const texto =
                            Number(valor)
                                .toLocaleString("pt-BR");

                        /*
                        --------------------------------------------------
                        elemento.x já é o centro exato da barra.
                        elemento.y é o topo da barra.
                        --------------------------------------------------
                        */

                  const graficoReduzido =
    chart.width < 900;

const labelDataset =
    dataset.label || "";

let deslocamentoX = 0;

if (graficoReduzido) {

    if (labelDataset === "Processos") {
        deslocamentoX = -8;
    }

    else if (labelDataset === "SKU") {
        deslocamentoX = -3;
    }

    else if (labelDataset === "Lotes") {
        deslocamentoX = 3;
    }

    else if (labelDataset === "Laudos") {
        deslocamentoX = 8;
    }
}

const posicaoX =
    elemento.x + deslocamentoX;

const posicaoY =
    Math.max(
        elemento.y - 5,
        chartArea.top + 14
    );

ctx.font =
    graficoReduzido
        ? "700 8px 'Segoe UI', Arial, sans-serif"
        : "700 9px 'Segoe UI', Arial, sans-serif";

ctx.fillText(
    texto,
    posicaoX,
    posicaoY
);
                    }
                );
            }
        );

        ctx.restore();
    }
};
/* ==========================================================
   PLUGIN LOCAL — VALORES DO GRÁFICO HORIZONTAL
========================================================== */

const rotulosGraficoSkuImportacao = {

    id: "rotulosGraficoSkuImportacao",

    afterDatasetsDraw(chart) {

        const { ctx, chartArea } = chart;

        const dataset =
            chart.data.datasets[0];

        const meta =
            chart.getDatasetMeta(0);


        if (
            !dataset ||
            !meta ||
            meta.hidden ||
            !chartArea
        ) {
            return;
        }


        ctx.save();

        ctx.font =
            "800 11px Arial";

        ctx.fillStyle =
            "#10245c";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "middle";


        meta.data.forEach(
            (elemento, indice) => {

                const valor =
                    dataset.data[indice];


                if (
                    !possuiValorImportacao(valor) ||
                    !elemento ||
                    !Number.isFinite(elemento.x) ||
                    !Number.isFinite(elemento.y)
                ) {
                    return;
                }


                const texto =
                    Number(valor)
                        .toLocaleString("pt-BR");


                const larguraTexto =
                    ctx.measureText(texto).width;


                let posicaoX =
                    elemento.x + 8;


                if (
                    posicaoX + larguraTexto >
                    chartArea.right
                ) {

                    posicaoX =
                        chartArea.right -
                        larguraTexto -
                        4;
                }


                ctx.fillText(
                    texto,
                    posicaoX,
                    elemento.y
                );
            }
        );


        ctx.restore();
    }
};


/* ==========================================================
   DESTRUIÇÃO DOS GRÁFICOS
========================================================== */

function destruirGraficosImportacao(){

    if(graficoMensalImportacao){
        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }

    if(graficoSkuImportacao){
        graficoSkuImportacao.destroy();
        graficoSkuImportacao = null;
    }

    const canvasMensal =
        document.getElementById("graficoImportacao");

    const canvasSku =
        document.getElementById("graficoSkuImportacao");

    if(canvasMensal){

        const instanciaMensal =
            Chart.getChart(canvasMensal);

        if(instanciaMensal){
            instanciaMensal.destroy();
        }
    }

    if(canvasSku){

        const instanciaSku =
            Chart.getChart(canvasSku);

        if(instanciaSku){
            instanciaSku.destroy();
        }
    }
}

/* ==========================================================
   RENDERIZAÇÃO DA PÁGINA
========================================================== */

function renderImportacao() {

    destruirGraficosImportacao();

    const imp = obterDadosImportacao();

    conteudo.innerHTML = `
        <div class="pagina-importacao">
            <div class="page-title">
                📦 INSPEÇÃO DE IMPORTAÇÃO
            </div>

            <section class="cards importacao-cards">
                ${card("📋", "Processos por Ano", numero(imp.processosAno), "Quantidade de processos")}
                ${card("🏷️", "Total de SKU", numero(imp.totalSku), "SKUs inspecionados")}
                ${card("📦", "Total de Lotes", numero(imp.totalLotes), "Lotes controlados")}
                ${card("📄", "Laudos Emitidos", numero(imp.laudosEmitidos), "Registros emitidos")}
                ${card("⏱️", "Total de Horas", formatarHorasImportacao(imp.totalHoras), "Horas da atividade")}
            </section>

            <nav class="importacao-abas" aria-label="Abas da Importação">
                <button
                    type="button"
                    id="botaoAbaResumoImportacao"
                    class="importacao-aba"
                    onclick="abrirAbaInternaImportacao('resumo')"
                >
                    <span class="importacao-aba-icone">📊</span>
                    Indicador de Importação
                </button>

                <button
                    type="button"
                    id="botaoAbaFluxoImportacao"
                    class="importacao-aba"
                    onclick="abrirAbaInternaImportacao('fluxo')"
                >
                    <span class="importacao-aba-icone">📋</span>
                    Fluxo de Inspeção Semanal
                </button>
            </nav>

            <div id="conteudoInternoImportacao"></div>
        </div>
    `;

    abrirAbaInternaImportacao(
        abaInternaImportacao
    );
}


function obterDadosImportacao() {

    return dados.importacao || {
        processosAno: 0,
        totalSku: 0,
        totalLotes: 0,
        laudosEmitidos: 0,
        totalHoras: 0,
        mensal: [],
        graficoSku: [],
        paretoSku: [],
        fluxo: []
    };
}


function abrirAbaInternaImportacao(aba) {

    abaInternaImportacao =
        aba === "fluxo"
            ? "fluxo"
            : "resumo";

    destruirGraficosImportacao();

    const botaoResumo =
        document.getElementById(
            "botaoAbaResumoImportacao"
        );

    const botaoFluxo =
        document.getElementById(
            "botaoAbaFluxoImportacao"
        );

    if (botaoResumo) {
        botaoResumo.classList.toggle(
            "ativa",
            abaInternaImportacao === "resumo"
        );
    }

    if (botaoFluxo) {
        botaoFluxo.classList.toggle(
            "ativa",
            abaInternaImportacao === "fluxo"
        );
    }

    if (abaInternaImportacao === "fluxo") {
        renderFluxoSemanalImportacao();
        return;
    }

    renderResumoImportacao();
}


/* ==========================================================
   RESUMO — IMPORTAÇÃO
========================================================== */

function renderResumoImportacao() {

    const imp =
        obterDadosImportacao();

    const area =
        document.getElementById(
            "conteudoInternoImportacao"
        );

    if (!area) {
        return;
    }


    area.innerHTML = `

        <!-- ================================================
             PAINEL DE IMPORTAÇÃO
             EVOLUÇÃO + RANKING LATERAL
        ================================================= -->

        <section
            id="importacaoPainelRanking"
            class="importacao-painel-ranking"
        >


            <!-- ============================================
                 ÁREA PRINCIPAL
                 EVOLUÇÃO MENSAL
            ============================================= -->

            <div
                id="painelEvolucaoImportacao"
                class="
                    panel
                    importacao-panel-mensal
                    importacao-ranking-principal
                "
            >


                <!-- ========================================
                     CABEÇALHO
                ========================================= -->

                <div class="importacao-ranking-cabecalho">


                    <h3 class="importacao-panel-titulo">

                        📊 Evolução Mensal da Inspeção de Importação

                    </h3>


                    <!-- ====================================
                         BOTÃO ABRIR RANKING
                    ===================================== -->

                    <button
                        type="button"
                        id="botaoAbrirRankingImportacao"
                        class="importacao-ranking-abrir"
                        onclick="abrirRankingImportacao()"
                        title="Abrir Ranking por SKU"
                        aria-label="Abrir Ranking por SKU"
                    >

                        <span class="importacao-ranking-abrir-texto">

                            📊 Ranking por SKU

                        </span>


                        <span class="importacao-ranking-seta">

                            ❯

                        </span>

                    </button>

                </div>


                <!-- ========================================
                     GRÁFICO MENSAL
                ========================================= -->

                <div
                    class="
                        chart-box
                        chart-box-importacao
                    "
                >

                    <canvas
                        id="graficoImportacao"
                    ></canvas>

                </div>

            </div>



            <!-- ============================================
                 RANKING POR SKU
                 PAINEL LATERAL
            ============================================= -->

            <aside
                id="painelRankingImportacao"
                class="
                    panel
                    importacao-panel-sku
                    importacao-ranking-lateral
                "
                aria-hidden="true"
            >


                <!-- ========================================
                     CABEÇALHO DO RANKING
                ========================================= -->

                <div class="importacao-ranking-lateral-cabecalho">


                    <strong>

                        📊 Ranking por SKU

                    </strong>


                    <button
                        type="button"
                        class="importacao-ranking-fechar"
                        onclick="fecharRankingImportacao()"
                        aria-label="Fechar Ranking por SKU"
                        title="Fechar ranking"
                    >

                        ×

                    </button>

                </div>


                <!-- ========================================
                     GRÁFICO DO RANKING
                ========================================= -->

                <div
    id="tabelaRankingSkuImportacao"
    class="importacao-ranking-tabela-wrap"
></div>

            </aside>

        </section>



        <!-- ================================================
             AVISO
        ================================================= -->

        <div class="importacao-aviso-zero">

            <span class="importacao-aviso-icone">

                ⓘ

            </span>

            Os valores zerados não são exibidos nos gráficos.
            Apenas valores maiores que zero são apresentados.

        </div>

    `;


    /*
       ------------------------------------------------------
       Inicialmente somente o gráfico mensal é criado.

       O Ranking por SKU será criado quando
       o usuário clicar para abrir.
       ------------------------------------------------------
    */

    criarGraficoMensalImportacao(
        imp
    );
}


/* ==========================================================
   ABRIR RANKING POR SKU
========================================================== */

function abrirRankingImportacao() {

    alternarRankingImportacao(true);
}


/* ==========================================================
   FECHAR RANKING POR SKU
========================================================== */

function fecharRankingImportacao() {

    alternarRankingImportacao(false);
}


/* ==========================================================
   ABRIR / FECHAR
   RANKING LATERAL DA IMPORTAÇÃO
========================================================== */

function alternarRankingImportacao(abrir) {

    const painel =
        document.getElementById(
            "importacaoPainelRanking"
        );

    const ranking =
        document.getElementById(
            "painelRankingImportacao"
        );

    const botaoAbrir =
        document.getElementById(
            "botaoAbrirRankingImportacao"
        );


    if (
        !painel ||
        !ranking
    ) {
        return;
    }


    /* ======================================================
       ABRIR
    ====================================================== */

    if (abrir) {

        painel.classList.add(
            "ranking-aberto"
        );

        ranking.setAttribute(
            "aria-hidden",
            "false"
        );

        if (botaoAbrir) {

            botaoAbrir.style.display =
                "none";
        }

        renderTabelaRankingSkuImportacao(
            obterDadosImportacao()
        );


    /* ======================================================
       FECHAR
    ====================================================== */

    } else {

        painel.classList.remove(
            "ranking-aberto"
        );

        ranking.setAttribute(
            "aria-hidden",
            "true"
        );

        if (botaoAbrir) {

            botaoAbrir.style.display =
                "";
        }
    }


    /* ======================================================
       REAJUSTAR GRÁFICO MENSAL
    ====================================================== */

    setTimeout(
        () => {

            if (graficoMensalImportacao) {

                graficoMensalImportacao.resize();
            }

        },
        250
    );
}
/* ==========================================================
   FLUXO SEMANAL — IMPORTAÇÃO
========================================================== */

function renderFluxoSemanalImportacao() {

    const imp =
        obterDadosImportacao();

    const area =
        document.getElementById(
            "conteudoInternoImportacao"
        );

    if (!area) {
        return;
    }


    area.innerHTML = `

        <section
            class="
                panel
                importacao-panel-fluxo
                importacao-fluxo-semanal
            "
        >

            <div class="importacao-fluxo-cabecalho">

                <h3 class="importacao-panel-titulo">

                    📋 Fluxo de Inspeção Semanal

                </h3>

            </div>


            <div class="importacao-tabela-wrap">

                ${montarTabelaFluxoImportacao(
                    imp.fluxo || []
                )}

            </div>

        </section>

    `;
}
/* ==========================================================
   GRÁFICO — EVOLUÇÃO MENSAL
========================================================== */

function criarGraficoMensalImportacao(imp) {

    /* ======================================================
       EXIBE SOMENTE ATÉ O MÊS ATUAL
    ====================================================== */

    const mensalCompleto =
        Array.isArray(imp.mensal)
            ? imp.mensal
            : [];


    const mesAtual =
        new Date().getMonth();


    const mensal =
        mensalCompleto.slice(
            0,
            mesAtual + 1
        );


    const canvas =
        document.getElementById(
            "graficoImportacao"
        );


    if (!canvas) {

        console.error(
            "Canvas graficoImportacao não encontrado."
        );

        return;
    }


    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js não foi carregado."
        );

        return;
    }


    /* ======================================================
       PREPARAÇÃO DOS DADOS
    ====================================================== */

    const meses =
        mensal.map(item =>
            item.mes || ""
        );


    const processos =
        mensal.map(item =>
            valorGraficoImportacao(
                item.processos
            )
        );


    const sku =
        mensal.map(item =>
            valorGraficoImportacao(
                item.sku
            )
        );


    const lotes =
        mensal.map(item =>
            valorGraficoImportacao(
                item.lotes
            )
        );


    const laudos =
        mensal.map(item =>
            valorGraficoImportacao(
                item.laudos
            )
        );


    const horas =
        mensal.map(item =>
            valorGraficoImportacao(
                item.horas
            )
        );


    /* ======================================================
       REMOVE INSTÂNCIAS ANTERIORES
    ====================================================== */

    if (graficoMensalImportacao) {

        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }


    const graficoExistente =
        Chart.getChart(canvas);


    if (graficoExistente) {
        graficoExistente.destroy();
    }


    /* ======================================================
       CRIAÇÃO DO GRÁFICO
    ====================================================== */

    graficoMensalImportacao =
        new Chart(
            canvas,
            {

                plugins: [
                    rotulosBarrasMensaisImportacao
                ],


                data: {

                    labels: meses,


                    datasets: [

                        /* ==================================
                           PROCESSOS
                        ================================== */

                        {
                            type: "bar",

                            label: "Processos",

                            data: processos,

                            backgroundColor:
                                "#1d4ed8",

                            borderColor:
                                "#1d4ed8",

                            borderWidth: 1,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.79,
barPercentage: 0.92,
maxBarThickness: 28,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           SKU
                        ================================== */

                        {
                            type: "bar",

                            label: "SKU",

                            data: sku,

                            backgroundColor:
                                "rgba(236, 72, 153, 0.62)",

                            borderColor:
                                "#ec4899",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           LOTES
                        ================================== */

                        {
                            type: "bar",

                            label: "Lotes",

                            data: lotes,

                            backgroundColor:
                                "rgba(34, 197, 94, 0.54)",

                            borderColor:
                                "#22c55e",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           LAUDOS
                        ================================== */

                        {
                            type: "bar",

                            label: "Laudos",

                            data: laudos,

                            backgroundColor:
                                "rgba(139, 92, 246, 0.52)",

                            borderColor:
                                "#7c3aed",

                            borderWidth: 1.5,

                            borderRadius: 4,

                            borderSkipped: false,

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /* ==================================
                           HORAS
                        ================================== */

                        {
                            type: "line",

                            label: "Horas",

                            data: horas,

                            borderColor:
                                "#f97316",

                            backgroundColor:
                                "#f97316",

                            pointBackgroundColor:
                                "#f97316",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            pointRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 4
                                    : 0;
                            },

                            pointHoverRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 6
                                    : 0;
                            },

                            pointHitRadius(context) {

                                return possuiValorImportacao(
                                    context.raw
                                )
                                    ? 10
                                    : 0;
                            },

                            borderWidth: 2.5,

                            tension: 0.35,

                            cubicInterpolationMode:
                                "monotone",

                            spanGaps: false,

                            yAxisID: "y1",

                            order: 1
                        }
                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    /* ======================================
                       ESPAÇAMENTO INTERNO
                    ====================================== */


  layout: {

    padding: {

        top: 0,

        right: 12,

        bottom: 0,

        left: 12
    }
},
                    /* ======================================
                       INTERAÇÃO
                    ====================================== */

                    interaction: {

                        mode: "index",

                        intersect: false
                    },


                    /* ======================================
                       PLUGINS
                    ====================================== */

                    plugins: {


                        /*
                        Desliga o plugin global de valores.
                        */

                        valorFlutuante: false,


                        /*
                        Evita duplicação com ChartDataLabels.
                        */

                        datalabels: {

                            display: false
                        },


                        /* ==================================
                           LEGENDA
                        ================================== */

                    legend: {

    display: true,

    position: "top",

    align: "center",

    fullSize: false,

    labels: {

        boxWidth: 18,

        boxHeight: 8,

        padding: 8,

        usePointStyle: true,

        pointStyle: "circle",

        color: "#374151",

        font: {

            size: 11,

            weight: "600"
        }
    }
},


                        /* ==================================
                           TOOLTIP
                        ================================== */

                        tooltip: {

                            enabled: true,

                            mode: "index",

                            intersect: false,

                            filter(context) {

                                return possuiValorImportacao(
                                    context.raw
                                );
                            },

                            callbacks: {

                                label(context) {

                                    const valor =
                                        context.raw;


                                    if (
                                        !possuiValorImportacao(
                                            valor
                                        )
                                    ) {
                                        return "";
                                    }


                                    const nome =
                                        context.dataset.label ||
                                        "";


                                    if (nome === "Horas") {

                                        return (
                                            `${nome}: ` +
                                            `${formatarHorasImportacao(valor)} h`
                                        );
                                    }


                                    return (
                                        `${nome}: ` +
                                        `${Number(valor)
                                            .toLocaleString("pt-BR")}`
                                    );
                                }
                            }
                        }
                    },


                    /* ======================================
                       ESCALAS
                    ====================================== */

                    scales: {


                        /* ==================================
                           EIXO HORIZONTAL
                        ================================== */

                        x: {

                            stacked: false,

                            offset: true,

                            grid: {

                                display: false,

                                drawBorder: false
                            },

                            border: {

                                color:
                                    "rgba(148, 163, 184, 0.38)"
                            },

                            ticks: {

                                autoSkip: false,

                                maxRotation: 0,

                                minRotation: 0,

                                color: "#4b5563",

                                padding: 8,

                                font: {

                                    size: 10,

                                    weight: "500"
                                }
                            }
                        },


                        /* ==================================
                           EIXO DE QUANTIDADES
                        ================================== */

                     y:{

    beginAtZero:true,

    suggestedMax:200,

    grace:"10%",

    position: "left",

    grace: 0,
                            title: {

                                display: true,

                                text: "Quantidade",

                                color: "#4b5563",

                                font: {

                                    size: 11,

                                    weight: "600"
                                }
                            },

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.22)",

                                drawBorder: false
                            },

                            border: {

                                display: false
                            },

                            ticks: {

                                precision: 0,

                                color: "#4b5563",

                                padding: 6,

                                font: {

                                    size: 10
                                },

                                callback(valor) {

                                    return Number(valor)
                                        .toLocaleString(
                                            "pt-BR"
                                        );
                                }
                            }
                        },

/* ==================================
   EIXO DE HORAS
================================== */

y1:{

    beginAtZero:true,

    min:0,

    max:250,

    position:"right",

    title:{

        display:true,

        text:"Horas",

        color:"#4b5563",

        font:{

            size:11,

            weight:"600"
        }
    },

    grid:{

        drawOnChartArea:false,

        drawBorder:false
    },

    border:{

        display:false
    },

    ticks:{

        stepSize:50,

        color:"#4b5563",

        padding:6,

        font:{

            size:10
        },

        callback(valor){

            return Number(valor)
                .toLocaleString(
                    "pt-BR",
                    {
                        maximumFractionDigits:1
                    }
                );
        }
    }
}

},

                    /* ======================================
                       ANIMAÇÃO
                    ====================================== */

                    animation: {

                        duration: 500
                    }
                }
            }
        );
}

function limparNomeProduto(descricao) {

    let texto =
        String(descricao || "")
            .trim();


    /* Remove PT no início */

    texto =
        texto.replace(
            /^PT[\s\-–—:]+/i,
            ""
        );


    /* Remove marcas conhecidas */

    texto =
        texto.replace(
            /\b(SOLIDOR|LAMEDI|PROCARE|LABOR)\b/gi,
            ""
        );


  /* Remove códigos C/25, C/50, C/100, C/500
   e também versões sem barra: C25, C50, C100, C500 */

texto =
    texto.replace(
        /\bC\s*\/?\s*(25|50|100|500)\b/gi,
        ""
    );


    /* Remove tamanho por letra */

    texto =
        texto.replace(
            /\b(?:TAM(?:ANHO)?\.?\s*)?(PP|P|M|G|GG|XG|XGG|XS|XL|XXL)\b/gi,
            ""
        );


    /* Remove medidas */

    texto =
        texto.replace(
            /\b\d+(?:[.,]\d+)?\s*(MM|CM|ML|L|G|KG)\b/gi,
            ""
        );


    /* Limpeza final */

    texto =
        texto
            .replace(/\s{2,}/g, " ")
            .replace(/\s+[-–—]\s*$/g, "")
            .trim();


    return texto;
}
/* ==========================================================
   RANKING POR SKU — TABELA COMPACTA
   MAIOR PARA MENOR
========================================================== */

function renderTabelaRankingSkuImportacao(imp) {

    const area =
        document.getElementById(
            "tabelaRankingSkuImportacao"
        );

    if (!area) {
        return;
    }


    /* ======================================================
       DADOS
    ====================================================== */

    const dadosOriginais =
        Array.isArray(imp.graficoSku)
            ? imp.graficoSku
            : Array.isArray(imp.paretoSku)
                ? imp.paretoSku
                : [];


    /* ======================================================
       NORMALIZAÇÃO / ORDENAÇÃO
    ====================================================== */

    const ranking =
        dadosOriginais

            .map(item => {

                const quantidade =
                    valorGraficoImportacao(
                        item.quantidade
                    );


                return {

                    sku:
                        escaparTextoImportacao(
                            item.sku ||
                            "-"
                        ),

                    descricao:
    escaparTextoImportacao(
        limparNomeProduto(
            item.descricao,
            item.marca
        ) ||
        "Sem descrição"
    ),

                    quantidade:
                        quantidade === null
                            ? 0
                            : quantidade
                };
            })


            /* remove zerados */

            .filter(
                item =>
                    item.quantidade > 0
            )


            /* maior para menor */

            .sort(
                (a, b) =>
                    b.quantidade -
                    a.quantidade
            )


            /* top 10 */

            .slice(
                0,
                10
            );


    /* ======================================================
       SEM DADOS
    ====================================================== */

    if (!ranking.length) {

        area.innerHTML = `

            <div class="importacao-ranking-vazio">

                Nenhum SKU disponível.

            </div>

        `;

        return;
    }


    /* ======================================================
       LINHAS
    ====================================================== */

    const linhas =
        ranking

            .map(
                item => `

                    <tr>

                        <td
                            class="ranking-col-sku"
                            title="SKU ${item.sku}"
                        >

                            ${item.sku}

                        </td>


                        <td
                            class="ranking-col-descricao"
                            title="${item.descricao}"
                        >

                            ${item.descricao}

                        </td>


                        <td
                            class="ranking-col-quantidade"
                        >

                            ${Number(
                                item.quantidade
                            ).toLocaleString(
                                "pt-BR",
                                {
                                    maximumFractionDigits:0
                                }
                            )}

                        </td>

                    </tr>

                `
            )

            .join("");


    /* ======================================================
       TABELA
    ====================================================== */

    area.innerHTML = `

        <table class="importacao-ranking-tabela">

            <thead>

                <tr>

                    <th class="ranking-col-sku">
                        SKU
                    </th>

                    <th class="ranking-col-descricao">
                        Descrição
                    </th>

                    <th class="ranking-col-quantidade">
                        Quantidade
                    </th>

                </tr>

            </thead>


            <tbody>

                ${linhas}

            </tbody>

        </table>

    `;
}

/* ==========================================================
   TABELA — STATUS DA IMPORTAÇÃO
========================================================== */

function badgeStatusImportacao(status) {

    const texto =
        String(status || "")
            .trim()
            .toUpperCase();


    switch (texto) {

        case "APROVADO":

            return `
                <span class="status-badge status-aprovado">
                    🟢 APROVADO
                </span>
            `;


        case "REPROVADO":

            return `
                <span class="status-badge status-reprovado">
                    🔴 REPROVADO
                </span>
            `;


        case "PENDENTE":

            return `
                <span class="status-badge status-pendente">
                    ⚪ PENDENTE
                </span>
            `;


        case "ATENÇÃO":

        case "ATENCAO":

            return `
                <span class="status-badge status-atencao">
                    🟡 ATENÇÃO
                </span>
            `;

case "AGUARDANDO CHEGADA":

    return `
        <span class="status-badge status-aguardando">
            🔵 AGUARDANDO
        </span>
    `;
        default:

            return `
                <span class="status-badge">
                    ${escaparTextoImportacao(status)}
                </span>
            `;
    }
}


/* ==========================================================
   TABELA — FLUXO DA INSPEÇÃO DE IMPORTAÇÃO
========================================================== */

function montarTabelaFluxoImportacao(lista) {

    const fluxo =
        Array.isArray(lista)
            ? lista
            : [];


    if (!fluxo.length) {

        return `

            <div class="tabela-vazia">
                Nenhum processo de importação encontrado.
            </div>

        `;
    }


    const linhas =
        fluxo.map(item => `

            <tr>

                <td>
                    ${escaparTextoImportacao(
                        item.po
                    )}
                </td>

                <td>
                    ${escaparTextoImportacao(
                        item.sku
                    )}
                </td>

                <td class="descricao">
                    ${escaparTextoImportacao(
                        item.descricao
                    )}
                </td>

                <td>
                    ${escaparTextoImportacao(
                        item.lote
                    )}
                </td>

                <td>
                    ${badgeStatusImportacao(
                        item.status
                    )}
                </td>

               <td>
    ${
        !item.observacao ||
        item.observacao === "0" ||
        item.observacao === 0

            ? "-"

            : escaparTextoImportacao(
                item.observacao
            )
    }
</td>
            </tr>

        `).join("");


    return `

        <div class="importacao-tabela-scroll">

            <table class="importacao-tabela">

                <thead>

                    <tr>

                        <th style="width:14%">
                            PO
                        </th>

                        <th style="width:12%">
                            SKU
                        </th>

                        <th style="width:30%">
                            DESCRIÇÃO
                        </th>

                        <th style="width:14%">
                            LOTE
                        </th>

                        <th style="width:12%">
                            STATUS
                        </th>

                        <th style="width:18%">
                            OBSERVAÇÃO
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${linhas}

                </tbody>

            </table>

        </div>

    `;
}


/* ==========================================================
   AJUSTE DOS GRÁFICOS AO REDIMENSIONAR A TELA
========================================================== */

function redimensionarGraficosImportacao() {

    if (graficoMensalImportacao) {
        graficoMensalImportacao.resize();
    }


    if (graficoSkuImportacao) {
        graficoSkuImportacao.resize();
    }
}


window.addEventListener(
    "resize",
    redimensionarGraficosImportacao
);


/* ==========================================================
   EXPORTA PARA O ESCOPO GLOBAL
========================================================== */

window.renderImportacao =
    renderImportacao;


window.abrirAbaInternaImportacao =
    abrirAbaInternaImportacao;


window.destruirGraficosImportacao =
    destruirGraficosImportacao;


window.abrirRankingImportacao =
    abrirRankingImportacao;


window.fecharRankingImportacao =
    fecharRankingImportacao;
