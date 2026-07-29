

/* ==========================================================
   AMOSTRA — ARQUIVO COMPLETO
   Substitua todo o conteúdo atual de amostras.js por este.
   ========================================================== */

let graficoAmostrasMensal = null;
let graficoAmostrasHorizontal = null;
let miniGraficosAmostra = [];


/* ==========================================================
   UTILITÁRIOS
   ========================================================== */

function amostraNumero(valor) {
    if (valor === null || valor === undefined || valor === "") return 0;
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;

    let texto = String(valor).trim().replace(/\s/g, "");

    if (texto.includes(".") && texto.includes(",")) {
        texto = texto.replace(/\./g, "").replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    const resultado = Number(texto);
    return Number.isFinite(resultado) ? resultado : 0;
}


function amostraInteiro(valor) {
    return Math.round(amostraNumero(valor));
}


function amostraFormatarNumero(valor, casas = 0) {
    return amostraNumero(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}


function amostraTextoMes(item, indice) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        item?.mes ??
        item?.mês ??
        item?.month ??
        meses[indice] ??
        `Mês ${indice + 1}`
    );
}


function amostraQuantidadeMensal(item) {
    return amostraNumero(
        item?.valor ??
        item?.quantidade ??
        item?.qtd ??
        item?.amostras ??
        item?.total ??
        0
    );
}


function amostraHorasMensais(item) {
    return amostraNumero(
        item?.horas ??
        item?.hora ??
        item?.tempo ??
        item?.totalHoras ??
        item?.total_horas ??
        0
    );
}


function amostraSku(item) {
    return String(
        item?.sku ??
        item?.SKU ??
        item?.codigo ??
        item?.código ??
        item?.produto ??
        item?.nome ??
        "-"
    );
}


function amostraDescricao(item) {
    return String(
        item?.descricao ??
        item?.descrição ??
        item?.description ??
        ""
    );
}


function amostraQuantidadeSku(item) {
    return amostraNumero(
        item?.quantidade ??
        item?.qtd ??
        item?.valor ??
        item?.total ??
        item?.amostras ??
        0
    );
}


function amostraDestruirGraficos() {
    [graficoAmostrasMensal, graficoAmostrasHorizontal]
        .filter(Boolean)
        .forEach(grafico => grafico.destroy());

    miniGraficosAmostra.forEach(grafico => {
        if (grafico) grafico.destroy();
    });

    graficoAmostrasMensal = null;
    graficoAmostrasHorizontal = null;
    miniGraficosAmostra = [];
}




/* ==========================================================
   CARD SUPERIOR
   ========================================================== */

function amostraCardTopo(icone, titulo, valor, legenda) {
    if (typeof card === "function") {
        return card(icone, titulo, valor, legenda);
    }

    return `
        <div class="kpi-card">
            <div class="kpi-icon">${icone}</div>
            <div class="kpi-content">
                <div class="kpi-title">${titulo}</div>
                <div class="kpi-value">${valor}</div>
                <div class="kpi-subtitle">${legenda}</div>
            </div>
        </div>
    `;
}


/* ==========================================================
   MINI GRÁFICOS
   Sem números, eixos, tooltip ou legenda.
   ========================================================== */

function amostraCriarMiniGrafico(idCanvas, tipo, valores, destacarMaior = false) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    const dadosMini = valores.map(amostraNumero);
    const maior = dadosMini.length ? Math.max(...dadosMini) : 0;

    const cores = dadosMini.map(valor => {
        if (destacarMaior && valor === maior && valor > 0) {
            return "#22c55e";
        }

        return "#3b82f6";
    });

    const grafico = new Chart(canvas, {
        type: tipo,

        data: {
            labels: dadosMini.map((_, indice) => indice + 1),

            datasets: [{
                data: dadosMini,
                backgroundColor: tipo === "bar" ? cores : "transparent",
                borderColor: "#2563eb",
                borderWidth: tipo === "line" ? 2 : 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.28,
                fill: false,
                borderRadius: 2,
                maxBarThickness: 10,
                datalabels: {
                    display: false
                }
            }]
        },

         options: {
            responsive: true,
            maintainAspectRatio: false,
devicePixelRatio: 2,
           animation: {
    duration: 700,
    easing: "easeOutQuart"
},
         

            events: [],

            layout: {
                padding: 0
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    enabled: false
                },

                datalabels: {
                    display: false
                }
            },

            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                },

                y: {
                    display: false,
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                }
            }
        },

        plugins: []
    });

    miniGraficosAmostra.push(grafico);
}


