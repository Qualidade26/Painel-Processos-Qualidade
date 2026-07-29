let graficoParetoImportacao = null;


/*
|--------------------------------------------------------------------------
| TRATAMENTO DOS VALORES DO GRÁFICO
|--------------------------------------------------------------------------
| Converte valores zerados, vazios ou inválidos em null.
| Dessa forma:
|
| - o mês continua aparecendo no eixo horizontal;
| - nenhuma barra é desenhada;
| - nenhum ponto é desenhado;
| - a linha de horas não desce até zero;
| - o tooltip não mostra valores zerados.
*/
function valorGrafico(valor) {

    
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Aceita números com vírgula ou ponto.
    |--------------------------------------------------------------------------
    | Exemplos:
    |
    | "10,5" vira 10.5
    | "10.5" continua 10.5
    | "0" vira null
    | "0,00" vira null
    */
    const valorNormalizado = String(valor)
        .trim()
        .replace(",", ".");

    const valorNumerico = Number(valorNormalizado);

    if (
        !Number.isFinite(valorNumerico) ||
        valorNumerico === 0
    ) {
        return null;
    }

    return valorNumerico;
}


/*
|--------------------------------------------------------------------------
| VERIFICA SE O VALOR DO GRÁFICO É VÁLIDO
|--------------------------------------------------------------------------
*/
function possuiValorGrafico(valor) {

    return (
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number(valor) !== 0
    );
}


/*
|--------------------------------------------------------------------------
| RENDERIZAÇÃO DA PÁGINA DE IMPORTAÇÃO
|--------------------------------------------------------------------------
*/
function renderImportacao() {

    const imp = dados.importacao || {
        processosAno: 0,
        totalSku: 0,
        totalLotes: 0,
        laudosEmitidos: 0,
        totalHoras: 0,
        mensal: [],
        paretoSku: [],
        fluxo: []
    };


    /*
    |--------------------------------------------------------------------------
    | DESTRÓI OS GRÁFICOS ANTERIORES
    |--------------------------------------------------------------------------
    | Evita gráficos duplicados quando o usuário sai da página
    | e entra novamente.
    */
    if (
        typeof graficoAtual !== "undefined" &&
        graficoAtual
    ) {
        graficoAtual.destroy();
        graficoAtual = null;
    }

    if (graficoParetoImportacao) {
        graficoParetoImportacao.destroy();
        graficoParetoImportacao = null;
    }


    conteudo.innerHTML = `
        <div class="page-title">
            📦 INSPEÇÃO DE IMPORTAÇÃO
        </div>

        <section class="cards">

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
                "📑",
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
                numero(imp.totalHoras),
                "Horas da atividade"
            )}

        </section>

        <section class="panel">

            <h3>
                📊 Evolução Mensal da Inspeção de Importação
            </h3>

            <div class="chart-box chart-box-importacao">
                <canvas id="graficoImportacao"></canvas>
            </div>

        </section>

        <section class="importacao-bottom-grid">

            <div class="panel">

                <h3>
                    📈 Pareto de SKUs Inspecionados — Ano
                </h3>

                <div class="chart-box chart-box-pareto">
                    <canvas id="graficoParetoImportacao"></canvas>
                </div>

            </div>

            <div class="panel">

                <h3>
                    📋 Fluxo da Inspeção de Importação
                </h3>

               ${tabelaFixa(
    [
        "PO",
        "SKU",
        "Descrição do Produto",
        "Lote",
        "Status",
        "Observação"
    ],
    montarLinhasImportacao(
        imp.fluxo || []
    ),
    false
)}

                <div class="table-footer">

                    <button
                        type="button"
                        class="btn-ver-todos"
                        onclick="verTodosImportacao()"
                    >
                        VER TODOS
                    </button>

                </div>

            </div>

        </section>
    `;


    criarGraficoMensalImportacao(imp);
    criarGraficoParetoImportacao(imp);
}


