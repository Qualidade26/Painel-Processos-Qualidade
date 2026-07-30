/* ==========================================================
   PÁGINA — INSPEÇÃO DE IMPORTAÇÃO
========================================================== */


/* ==========================================================
   INSTÂNCIAS DOS GRÁFICOS
========================================================== */

let graficoMensalImportacao = null;
let graficoSkuImportacao = null;

/* ==========================================================
   CONVERSÃO CORRETA DOS VALORES DO GRÁFICO
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
    Trata os formatos:

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

            /*
            Formato brasileiro:
            1.250,50
            */

            valorNormalizado =
                valorNormalizado
                    .replace(/\./g, "")
                    .replace(",", ".");

        } else {

            /*
            Formato internacional:
            1,250.50
            */

            valorNormalizado =
                valorNormalizado
                    .replace(/,/g, "");
        }

    } else if (
        valorNormalizado.includes(",")
    ) {

        /*
        Formato decimal brasileiro:
        10,5
        */

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
   FORMATAÇÃO CORRETA DAS HORAS
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
   PLUGIN LOCAL — NÚMEROS APENAS NAS BARRAS MENSAIS
========================================================== */
/*
   O plugin global valorFlutuante será desligado no gráfico
   mensal da Importação.

   Este plugin desenha somente os números das barras.

   A linha de Horas continuará sem números, conforme solicitado.
========================================================== */

const rotulosBarrasMensaisImportacao = {

    id: "rotulosBarrasMensaisImportacao",

    afterDatasetsDraw(chart) {

        const { ctx } = chart;

        ctx.save();

        chart.data.datasets.forEach(
            (dataset, datasetIndex) => {

                if (dataset.type !== "bar") {
                    return;
                }

                const meta =
                    chart.getDatasetMeta(datasetIndex);

                if (meta.hidden) {
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

                        /*
                        --------------------------------------------------
                        Alterna levemente a altura dos números.

                        Isso reduz a sobreposição quando duas barras
                        possuem valores iguais ou muito próximos.
                        --------------------------------------------------
                        */

                        const deslocamento =
                            datasetIndex % 2 === 0
                                ? 7
                                : 18;

                        ctx.font =
                            "800 9px Arial";

                        ctx.fillStyle =
                            "#10245c";

                        ctx.textAlign =
                            "center";

                        ctx.textBaseline =
                            "bottom";

                        ctx.fillText(
                            Number(valor)
                                .toLocaleString("pt-BR"),
                            elemento.x,
                            elemento.y - deslocamento
                        );
                    });
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

        const { ctx } = chart;

        const dataset =
            chart.data.datasets[0];

        const meta =
            chart.getDatasetMeta(0);

        if (
            !dataset ||
            !meta ||
            meta.hidden
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

                ctx.fillText(
                    Number(valor)
                        .toLocaleString("pt-BR"),
                    elemento.x + 8,
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

function destruirGraficosImportacao() {

    if (graficoMensalImportacao) {

        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }

    if (graficoSkuImportacao) {

        graficoSkuImportacao.destroy();
        graficoSkuImportacao = null;
    }


    /*
    ----------------------------------------------------------
    Segurança adicional do Chart.js
    ----------------------------------------------------------
    */

    const canvasMensal =
        document.getElementById(
            "graficoImportacao"
        );

    if (
        canvasMensal &&
        typeof Chart !== "undefined"
    ) {

        const graficoExistente =
            Chart.getChart(canvasMensal);

        if (graficoExistente) {
            graficoExistente.destroy();
        }
    }


    const canvasSku =
        document.getElementById(
            "graficoSkuImportacao"
        );

    if (
        canvasSku &&
        typeof Chart !== "undefined"
    ) {

        const graficoExistente =
            Chart.getChart(canvasSku);

        if (graficoExistente) {
            graficoExistente.destroy();
        }
    }
}


/* ==========================================================
   RENDERIZAÇÃO DA PÁGINA
========================================================== */

function renderImportacao() {

    destruirGraficosImportacao();


    const imp =
        dados.importacao || {

            processosAno: 0,
            totalSku: 0,
            totalLotes: 0,
            laudosEmitidos: 0,
            totalHoras: 0,

            mensal: [],
            paretoSku: [],
            fluxo: []
        };


    conteudo.innerHTML = `

        <div class="page-title">
            📦 INSPEÇÃO DE IMPORTAÇÃO
        </div>


        <section class="cards importacao-cards">

            ${card(
                "📋",
                "Processos por Ano",
                numero(imp.processosAno),
                "Quantidade de processos"
            )}

            ${card(
                "🏷️",
                "Total de SKU",
                numero(imp.totalSku),
                "SKUs inspecionados"
            )}

            ${card(
                "📦",
                "Total de Lotes",
                numero(imp.totalLotes),
                "Lotes controlados"
            )}

            ${card(
                "📄",
                "Laudos Emitidos",
                numero(imp.laudosEmitidos),
                "Registros emitidos"
            )}

            ${card(
                "⏱️",
                "Total de Horas",
                formatarHorasImportacao(
                    imp.totalHoras
                ),
                "Horas da atividade"
            )}

        </section>


        <section class="panel importacao-panel-mensal">

            <h3 class="importacao-panel-titulo">
                📊 Evolução Mensal da Inspeção de Importação
            </h3>

            <div class="chart-box chart-box-importacao">

                <canvas
                    id="graficoImportacao"
                ></canvas>

            </div>

        </section>


        <section class="importacao-bottom-grid">


            <div class="panel importacao-panel-sku">

                <h3 class="importacao-panel-titulo">
                    📊 Quantidade por SKU (Maior para Menor)
                </h3>

                <div class="chart-box chart-box-sku-importacao">

                    <canvas
                        id="graficoSkuImportacao"
                    ></canvas>

                </div>

            </div>


            <div class="panel importacao-panel-fluxo">

                <div class="importacao-fluxo-cabecalho">

                    <h3 class="importacao-panel-titulo">
                        📋 Fluxo da Inspeção de Importação
                    </h3>

                </div>


                <div class="importacao-tabela-wrap">

                    ${montarTabelaFluxoImportacao(
                        imp.fluxo || []
                    )}

                </div>


                <div class="importacao-table-footer">

                    <button
                        type="button"
                        class="btn-ver-todos importacao-btn-ver-todos"
                        onclick="verTodosImportacao()"
                    >
                        ☷ VER TODOS
                    </button>

                </div>

            </div>

        </section>


        <div class="importacao-aviso-zero">

            <span class="importacao-aviso-icone">
                ⓘ
            </span>

            Os valores zerados não são exibidos nos gráficos.
            Apenas valores maiores que zero são apresentados.

        </div>
    `;


    /*
    ----------------------------------------------------------
    Cria os gráficos somente depois que os canvases existem
    ----------------------------------------------------------
    */

    criarGraficoMensalImportacao(imp);
    criarGraficoSkuImportacao(imp);
}
/* ==========================================================
   GRÁFICO — EVOLUÇÃO MENSAL
========================================================== */

function criarGraficoMensalImportacao(imp) {

    const mensal =
        Array.isArray(imp.mensal)
            ? imp.mensal
            : [];


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


    /*
    ----------------------------------------------------------
    Preparação dos meses
    ----------------------------------------------------------
    */

    const meses =
        mensal.map(item =>
            item.mes || ""
        );


    /*
    ----------------------------------------------------------
    Preparação dos valores
    ----------------------------------------------------------
    */

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


    /*
    ----------------------------------------------------------
    Remove instâncias anteriores
    ----------------------------------------------------------
    */

    if (graficoMensalImportacao) {

        graficoMensalImportacao.destroy();
        graficoMensalImportacao = null;
    }


    const graficoExistente =
        Chart.getChart(canvas);


    if (graficoExistente) {

        graficoExistente.destroy();
    }


    /*
    ----------------------------------------------------------
    Criação do gráfico
    ----------------------------------------------------------
    */

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

                        /*
                        ------------------------------------------
                        PROCESSOS
                        ------------------------------------------
                        */

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

                            categoryPercentage: 0.72,

                            barPercentage: 0.84,

                            maxBarThickness: 25,

                            yAxisID: "y",

                            order: 2,

                            skipNull: true
                        },


                        /*
                        ------------------------------------------
                        SKU
                        ------------------------------------------
                        */

                        {
                            type: "bar",

                            label: "SKU",

                            data: sku,

                            backgroundColor:
                                "rgba(236, 72, 199, 0.62)",

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


                        /*
                        ------------------------------------------
                        LOTES
                        ------------------------------------------
                        */

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


                        /*
                        ------------------------------------------
                        LAUDOS
                        ------------------------------------------
                        */

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


                        /*
                        ------------------------------------------
                        HORAS
                        ------------------------------------------
                        A linha permanece sem números.
                        ------------------------------------------
                        */

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


                    /*
                    ------------------------------------------
                    Espaço adicional para os números das barras
                    ------------------------------------------
                    */

                    layout: {

                        padding: {

                            top: 22,

                            right: 8,

                            bottom: 0,

                            left: 0
                        }
                    },


                    /*
                    ------------------------------------------
                    Interação
                    ------------------------------------------
                    */

                    interaction: {

                        mode: "index",

                        intersect: false
                    },


                    /*
                    ------------------------------------------
                    Plugins
                    ------------------------------------------
                    */

                    plugins: {


                        /*
                        ------------------------------------------
                        Desliga o plugin global.

                        Os números das barras serão controlados
                        somente pelo plugin local.
                        ------------------------------------------
                        */

                        valorFlutuante: false,


                        /*
                        ------------------------------------------
                        Evita duplicação com ChartDataLabels
                        ------------------------------------------
                        */

                        datalabels: {

                            display: false
                        },


                        /*
                        ------------------------------------------
                        Legenda
                        ------------------------------------------
                        */

                        legend: {

                            position: "top",

                            align: "center",

                            labels: {

                                usePointStyle: false,

                                boxWidth: 30,

                                boxHeight: 10,

                                padding: 18,

                                color: "#374151",

                                font: {

                                    size: 11,

                                    weight: "600"
                                }
                            }
                        },


                        /*
                        ------------------------------------------
                        Tooltip
                        ------------------------------------------
                        */

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


                                    if (
                                        nome === "Horas"
                                    ) {

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


                    /*
                    ------------------------------------------
                    Escalas
                    ------------------------------------------
                    */

                    scales: {


                        /*
                        ------------------------------------------
                        Eixo horizontal
                        ------------------------------------------
                        */

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


                        /*
                        ------------------------------------------
                        Eixo de quantidades
                        ------------------------------------------
                        */

                        y: {

                            beginAtZero: true,

                            position: "left",

                            grace: "30%",

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


                        /*
                        ------------------------------------------
                        Eixo de horas
                        ------------------------------------------
                        */

                        y1: {

                            beginAtZero: true,

                            position: "right",

                            grace: "8%",

                            title: {

                                display: true,

                                text: "Horas",

                                color: "#4b5563",

                                font: {

                                    size: 11,

                                    weight: "600"
                                }
                            },

                            grid: {

                                drawOnChartArea: false,

                                drawBorder: false
                            },

                            border: {

                                display: false
                            },

                            ticks: {

                                color: "#4b5563",

                                padding: 6,

                                font: {

                                    size: 10
                                },

                                callback(valor) {

                                    return Number(valor)
                                        .toLocaleString(
                                            "pt-BR",
                                            {
                                                maximumFractionDigits: 1
                                            }
                                        );
                                }
                            }
                        }
                    },


                    /*
                    ------------------------------------------
                    Animação
                    ------------------------------------------
                    */

                    animation: {

                        duration: 500
                    }
                }
            }
        );
}
/* ==========================================================
   GRÁFICO — QUANTIDADE POR SKU
========================================================== */

function criarGraficoSkuImportacao(imp) {

    const dadosSkuOriginais =
        Array.isArray(imp.paretoSku)
            ? imp.paretoSku
            : [];


    /*
    ----------------------------------------------------------
    Normaliza, remove valores inválidos e ordena
    do maior para o menor
    ----------------------------------------------------------
    */

    const dadosSku =
        dadosSkuOriginais

            .map(item => {

                const quantidade =
                    valorGraficoImportacao(
                        item.quantidade
                    );

                return {

                    sku:
                        escaparTextoImportacao(
                            item.sku ||
                            "Sem identificação"
                        ),

                    quantidade:
                        quantidade === null
                            ? 0
                            : quantidade
                };
            })

            .filter(item =>
                item.quantidade > 0
            )

            .sort(
                (a, b) =>
                    b.quantidade -
                    a.quantidade
            )

            .slice(0, 10);


    const canvas =
        document.getElementById(
            "graficoSkuImportacao"
        );


    if (!canvas) {

        console.error(
            "Canvas graficoSkuImportacao não encontrado."
        );

        return;
    }


    /*
    ----------------------------------------------------------
    Remove instâncias anteriores
    ----------------------------------------------------------
    */

    if (graficoSkuImportacao) {

        graficoSkuImportacao.destroy();
        graficoSkuImportacao = null;
    }


    const graficoExistente =
        Chart.getChart(canvas);


    if (graficoExistente) {

        graficoExistente.destroy();
    }


    /*
    ----------------------------------------------------------
    Dados finais
    ----------------------------------------------------------
    */

    const labels =
        dadosSku.map(item =>
            item.sku
        );


    const quantidades =
        dadosSku.map(item =>
            item.quantidade
        );


    /*
    ----------------------------------------------------------
    Criação do gráfico horizontal
    ----------------------------------------------------------
    */

    graficoSkuImportacao =
        new Chart(
            canvas,
            {
                type: "bar",


                plugins: [
                    rotulosGraficoSkuImportacao
                ],


                data: {

                    labels: labels,


                    datasets: [

                        {
                            label: "Quantidade",

                            data: quantidades,

                            backgroundColor:
                                "rgba(29, 78, 216, 0.82)",

                            borderColor:
                                "#1d4ed8",

                            borderWidth: 1,

                            borderRadius: 5,

                            borderSkipped: false,

                            barThickness: 18,

                            maxBarThickness: 22,

                            minBarLength: 3,

                            _ocultarZero: true
                        }
                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    indexAxis: "y",


                    /*
                    --------------------------------------------------
                    Reserva espaço à direita para os valores
                    --------------------------------------------------
                    */

                    layout: {

                        padding: {

                            top: 4,

                            right: 42,

                            bottom: 0,

                            left: 0
                        }
                    },


                    /*
                    --------------------------------------------------
                    Interação
                    --------------------------------------------------
                    */

                    interaction: {

                        mode: "nearest",

                        axis: "y",

                        intersect: false
                    },


                    /*
                    --------------------------------------------------
                    Plugins
                    --------------------------------------------------
                    */

                    plugins: {


                        /*
                        ------------------------------------------------
                        Desliga o plugin global para impedir
                        valores duplicados
                        ------------------------------------------------
                        */

                        valorFlutuante: false,


                        datalabels: {

                            display: false
                        },


                        legend: {

                            display: false
                        },


                        tooltip: {

                            enabled: true,

                            displayColors: false,

                            callbacks: {

                                title(contextos) {

                                    if (
                                        !contextos ||
                                        !contextos.length
                                    ) {
                                        return "";
                                    }

                                    return contextos[0].label;
                                },


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


                                    return (
                                        "Quantidade: " +
                                        Number(valor)
                                            .toLocaleString(
                                                "pt-BR"
                                            )
                                    );
                                }
                            }
                        }
                    },


                    /*
                    --------------------------------------------------
                    Escalas
                    --------------------------------------------------
                    */

                    scales: {


                        /*
                        ------------------------------------------------
                        Eixo dos valores
                        ------------------------------------------------
                        */

                        x: {

                            beginAtZero: true,

                            grace: "12%",

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


                        /*
                        ------------------------------------------------
                        Eixo dos SKUs
                        ------------------------------------------------
                        */

                        y: {

                            offset: true,

                            grid: {

                                display: false,

                                drawBorder: false
                            },

                            border: {

                                display: false
                            },

                            ticks: {

                                color: "#334155",

                                padding: 8,

                                font: {

                                    size: 10,

                                    weight: "600"
                                },


                                /*
                                ------------------------------------------
                                Limita textos muito grandes
                                ------------------------------------------
                                */

                                callback(valor) {

                                    const texto =
                                        this.getLabelForValue(
                                            valor
                                        );


                                    if (
                                        texto.length > 22
                                    ) {

                                        return (
                                            texto.slice(
                                                0,
                                                22
                                            ) +
                                            "..."
                                        );
                                    }


                                    return texto;
                                }
                            }
                        }
                    },


                    /*
                    --------------------------------------------------
                    Animação
                    --------------------------------------------------
                    */

                    animation: {

                        duration: 500
                    }
                }
            }
        );
}
/* ==========================================================
   TABELA — FLUXO DA INSPEÇÃO DE IMPORTAÇÃO
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

        default:

            return `
                <span class="status-badge">
                    ${escaparTextoImportacao(status)}
                </span>
            `;
    }

}


/* ==========================================================
   LINHAS DA TABELA
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
                    ${escaparTextoImportacao(item.po)}
                </td>

                <td>
                    ${escaparTextoImportacao(item.sku)}
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

                    ${escaparTextoImportacao(
                        item.observacao
                    )}

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
   BOTÃO VER TODOS
========================================================== */

function verTodosImportacao() {

    console.log(
        "Visualizar todos os processos de importação."
    );

    /*
    ----------------------------------------------------------

    Futuras implementações

    • Modal
    • Nova página
    • Exportação Excel
    • Exportação PDF
    • Pesquisa
    • Filtros
    • Ordenação

    ----------------------------------------------------------
    */

}


/* ==========================================================
   EXPORTA PARA O ESCOPO GLOBAL
========================================================== */

window.renderImportacao =
    renderImportacao;

window.verTodosImportacao =
    verTodosImportacao;