/* ==========================================================
   FUNÇÃO PRINCIPAL
   ========================================================== */

function renderAmostra() {
    amostraDestruirGraficos();

    const raizDados =
        typeof dados !== "undefined"
            ? dados
            : {};

    const origem =
        raizDados.amostras ||
        raizDados.amostra ||
        {};

    const mensalOriginal =
        Array.isArray(origem.mensal)
            ? origem.mensal
            : Array.isArray(origem.meses)
                ? origem.meses
                : [];

    const rankingOriginal =
        Array.isArray(origem.top10)
            ? origem.top10
            : Array.isArray(origem.ranking)
                ? origem.ranking
                : Array.isArray(origem.skus)
                    ? origem.skus
                    : [];

    const mensalCompleto = mensalOriginal.map((item, indice) => ({
        mes: amostraTextoMes(item, indice),
        amostras: amostraQuantidadeMensal(item),
        horas: amostraHorasMensais(item)
    }));

    let ultimoMesComDados = -1;

    mensalCompleto.forEach((item, indice) => {
        if (item.amostras > 0 || item.horas > 0) {
            ultimoMesComDados = indice;
        }
    });

    const mensalVisivel =
        ultimoMesComDados >= 0
            ? mensalCompleto.slice(0, ultimoMesComDados + 1)
            : mensalCompleto.slice(0, 1);

    const labelsMeses =
        mensalVisivel.map(item => item.mes);

    const valoresAmostras =
        mensalVisivel.map(item => item.amostras);

    const valoresHoras =
        mensalVisivel.map(item => item.horas);

    const totalAmostras = mensalCompleto.reduce(
        (soma, item) => soma + item.amostras,
        0
    );

    const totalHorasCalculado = mensalCompleto.reduce(
        (soma, item) => soma + item.horas,
        0
    );

    const totalHorasInformado = amostraNumero(
        origem.totalHoras ??
        origem.total_horas ??
        origem.horas
    );

    const totalHoras =
        totalHorasInformado > 0
            ? totalHorasInformado
            : totalHorasCalculado;

    const mesesComDados =
        mensalCompleto.filter(item => item.amostras > 0);

    const mediaMensal =
        mesesComDados.length
            ? totalAmostras / mesesComDados.length
            : 0;

    const melhorMes = mensalCompleto.reduce(
        (melhor, item) =>
            item.amostras > melhor.amostras
                ? item
                : melhor,
        {
            mes: "-",
            amostras: 0,
            horas: 0
        }
    );

    const rankingSku = rankingOriginal
        .map(item => ({
            sku: amostraSku(item),
            descricao: amostraDescricao(item),
            quantidade: amostraQuantidadeSku(item)
        }))
        .filter(item => item.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

    const skuMaisSolicitado =
        rankingSku[0] || {
            sku: "-",
            quantidade: 0
        };

    const tempoMedioHoras =
        totalAmostras > 0
            ? totalHoras / totalAmostras
            : 0;

    const tempoMedioMinutos =
        tempoMedioHoras * 60;

    const elementoConteudo =
        typeof conteudo !== "undefined"
            ? conteudo
            : document.getElementById("conteudo");

    if (!elementoConteudo) {
        console.error(
            "Amostra: elemento #conteudo não encontrado."
        );

        return;
    }

    elementoConteudo.innerHTML = `
        <div class="page-title">
            📦 AMOSTRA
        </div>

        <section class="cards amostra-cards-topo">

            ${amostraCardTopo(
                "📦",
                "Amostras solicitadas no ano",
                amostraFormatarNumero(totalAmostras),
                "Total acumulado"
            )}

            ${amostraCardTopo(
                "⏱️",
                "Total de horas",
                amostraFormatarNumero(totalHoras, 2),
                "Horas destinadas"
            )}

        </section>


        <section class="amostra-graficos-principais">

            <div class="panel amostra-panel-principal">

                <h3>
                    📈 EVOLUÇÃO MENSAL DE AMOSTRAS
                </h3>

                <div class="amostra-chart-principal">
                    <canvas
                        id="graficoAmostrasMensal"
                    ></canvas>
                </div>

            </div>


            <div class="panel amostra-panel-principal">

                <h3>
                    📊 AMOSTRAS MAIS SOLICITADAS
                </h3>

                <div class="amostra-chart-horizontal">
                    <canvas
                        id="graficoAmostrasHorizontal"
                    ></canvas>
                </div>

            </div>

        </section>


        <section class="amostra-indicadores">

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-cabecalho">

                    <span class="amostra-indicador-icone">
                        ▦
                    </span>

                    <div class="amostra-indicador-texto">

                        <span class="amostra-indicador-titulo">
                            Média de Amostras/Mês
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${amostraFormatarNumero(mediaMensal, 1)}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            Amostras por mês
                        </span>

                    </div>

                </div>


                <div class="amostra-mini-chart">
                    <canvas
                        id="miniMediaAmostras"
                    ></canvas>
                </div>

            </div>


            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-cabecalho">

                    <span class="amostra-indicador-icone">
                        🏆
                    </span>

                    <div class="amostra-indicador-texto">

                        <span class="amostra-indicador-titulo">
                            Melhor mês
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${amostraFormatarNumero(melhorMes.amostras)}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${melhorMes.mes}
                        </span>

                    </div>

                </div>


                <div class="amostra-mini-chart">
                    <canvas
                        id="miniMelhorMes"
                    ></canvas>
                </div>

            </div>


            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-cabecalho">

                    <span class="amostra-indicador-icone">
                        ☆
                    </span>

                    <div class="amostra-indicador-texto">

                        <span class="amostra-indicador-titulo">
                            SKU mais solicitado
                        </span>

                        <strong class="amostra-indicador-valor amostra-sku">
                            ${skuMaisSolicitado.sku}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${amostraFormatarNumero(
                                skuMaisSolicitado.quantidade
                            )} amostras
                        </span>

                    </div>

                </div>


                <div class="amostra-mini-chart">
                    <canvas
                        id="miniSkuAmostra"
                    ></canvas>
                </div>

            </div>


            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-cabecalho">

                    <span class="amostra-indicador-icone">
                        ◷
                    </span>

                    <div class="amostra-indicador-texto">

                        <span class="amostra-indicador-titulo">
                            Tempo médio por amostra
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${amostraFormatarNumero(
                                tempoMedioHoras,
                                2
                            )} h
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${amostraFormatarNumero(
                                tempoMedioMinutos,
                                1
                            )} min por amostra
                        </span>

                    </div>

                </div>


                <div class="amostra-mini-chart">
                    <canvas
                        id="miniTempoAmostra"
                    ></canvas>
                </div>

            </div>

        </section>
    `;

    amostraCriarGraficoMensal(
        labelsMeses,
        valoresAmostras,
        valoresHoras
    );

    amostraCriarGraficoHorizontal(
        rankingSku
    );

    amostraCriarMiniGrafico(
        "miniMediaAmostras",
        "bar",
        valoresAmostras
    );

    amostraCriarMiniGrafico(
        "miniMelhorMes",
        "bar",
        valoresAmostras,
        true
    );

    amostraCriarMiniGrafico(
        "miniSkuAmostra",
        "bar",
        rankingSku.map(
            item => item.quantidade
        )
    );

    amostraCriarMiniGrafico(
        "miniTempoAmostra",
        "line",
        valoresHoras
    );
}
/* ==========================================================
   GRÁFICO MENSAL
   ========================================================== */

function amostraCriarGraficoMensal(labels, amostras, horas) {
    const canvas =
        document.getElementById(
            "graficoAmostrasMensal"
        );

    if (!canvas) return;


    const maiorAmostra =
        Math.max(
            1,
            ...amostras
        );

    const maiorHora =
        Math.max(
            1,
            ...horas
        );


   const pluginRotulos = {
    id: "rotulosGraficoMensalAmostra",

    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const metaBarras = chart.getDatasetMeta(0);

        ctx.save();

        amostras.forEach((valor, indice) => {
            if (valor <= 0) return;

            const barra = metaBarras.data[indice];
            if (!barra) return;

          ctx.font = "700 13px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillStyle = "#102052";

            ctx.fillText(
                amostraFormatarNumero(valor),
                barra.x,
                barra.y - 8
            );
        });

        ctx.restore();
    }
};


    graficoAmostrasMensal =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        type: "bar",

                        label: "Amostras",

                        data: amostras,

                        backgroundColor:
                            "#1d4ed8",

                        borderColor:
                            "#1d4ed8",

                        borderWidth: 1,

                        borderRadius: 4,
maxBarThickness: 36,

categoryPercentage: 0.80,

barPercentage: 0.82,

                        yAxisID: "y",

                        order: 2,

                        datalabels: {
                            display: false
                        }
                    },


                    {
                        type: "line",

                        label: "Horas",

                        data: horas,

                        borderColor:
                            "#c026d3",

                        backgroundColor:
                            "#c026d3",

                        borderWidth: 3,

                        borderDash: [
                            6,
                            4
                        ],

                       tension: 0.35,

                        fill: false,

                        pointRadius: 6,

                        pointHoverRadius: 8,

                        pointBackgroundColor:
                            "#ffffff",

                        pointBorderColor:
                            "#c026d3",

                        pointBorderWidth: 3,

                        yAxisID: "y1",

                        order: 1,

                        datalabels: {
                            display: false
                        }
                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,
devicePixelRatio: 2,

                interaction: {

                    mode: "index",

                    intersect: false

                },


             layout: {
    padding: {
        top: 18,
        right: 12,
        bottom: 6,
        left: 6
    }
},


                plugins: {

                    legend: {

                          display: false,

                        position: "top",

                        labels: {

                            usePointStyle: true,

                            boxWidth: 10,

                            padding: 12,

                            color: "#172653",

                            font: {

                                size: 10,

                                weight: "bold"

                            }

                        }

                    },


                    tooltip: {

                        callbacks: {

                            label(context) {

                                const valor =
                                    amostraNumero(
                                        context.raw
                                    );


                                if (
                                    context.dataset.yAxisID ===
                                    "y1"
                                ) {

                                    return (
                                        ` Horas: ${
                                            amostraFormatarNumero(
                                                valor,
                                                2
                                            )
                                        } h`
                                    );

                                }


                                return (
                                    ` Amostras: ${
                                        amostraFormatarNumero(
                                            valor
                                        )
                                    }`
                                );
                            }

                        }

                    },


                    datalabels: {

                        display: false

                    }

                },


                scales: {

                    x: {

                        offset: true,

                        grid: {

                            display: false

                        },

                       ticks: {

    autoSkip: false,

    maxRotation: 0,

    minRotation: 0,

    color: "#44516f",

 font:{
    family:"Segoe UI",
    size:12,
    weight:"700"
}

}
                    },


                    y: {

                        beginAtZero: true,

                        suggestedMax:
                            Math.ceil(
                                maiorAmostra * 1.35
                            ),

                        position: "left",

                       grid: {

    color: "rgba(15,31,77,.05)",
    lineWidth: 1,
    drawBorder: false

},

                        title: {

                            display: true,

                            text:
                                "Quantidade de amostras",

                            color:
                                "#172653",

                            font: {

                                weight: "bold"

                            }

                        },
                    ticks: {
                        precision: 0,

                        color: "#243b6b",

                        font: {
                            family: "Segoe UI",
                            size: 11,
                            weight: "700"
                        },

                        callback(valor) {
                            return (
                                Number(valor) === 0
                                    ? ""
                                    : amostraFormatarNumero(valor)
                            );
                        }
                    }

                },

                y1: {


                    y1: {

                        beginAtZero: true,

                        suggestedMax:
                            maiorHora * 1.4,

                        position: "right",

                        grid: {

                            drawOnChartArea:
                                false

                        },

                        title: {

                            display: true,

                            text: "Horas",

                            color:
                                "#c026d3",

                            font: {

                                weight: "bold"

                            }

                        },

                        ticks: {

                            color:
                                "#c026d3",

                            callback(valor) {

                                return (
                                    Number(valor) === 0
                                        ? ""
                                        : amostraFormatarNumero(
                                            valor,
                                            1
                                        )
                                );

                            }

                        }

                    }

                }

            },


        plugins: [
    pluginRotulos
]
        });
}
/* ==========================================================
   GRÁFICO HORIZONTAL
   Apenas barras — sem linha de Pareto.
   ========================================================== */