/*
|--------------------------------------------------------------------------
| GRÁFICO DE EVOLUÇÃO MENSAL
|--------------------------------------------------------------------------
*/
function criarGraficoMensalImportacao(imp) {

    const mensal = Array.isArray(imp.mensal)
        ? imp.mensal
        : [];

    const canvas = document.getElementById(
        "graficoImportacao"
    );

    if (!canvas) {
        console.error(
            "Canvas graficoImportacao não encontrado."
        );
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | PREPARAÇÃO DOS DADOS
    |--------------------------------------------------------------------------
    | Os 12 meses continuam no gráfico.
    | Somente os valores zerados são transformados em null.
    */
    const meses = mensal.map(item =>
        item.mes || ""
    );

    const processos = mensal.map(item =>
        valorGrafico(item.processos)
    );

    const sku = mensal.map(item =>
        valorGrafico(item.sku)
    );

    const lotes = mensal.map(item =>
        valorGrafico(item.lotes)
    );

    const laudos = mensal.map(item =>
        valorGrafico(item.laudos)
    );

    const horas = mensal.map(item =>
        valorGrafico(item.horas)
    );


    graficoAtual = new Chart(
        canvas,
        {
            data: {

                labels: meses,

                datasets: [

                    /*
                    |--------------------------------------------------------------------------
                    | PROCESSOS
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "bar",
                        label: "Processos",
                        data: processos,

                        backgroundColor: "#1d4eff",
                        borderColor: "#1d4eff",
                        borderWidth: 1,
                        borderRadius: 3,

                        yAxisID: "y",
                        order: 2,

                        skipNull: true
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | SKU
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "bar",
                        label: "SKU",
                        data: sku,

                        backgroundColor:
                            "rgba(240, 77, 216, 0.65)",

                        borderColor: "#f04dd8",
                        borderWidth: 2,
                        borderRadius: 3,

                        yAxisID: "y",
                        order: 2,

                        skipNull: true
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | LOTES
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "bar",
                        label: "Lotes",
                        data: lotes,

                        backgroundColor:
                            "rgba(34, 197, 94, 0.55)",

                        borderColor: "#22c55e",
                        borderWidth: 2,
                        borderRadius: 3,

                        yAxisID: "y",
                        order: 2,

                        skipNull: true
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | LAUDOS
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "bar",
                        label: "Laudos",
                        data: laudos,

                        backgroundColor:
                            "rgba(139, 92, 246, 0.55)",

                        borderColor: "#6d28d9",
                        borderWidth: 2,
                        borderRadius: 3,

                        yAxisID: "y",
                        order: 2,

                        skipNull: true
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | HORAS
                    |--------------------------------------------------------------------------
                    | A linha não será desenhada nos valores null.
                    */
                    {
                        type: "line",
                        label: "Horas",
                        data: horas,

                        borderColor: "#f97316",
                        backgroundColor: "#f97316",

                        pointBackgroundColor: "#f97316",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 1,

                        /*
                        |--------------------------------------------------------------------------
                        | ESCONDE O PONTO QUANDO O VALOR FOR NULL OU ZERO
                        |--------------------------------------------------------------------------
                        */
                        pointRadius: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            )
                                ? 4
                                : 0;
                        },

                        pointHoverRadius: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            )
                                ? 6
                                : 0;
                        },

                        pointHitRadius: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            )
                                ? 10
                                : 0;
                        },

                        borderWidth: 2,
                        tension: 0.35,

                        /*
                        |--------------------------------------------------------------------------
                        | NÃO UNE A LINHA ATRAVÉS DE MESES SEM DADOS
                        |--------------------------------------------------------------------------
                        */
                        spanGaps: false,

                        /*
                        |--------------------------------------------------------------------------
                        | Não desenha pontos nulos.
                        |--------------------------------------------------------------------------
                        */
                        skipNull: true,

                        yAxisID: "y1",
                        order: 1
                    }

                ]
            },


            options: {

                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },


                plugins: {

                    /*
                    |--------------------------------------------------------------------------
                    | LEGENDA
                    |--------------------------------------------------------------------------
                    */
                    legend: {
                        position: "top",

                        labels: {
                            usePointStyle: false,
                            boxWidth: 32,
                            padding: 18
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | TOOLTIP
                    |--------------------------------------------------------------------------
                    | Não apresenta valores null ou zero.
                    */
                    tooltip: {
                        enabled: true,

                        filter: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            );
                        },

                        callbacks: {

                            label: function(context) {

                                if (
                                    !possuiValorGrafico(
                                        context.raw
                                    )
                                ) {
                                    return "";
                                }

                                const nome =
                                    context.dataset.label || "";

                                return (
                                    `${nome}: ` +
                                    `${context.formattedValue}`
                                );
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | CHARTJS-PLUGIN-DATALABELS
                    |--------------------------------------------------------------------------
                    | Caso o projeto esteja usando o plugin DataLabels,
                    | impede que o número zero apareça sobre o gráfico.
                    */
                    datalabels: {

                        display: function(context) {

                            const valor =
                                context.dataset.data[
                                    context.dataIndex
                                ];

                            return possuiValorGrafico(
                                valor
                            );
                        },

                        formatter: function(valor) {

                            return possuiValorGrafico(valor)
                                ? valor
                                : "";
                        }
                    }
                },


                scales: {

                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DOS MESES
                    |--------------------------------------------------------------------------
                    */
                    x: {

                        grid: {
                            display: false
                        },

                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DE QUANTIDADE
                    |--------------------------------------------------------------------------
                    */
                    y: {
                        beginAtZero: true,
                        position: "left",

                        title: {
                            display: true,
                            text: "Quantidade"
                        },

                        ticks: {
                            precision: 0
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DE HORAS
                    |--------------------------------------------------------------------------
                    */
                    y1: {
                        beginAtZero: true,
                        position: "right",

                        title: {
                            display: true,
                            text: "Horas"
                        },

                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        }
    );
}


/*
|--------------------------------------------------------------------------
| GRÁFICO DE PARETO DOS SKUs
|--------------------------------------------------------------------------
*/
function criarGraficoParetoImportacao(imp) {

    const paretoOriginal = Array.isArray(
        imp.paretoSku
    )
        ? imp.paretoSku
        : [];


    /*
    |--------------------------------------------------------------------------
    | REMOVE REGISTROS ZERADOS DO PARETO
    |--------------------------------------------------------------------------
    */
    const pareto = paretoOriginal
        .map(item => {

            const quantidade =
                valorGrafico(item.quantidade);

            return {
                sku:
                    item.sku ||
                    "Sem identificação",

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
        );


    const canvas = document.getElementById(
        "graficoParetoImportacao"
    );

    if (!canvas) {
        console.error(
            "Canvas graficoParetoImportacao não encontrado."
        );
        return;
    }


    const labels = pareto.map(item =>
        item.sku
    );

    const quantidades = pareto.map(item =>
        item.quantidade
    );


    const total = quantidades.reduce(
        (soma, valor) =>
            soma + valor,
        0
    );


    let acumulado = 0;


    const percentuaisAcumulados =
        quantidades.map(valor => {

            acumulado += valor;

            if (total === 0) {
                return null;
            }

            return Number(
                (
                    (acumulado / total) *
                    100
                ).toFixed(1)
            );
        });


    graficoParetoImportacao = new Chart(
        canvas,
        {
            data: {

                labels: labels,

                datasets: [

                    /*
                    |--------------------------------------------------------------------------
                    | QUANTIDADE
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "bar",
                        label: "Quantidade",
                        data: quantidades,

                        backgroundColor: "#1455d9",
                        borderColor: "#1455d9",
                        borderWidth: 1,
                        borderRadius: 3,

                        xAxisID: "x",
                        order: 2,

                        skipNull: true
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | PERCENTUAL ACUMULADO
                    |--------------------------------------------------------------------------
                    */
                    {
                        type: "line",
                        label: "% Acumulado",
                        data: percentuaisAcumulados,

                        borderColor: "#f97316",
                        backgroundColor: "#f97316",

                        pointBackgroundColor: "#f97316",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 1,

                        pointRadius: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            )
                                ? 3
                                : 0;
                        },

                        pointHoverRadius: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            )
                                ? 5
                                : 0;
                        },

                        borderWidth: 2,
                        tension: 0.2,
                        spanGaps: false,

                        xAxisID: "x1",
                        order: 1
                    }

                ]
            },


            options: {

                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",

                interaction: {
                    mode: "index",
                    intersect: false
                },


                plugins: {

                    legend: {
                        position: "top",

                        labels: {
                            boxWidth: 25,
                            padding: 15
                        }
                    },


                    tooltip: {
                        enabled: true,

                        filter: function(context) {

                            return possuiValorGrafico(
                                context.raw
                            );
                        },

                        callbacks: {

                            label: function(context) {

                                if (
                                    !possuiValorGrafico(
                                        context.raw
                                    )
                                ) {
                                    return "";
                                }

                                if (
                                    context.dataset.label ===
                                    "% Acumulado"
                                ) {
                                    return (
                                        `% acumulado: ` +
                                        `${context.raw}%`
                                    );
                                }

                                return (
                                    `Quantidade: ` +
                                    `${context.raw}`
                                );
                            }
                        }
                    },


                    datalabels: {

                        display: function(context) {

                            const valor =
                                context.dataset.data[
                                    context.dataIndex
                                ];

                            return possuiValorGrafico(
                                valor
                            );
                        },

                        formatter: function(valor) {

                            return possuiValorGrafico(valor)
                                ? valor
                                : "";
                        }
                    }
                },


                scales: {

                    y: {

                        grid: {
                            display: false
                        },

                        title: {
                            display: true,
                            text: "SKU"
                        }
                    },


                    x: {
                        beginAtZero: true,
                        position: "bottom",

                        title: {
                            display: true,
                            text: "Quantidade"
                        },

                        ticks: {
                            precision: 0
                        }
                    },


                    x1: {
                        beginAtZero: true,
                        max: 100,
                        position: "top",

                        grid: {
                            drawOnChartArea: false
                        },

                        ticks: {

                            callback: function(valor) {
                                return `${valor}%`;
                            }
                        },

                        title: {
                            display: true,
                            text: "% Acumulado"
                        }
                    }
                }
            }
        }
    );
}


/*
|--------------------------------------------------------------------------
| BOTÃO VER TODOS
|--------------------------------------------------------------------------
*/
function verTodosImportacao() {

    console.log(
        "Abrir todos os registros da inspeção de importação."
    );

    /*
    |--------------------------------------------------------------------------
    | Aqui poderá ser adicionada futuramente:
    |--------------------------------------------------------------------------
    |
    | - abertura de um modal;
    | - exibição de uma tabela completa;
    | - redirecionamento para outra página;
    | - exportação dos registros.
    */
}
