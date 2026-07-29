function renderAmostra() {

    const a = dados.amostras || {
        mensal: [],
        top10: [],
        totalHoras: 0
    };

    const mensal = Array.isArray(a.mensal) ? a.mensal : [];
    const top10 = Array.isArray(a.top10) ? a.top10 : [];

    // =====================================================
    // DADOS GERAIS
    // =====================================================

    const totalAno = mensal.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const totalHoras = Number(a.totalHoras || 0);

    const mesesComMovimento = mensal.filter(
        item => Number(item.valor || 0) > 0
    );

    const mediaMensal = mesesComMovimento.length
        ? totalAno / mesesComMovimento.length
        : 0;

    const melhorMes = mensal.reduce(
        (melhor, atual) => {
            return Number(atual.valor || 0) >
                Number(melhor.valor || 0)
                ? atual
                : melhor;
        },
        {
            mes: "-",
            valor: 0
        }
    );

    // =====================================================
    // NORMALIZAÇÃO DO TOP 10
    // Compatível com nomes diferentes de propriedades
    // =====================================================

    const pareto = top10
        .map(item => ({
            sku:
                item.sku ||
                item.SKU ||
                item.codigo ||
                item.nome ||
                "-",

            descricao:
                item.descricao ||
                item.descrição ||
                "",

            quantidade: Number(
                item.quantidade ??
                item.qtd ??
                item.valor ??
                item.total ??
                0
            )
        }))
        .filter(item => item.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

    const totalPareto = pareto.reduce(
        (soma, item) => soma + item.quantidade,
        0
    );

    let acumulado = 0;

    const percentualAcumulado = pareto.map(item => {

        acumulado += item.quantidade;

        return totalPareto > 0
            ? Number(((acumulado / totalPareto) * 100).toFixed(1))
            : 0;
    });

    const skuMaisSolicitado = pareto[0] || {
        sku: "-",
        quantidade: 0
    };

    const tempoMedioHoras =
        totalAno > 0
            ? totalHoras / totalAno
            : 0;

    const tempoMedioMinutos =
        tempoMedioHoras * 60;

    // =====================================================
    // HTML
    // =====================================================

    conteudo.innerHTML = `
        <div class="page-title">
            📦 AMOSTRA
        </div>

        <section class="cards amostra-cards-topo">

            ${card(
                "📦",
                "Amostras Solicitadas no Ano",
                numero(totalAno),
                "Total acumulado"
            )}

            ${card(
                "⏱",
                "Total de Horas",
                `${tempoBR(totalHoras)} h`,
                "Horas destinadas"
            )}

        </section>

        <section class="grid-2 amostra-graficos-principais">

            <div class="panel amostra-panel-principal">

                <h3>EVOLUÇÃO MENSAL DE AMOSTRAS</h3>

                <div class="chart-box amostra-chart-principal">
                    <canvas id="graficoAmostrasMensal"></canvas>
                </div>

            </div>

            <div class="panel amostra-panel-principal">

                <h3>PARETO DAS AMOSTRAS MAIS SOLICITADAS (ANO)</h3>

                <div class="chart-box amostra-chart-pareto">
                    <canvas id="graficoParetoAmostras"></canvas>
                </div>

            </div>

        </section>

        <section class="amostra-indicadores">

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ▦
                    </div>

                    <div>
                        <span class="amostra-indicador-titulo">
                            Média de Amostras/Mês
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${mediaMensal.toLocaleString("pt-BR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1
                            })}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            Amostras por mês
                        </span>
                    </div>

                </div>

                <div class="amostra-mini-chart">
                    <canvas id="miniMediaAmostras"></canvas>
                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        🏆
                    </div>

                    <div>
                        <span class="amostra-indicador-titulo">
                            Melhor Mês
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${numero(melhorMes.valor)}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${melhorMes.mes || "-"}
                        </span>
                    </div>

                </div>

                <div class="amostra-mini-chart">
                    <canvas id="miniMelhorMes"></canvas>
                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ☆
                    </div>

                    <div>
                        <span class="amostra-indicador-titulo">
                            SKU Mais Solicitado
                        </span>

                        <strong class="amostra-indicador-valor amostra-sku">
                            ${skuMaisSolicitado.sku}
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${numero(skuMaisSolicitado.quantidade)} amostras
                        </span>
                    </div>

                </div>

                <div class="amostra-mini-chart">
                    <canvas id="miniSku"></canvas>
                </div>

            </div>

            <div class="panel amostra-indicador-card">

                <div class="amostra-indicador-conteudo">

                    <div class="amostra-indicador-icone">
                        ◷
                    </div>

                    <div>
                        <span class="amostra-indicador-titulo">
                            Tempo Médio por Amostra
                        </span>

                        <strong class="amostra-indicador-valor">
                            ${tempoMedioHoras.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} h
                        </strong>

                        <span class="amostra-indicador-subtitulo">
                            ${tempoMedioMinutos.toLocaleString("pt-BR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1
                            })} min por amostra
                        </span>
                    </div>

                </div>

                <div class="amostra-mini-chart">
                    <canvas id="miniTempoAmostra"></canvas>
                </div>

            </div>

        </section>
    `;

    // =====================================================
    // DESTRUIÇÃO DOS GRÁFICOS ANTERIORES
    // =====================================================

    if (window.graficoAmostrasMensalAtual) {
        window.graficoAmostrasMensalAtual.destroy();
    }

    if (window.graficoParetoAmostrasAtual) {
        window.graficoParetoAmostrasAtual.destroy();
    }

    if (Array.isArray(window.miniGraficosAmostra)) {
        window.miniGraficosAmostra.forEach(grafico => {
            if (grafico) grafico.destroy();
        });
    }

    window.miniGraficosAmostra = [];

    // =====================================================
    // GRÁFICO MENSAL
    // Barras para quantidade + linha para horas
    // =====================================================

    const opcoesMensal = baseOptions();

    opcoesMensal.maintainAspectRatio = false;

    opcoesMensal.interaction = {
        mode: "index",
        intersect: false
    };

    opcoesMensal.plugins = {
        ...opcoesMensal.plugins,

        legend: {
            display: true,
            position: "top",
            align: "center",

            labels: {
                usePointStyle: true,
                boxWidth: 18,
                padding: 18,
                color: "#1b2b5c",
                font: {
                    size: 11,
                    weight: "600"
                }
            }
        },

        tooltip: {
            callbacks: {
                label(context) {

                    const valor = Number(context.raw || 0);

                    if (context.dataset.yAxisID === "y1") {
                        return ` Horas: ${valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} h`;
                    }

                    return ` Amostras: ${numero(valor)}`;
                }
            }
        }
    };

    opcoesMensal.scales = {

        y: {
            beginAtZero: true,
            position: "left",

            suggestedMax: Math.max(
                10,
                ...mensal.map(item => Number(item.valor || 0))
            ) * 1.25,

            title: {
                display: true,
                text: "Quantidade de amostras",
                color: "#0f1f4d",
                font: {
                    weight: "bold"
                }
            },

            grid: {
                color: "rgba(15,31,77,.08)"
            },

            ticks: {
                precision: 0,
                color: "#5c6c96"
            }
        },

        y1: {
            beginAtZero: true,
            position: "right",

            suggestedMax: Math.max(
                4,
                ...mensal.map(item => Number(item.horas || 0))
            ) * 1.25,

            title: {
                display: true,
                text: "Horas (h)",
                color: "#6d28d9",
                font: {
                    weight: "bold"
                }
            },

            grid: {
                drawOnChartArea: false
            },

            ticks: {
                color: "#6d28d9",

                callback(valor) {
                    return Number(valor).toLocaleString("pt-BR");
                }
            }
        },

        x: {
            offset: true,

            grid: {
                display: false
            },

            ticks: {
                color: "#5c6c96",
                maxRotation: 0,
                minRotation: 0
            }
        }
    };

    window.graficoAmostrasMensalAtual = new Chart(
        document.getElementById("graficoAmostrasMensal"),
        {
            type: "bar",

            data: {
                labels: mensal.map(item => item.mes),

                datasets: [
                    {
                        type: "bar",
                        label: "Amostras",
                        data: mensal.map(
                            item => Number(item.valor || 0)
                        ),

                        backgroundColor: "#1d4ed8",
                        borderColor: "#1d4ed8",
                        borderWidth: 1,
                        borderRadius: 2,
                        maxBarThickness: 32,
                        categoryPercentage: 0.72,
                        barPercentage: 0.78,
                        yAxisID: "y"
                    },

                    {
                        type: "line",
                        label: "Horas (h)",
                        data: mensal.map(
                            item => Number(item.horas || 0)
                        ),

                        borderColor: "#6d28d9",
                        backgroundColor: "#6d28d9",
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#6d28d9",
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        borderDash: [6, 4],
                        tension: 0.25,
                        fill: false,
                        yAxisID: "y1"
                    }
                ]
            },

            options: opcoesMensal,

            plugins: [
                {
                    id: "rotulosGraficoAmostras",

                    afterDatasetsDraw(chart) {

                        const ctx = chart.ctx;

                        chart.data.datasets.forEach(
                            (dataset, datasetIndex) => {

                                const meta =
                                    chart.getDatasetMeta(datasetIndex);

                                meta.data.forEach((elemento, index) => {

                                    const valor =
                                        Number(dataset.data[index] || 0);

                                    if (valor <= 0) return;

                                    ctx.save();

                                    ctx.textAlign = "center";
                                    ctx.textBaseline = "bottom";
                                    ctx.font =
                                        "600 10px Arial";

                                    ctx.fillStyle =
                                        dataset.yAxisID === "y1"
                                            ? "#6d28d9"
                                            : "#12245c";

                                    const texto =
                                        dataset.yAxisID === "y1"
                                            ? valor.toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )
                                            : numero(valor);

                                    ctx.fillText(
                                        texto,
                                        elemento.x,
                                        elemento.y - 7
                                    );

                                    ctx.restore();
                                });
                            }
                        );
                    }
                }
            ]
        }
    );

    // =====================================================
    // GRÁFICO DE PARETO
    // Barras horizontais + percentual acumulado
    // =====================================================

    const maiorQuantidade = Math.max(
        1,
        ...pareto.map(item => item.quantidade)
    );

    const limiteQuantidade =
        Math.ceil((maiorQuantidade * 1.25) / 10) * 10;

    window.graficoParetoAmostrasAtual = new Chart(
        document.getElementById("graficoParetoAmostras"),
        {
            type: "bar",

            data: {
                labels: pareto.map(item => item.sku),

                datasets: [
                    {
                        type: "bar",
                        label: "Quantidade",
                        data: pareto.map(
                            item => item.quantidade
                        ),

                        backgroundColor: "#1647c9",
                        borderColor: "#1647c9",
                        borderWidth: 1,
                        borderRadius: 1,
                        maxBarThickness: 15,
                        categoryPercentage: 0.62,
                        barPercentage: 0.85,
                        xAxisID: "x",
                        yAxisID: "y",
                        order: 2
                    },

                    {
                        type: "line",
                        label: "% Acumulado",
                        data: percentualAcumulado,

                        borderColor: "#6d28d9",
                        backgroundColor: "#6d28d9",
                        pointBackgroundColor: "#6d28d9",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        tension: 0,
                        fill: false,
                        xAxisID: "xPercentual",
                        yAxisID: "y",
                        order: 1
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",

                layout: {
                    padding: {
                        top: 4,
                        right: 58,
                        bottom: 0,
                        left: 4
                    }
                },

                interaction: {
                    mode: "nearest",
                    intersect: false
                },

                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        align: "center",

                        labels: {
                            usePointStyle: true,
                            boxWidth: 18,
                            padding: 18,
                            color: "#1b2b5c",
                            font: {
                                size: 11,
                                weight: "600"
                            }
                        }
                    },

                    tooltip: {
                        callbacks: {
                            title(context) {

                                const indice =
                                    context[0].dataIndex;

                                const item =
                                    pareto[indice];

                                return item.descricao
                                    ? `${item.sku} - ${item.descricao}`
                                    : item.sku;
                            },

                            label(context) {

                                if (
                                    context.dataset.xAxisID ===
                                    "xPercentual"
                                ) {
                                    return ` Acumulado: ${Number(
                                        context.raw
                                    ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 1
                                    })}%`;
                                }

                                return ` Quantidade: ${numero(
                                    context.raw
                                )}`;
                            }
                        }
                    }
                },

                scales: {
                    y: {
                        stacked: false,

                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            autoSkip: false,
                            color: "#172653",
                            padding: 8,

                            font: {
                                size: 11,
                                weight: "600"
                            }
                        },

                        title: {
                            display: true,
                            text: "SKU",
                            color: "#172653",
                            align: "start",

                            font: {
                                size: 11,
                                weight: "bold"
                            }
                        }
                    },

                    x: {
                        beginAtZero: true,
                        position: "bottom",
                        min: 0,
                        max: limiteQuantidade,

                        grid: {
                            color: "rgba(15,31,77,.08)"
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            color: "#5c6c96",
                            precision: 0
                        },

                        title: {
                            display: true,
                            text: "Quantidade de amostras",
                            color: "#172653",

                            font: {
                                size: 11,
                                weight: "600"
                            }
                        }
                    },

                    xPercentual: {
                        beginAtZero: true,
                        position: "top",
                        min: 0,
                        max: 100,

                        grid: {
                            drawOnChartArea: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {
                            display: false
                        }
                    }
                }
            },

            plugins: [
                {
                    id: "rotulosParetoAmostras",

                    afterDatasetsDraw(chart) {

                        const ctx = chart.ctx;

                        const barras =
                            chart.getDatasetMeta(0);

                        const linha =
                            chart.getDatasetMeta(1);

                        ctx.save();

                        barras.data.forEach(
                            (barra, index) => {

                                const quantidade =
                                    pareto[index].quantidade;

                                const percentual =
                                    percentualAcumulado[index];

                                // Quantidade no final da barra
                                ctx.textAlign = "left";
                                ctx.textBaseline = "middle";
                                ctx.fillStyle = "#172653";
                                ctx.font =
                                    "600 10px Arial";

                                ctx.fillText(
                                    numero(quantidade),
                                    barra.x + 7,
                                    barra.y
                                );

                                // Percentual alinhado à direita
                                ctx.textAlign = "right";
                                ctx.fillStyle = "#6d28d9";

                                ctx.fillText(
                                    `${percentual.toLocaleString(
                                        "pt-BR",
                                        {
                                            minimumFractionDigits: 1,
                                            maximumFractionDigits: 1
                                        }
                                    )}%`,
                                    chart.chartArea.right + 52,
                                    linha.data[index].y
                                );
                            }
                        );

                        ctx.restore();
                    }
                }
            ]
        }
    );

    // =====================================================
    // MINI GRÁFICOS DOS INDICADORES
    // =====================================================

    const valoresMensais = mensal.map(
        item => Number(item.valor || 0)
    );

    const valoresHoras = mensal.map(
        item => Number(item.horas || 0)
    );

    const valoresPareto = pareto.map(
        item => item.quantidade
    );

    function criarMiniGrafico(
        id,
        tipo,
        valores,
        cor,
        destaqueMaior = false
    ) {

        const canvas = document.getElementById(id);

        if (!canvas) return;

        const cores = valores.map(valor => {

            if (
                destaqueMaior &&
                valor === Math.max(...valores)
            ) {
                return "#16a34a";
            }

            return cor;
        });

        const grafico = new Chart(canvas, {
            type: tipo,

            data: {
                labels: valores.map((_, index) => index + 1),

                datasets: [{
                    data: valores,

                    backgroundColor:
                        tipo === "bar"
                            ? cores
                            : cor,

                    borderColor: cor,
                    borderWidth:
                        tipo === "line"
                            ? 2
                            : 0,

                    pointRadius:
                        tipo === "line"
                            ? 2
                            : 0,

                    pointHoverRadius: 3,
                    borderRadius: 1,
                    tension: 0.25,
                    fill: false
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 500
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: false
                    }
                },

                scales: {
                    x: {
                        display: false
                    },

                    y: {
                        display: false,
                        beginAtZero: true
                    }
                }
            }
        });

        window.miniGraficosAmostra.push(grafico);
    }

    criarMiniGrafico(
        "miniMediaAmostras",
        "bar",
        valoresMensais,
        "#3b82f6"
    );

    criarMiniGrafico(
        "miniMelhorMes",
        "bar",
        valoresMensais,
        "#22c55e",
        true
    );

    criarMiniGrafico(
        "miniSku",
        "bar",
        valoresPareto,
        "#3b82f6"
    );

    criarMiniGrafico(
        "miniTempoAmostra",
        "line",
        valoresHoras,
        "#2563eb"
    );
}
function tempoBR(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