function amostraCriarGraficoHorizontal(ranking) {
    const canvas =
        document.getElementById(
            "graficoAmostrasHorizontal"
        );

    if (!canvas) return;


    const dadosRanking =
        ranking.length
            ? ranking
            : [
                {
                    sku: "Sem dados",
                    descricao: "",
                    quantidade: 0
                }
            ];


    const maiorQuantidade =
        Math.max(
            1,
            ...dadosRanking.map(
                item => item.quantidade
            )
        );


    const pluginRotulos = {
        id: "rotulosGraficoHorizontalAmostra",

        afterDatasetsDraw(chart) {
            const ctx =
                chart.ctx;

          const meta = chart.getDatasetMeta(0);

ctx.save();

meta.data.forEach((barra, indice) => {
    const valor =
        dadosRanking[indice]?.quantidade || 0;

    if (valor <= 0) return;

    const texto =
        amostraFormatarNumero(valor);

 ctx.font = "700 13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#172653";

    const limiteDireito =
        chart.chartArea.right - 4;

    const larguraTexto =
        ctx.measureText(texto).width;

    let posicaoX =
        barra.x + 6;

    if (
        posicaoX + larguraTexto >
        limiteDireito
    ) {
        posicaoX =
            barra.x - larguraTexto - 6;

        ctx.fillStyle = "#ffffff";
    }

    ctx.fillText(
        texto,
        posicaoX,
        barra.y
    );
});

ctx.restore();
        }
    };

    graficoAmostrasHorizontal =
        new Chart(canvas, {

            type: "bar",


            data: {

                labels:
                    dadosRanking.map(
                        item => item.sku
                    ),


                datasets: [

                    {
                        label: "Quantidade",

                        data:
                            dadosRanking.map(
                                item => item.quantidade
                            ),

                        backgroundColor:
                            "#1d4ed8",

                        borderColor:
                            "#1d4ed8",

                        borderWidth: 1,

                        borderRadius: 3,

                  maxBarThickness: 46,

categoryPercentage: 0.92,

barPercentage: 0.95,
                        datalabels: {
                            display: false
                        }
                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

               devicePixelRatio: 2,

                indexAxis: "y",


                interaction: {

                    mode: "nearest",

                    intersect: false

                },


                layout: {

                    padding: {

                        top: 4,

                        right: 50,

                        bottom: 0,

                        left: 2

                    }

                },


                plugins: {

                    legend: {

                         display: false,

                        position: "top",

                        labels: {

                            usePointStyle: true,

                            boxWidth: 10,

                            padding: 12,

                            color:
                                "#172653",

                            font: {

                                size: 10,

                                weight: "bold"

                            }

                        }

                    },


                    tooltip: {

                        callbacks: {

                            title(context) {

                                const item =
                                    dadosRanking[
                                        context[0].dataIndex
                                    ];


                                return item.descricao
                                    ? `${item.sku} — ${item.descricao}`
                                    : item.sku;
                            },


                            label(context) {

                                return (
                                    ` Quantidade: ${
                                        amostraFormatarNumero(
                                            context.raw
                                        )
                                    }`
                                );

                            }

                        }

                    },


                    datalabels: {

                        display: false

                    }

                },


                scales: {

                    y: {

                        grid: {

                            display: false

                        },

                        border: {

                            display: false

                        },

                        ticks: {

                            autoSkip: false,

                            color:
                                "#172653",

                            font: {
    family: "Segoe UI",
    size: 12,
    weight: "700"
}

                        }

                    },


                    x: {

                        beginAtZero: true,

                        suggestedMax:
                            Math.ceil(
                                maiorQuantidade * 1.2
                            ),

                        grid: {

                            color:
                                "rgba(15,31,77,.08)"

                        },

                        border: {

                            display: false

                        },

                        title: {

                            display: true,

                            text:
                                "Quantidade de amostras",

                            color:
                                "#172653",

                            font: {

                                weight: "bold"

                            }

                        },
ticks: {
    precision: 0,

    color: "#243b6b",

    font: {
        family: "Segoe UI",
        size: 11,
        weight: "700"
    },

    callback(valor) {
        return (
            Number(valor) === 0
                ? ""
                : amostraFormatarNumero(valor)
        );
    }
}

                    }

                }

            },

            plugins: [
                pluginRotulos
            ]

        });
}
