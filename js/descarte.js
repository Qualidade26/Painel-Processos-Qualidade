/* ==========================================================
   RÓTULOS EXTERNOS DO GRÁFICO DE PIZZA
========================================================== */

const rotulosExternosPizza = {

    id: "rotulosExternosPizza",

    afterDatasetsDraw(chart) {

        const { ctx, data } = chart;

        const dataset = data.datasets[0];

        if (!dataset || !dataset.data) {
            return;
        }

        const valores = dataset.data.map(valor =>
            Number(valor || 0)
        );

        const total = valores.reduce(
            (soma, valor) => soma + valor,
            0
        );

        if (total <= 0) {
            return;
        }

        const meta = chart.getDatasetMeta(0);

        ctx.save();

        ctx.font =
            "700 11px 'Segoe UI', Arial, sans-serif";

        ctx.fillStyle = "#0f2557";
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1.2;
        ctx.textBaseline = "middle";

        meta.data.forEach((elemento, indice) => {

            if (!chart.getDataVisibility(indice)) {
                return;
            }

            const valor = valores[indice];

            const percentual =
                (valor / total) * 100;

            const propriedades = elemento.getProps(
                [
                    "x",
                    "y",
                    "startAngle",
                    "endAngle",
                    "outerRadius"
                ],
                true
            );

            const angulo =
                (
                    propriedades.startAngle +
                    propriedades.endAngle
                ) / 2;

            const direcaoX =
                Math.cos(angulo);

            const direcaoY =
                Math.sin(angulo);

            const inicioX =
                propriedades.x +
                direcaoX *
                (propriedades.outerRadius + 2);

            const inicioY =
                propriedades.y +
                direcaoY *
                (propriedades.outerRadius + 2);

            const meioX =
                propriedades.x +
                direcaoX *
                (propriedades.outerRadius + 14);

            const meioY =
                propriedades.y +
                direcaoY *
                (propriedades.outerRadius + 14);

            const ladoDireito =
                direcaoX >= 0;

            const finalX =
                meioX +
                (
                    ladoDireito
                        ? 18
                        : -18
                );

            ctx.beginPath();

            ctx.moveTo(
                inicioX,
                inicioY
            );

            ctx.lineTo(
                meioX,
                meioY
            );

            ctx.lineTo(
                finalX,
                meioY
            );

            ctx.stroke();

            ctx.textAlign =
                ladoDireito
                    ? "left"
                    : "right";

            const texto =
                percentual.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    }
                ) + "%";

            ctx.fillText(
                texto,
                finalX +
                (
                    ladoDireito
                        ? 5
                        : -5
                ),
                meioY
            );
        });

        ctx.restore();
    }
};


/* ==========================================================
   TEXTO CENTRAL DO GRÁFICO DE ROSCA
========================================================== */

const totalCentroPizza = {

    id: "totalCentroPizza",

    afterDraw(chart) {

        const {
            ctx,
            chartArea
        } = chart;

        if (!chartArea) {
            return;
        }

        const centroX =
            (
                chartArea.left +
                chartArea.right
            ) / 2;

        const centroY =
            (
                chartArea.top +
                chartArea.bottom
            ) / 2;

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0f2557";

        ctx.font =
            "900 27px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "100%",
            centroX,
            centroY - 8
        );

        ctx.font =
            "800 12px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "Total",
            centroX,
            centroY + 17
        );

        ctx.restore();
    }
};


/* ==========================================================
   PÁGINA — DESCARTE
========================================================== */

function renderDescarte(){

    if(!senhaDescarteLiberada){

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
                    onkeydown="
                        if(event.key === 'Enter'){
                            validarSenhaDescarte();
                        }
                    "
                >

                <button
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
       DADOS
    ====================================================== */

    const d = dados.descarte || {

        total: 0,

        ultimoDescarte: 0,

        origens: [],

        top10: []
    };


    const origens =
        Array.isArray(d.origens)
            ? d.origens
            : [];


    const top =
        Array.isArray(d.top10)
            ? [...d.top10]
            : [];


    top.sort((a,b) =>

        Number(b.valor || 0) -
        Number(a.valor || 0)
    );


    const nomesOrigens = origens.map(item =>

        item.nome ||
        item.origem ||
        "Sem origem"
    );


    const valoresOrigens = origens.map(item =>

        Number(item.valor || 0)
    );


    const totalOrigens = valoresOrigens.reduce(

        (soma, valor) =>
            soma + valor,

        0
    );


    const coresOrigens = [

        "#1d4eff",

        "#0f3cc9",

        "#6b7cff",

        "#f04dd8",

        "#22c55e",

        "#38bdf8",

        "#8b5cf6",

        "#f59e0b",

        "#ef4444",

        "#14b8a6"
    ];


    /* ======================================================
       DESTRUIR GRÁFICOS ANTERIORES
    ====================================================== */

    if(
        window.graficoDescarteBarra &&
        typeof window.graficoDescarteBarra.destroy === "function"
    ){

        window.graficoDescarteBarra.destroy();
    }


    if(
        window.graficoDescartePizza &&
        typeof window.graficoDescartePizza.destroy === "function"
    ){

        window.graficoDescartePizza.destroy();
    }


    /* ======================================================
       HTML
    ====================================================== */

    conteudo.innerHTML = `

        <div class="page-title">
            🗑 DESCARTE
        </div>


        <section class="cards descarte-indicadores">

            ${card(
                "🗑",
                "Valor Atual",
                moeda(d.total),
                "Financeiro impactado"
            )}

            ${card(
                "📋",
                "Último Descarte",
                moeda(d.ultimoDescarte),
                "Última operação registrada"
            )}

        </section>


        <section class="descarte-grid">


            <div class="panel descarte-panel-origens">

                <h3>
                    📊 Descarte por Origem
                </h3>


                <div class="descarte-chart-barra">

                    <canvas
                        id="graficoDescarteOrigem"
                    ></canvas>

                </div>


                <h3 class="descarte-titulo-top3">
                    Top 3 Origens de Destino
                </h3>


                ${rankTop3Origem(origens)}

            </div>


            <div class="descarte-coluna-direita">


                <div class="panel descarte-panel-pizza">

                    <h3>
                        Descarte por Origem (%)
                    </h3>


                    <div class="descarte-chart-pizza">

                        <canvas
                            id="graficoDescartePizza"
                        ></canvas>

                    </div>

                </div>


                <div class="panel descarte-panel-top10">

                    <h3>
                        Top 10 Descarte
                    </h3>


                    ${
                        tabelaFixa(
                            [
                                "SKU",
                                "Descrição",
                                "Valor"
                            ],
                            montarLinhasTopDescarte(top),
                            true
                        )
                    }

                </div>

            </div>

        </section>
    `;


    /* ======================================================
       GRÁFICO DE BARRAS
    ====================================================== */

    const canvasBarra =
        document.getElementById(
            "graficoDescarteOrigem"
        );


    if(canvasBarra){

        window.graficoDescarteBarra =
            new Chart(
                canvasBarra,
                {

                    type: "bar",

                    data: {

                        labels: nomesOrigens,

                        datasets: [{

                            label: "Valor",

                            data: valoresOrigens,

                            backgroundColor:
                                coresOrigens,

                            borderWidth: 0,

                            borderRadius: 4,

                            borderSkipped: false,

                            _moeda: true
                        }]
                    },

                    options: {

                        ...baseOptions(),

                        indexAxis: "y",

                        responsive: true,

                        maintainAspectRatio: false,

                        layout: {

                            padding: {

                                top: 8,

                                right: 90,

                                bottom: 8,

                                left: 5
                            }
                        },

                        plugins: {

                            ...(
                                baseOptions().plugins ||
                                {}
                            ),

                            legend: {

                                display: false
                            },

                            tooltip: {

                                callbacks: {

                                    label(context){

                                        return moeda(
                                            context.raw
                                        );
                                    }
                                }
                            }
                        },

                        scales: {

                            x: {

                                beginAtZero: true,

                                grace: "18%",

                                ticks: {

                                    color: "#334155",

                                    callback(valor){

                                        return Number(valor)
                                            .toLocaleString(
                                                "pt-BR"
                                            );
                                    }
                                },

                                grid: {

                                    color:
                                        "rgba(148,163,184,.20)"
                                },

                                border: {

                                    display: false
                                }
                            },

                            y: {

                                ticks: {

                                    color: "#334155",

                                    padding: 8,

                                    font: {

                                        size: 11,

                                        weight: "600"
                                    }
                                },

                                grid: {

                                    display: false
                                },

                                border: {

                                    display: false
                                }
                            }
                        }
                    }
                }
            );
    }


    /* ======================================================
       GRÁFICO DE PIZZA / ROSCA
    ====================================================== */

    const canvasPizza =
        document.getElementById(
            "graficoDescartePizza"
        );


    if(canvasPizza){

        window.graficoDescartePizza =
            new Chart(
                canvasPizza,
                {

                    type: "doughnut",

                    plugins: [

                        rotulosExternosPizza,

                        totalCentroPizza
                    ],

                    data: {

                        labels: nomesOrigens,

                        datasets: [{

                            label: "Percentual",

                            data: valoresOrigens,

                            backgroundColor:
                                coresOrigens,

                            borderColor: "#ffffff",

                            borderWidth: 2,

                            hoverOffset: 7
                        }]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: "53%",

                        layout: {

                            padding: {

                                top: 30,

                                right: 48,

                                bottom: 30,

                                left: 48
                            }
                        },

                        plugins: {

                            legend: {

                                display: true,

                                position: "right",

                                align: "center",

                                labels: {

                                    usePointStyle: true,

                                    pointStyle: "circle",

                                    boxWidth: 9,

                                    boxHeight: 9,

                                    padding: 14,

                                    color: "#0f2557",

                                    font: {

                                        size: 11,

                                        weight: "700"
                                    },

                                    generateLabels(chart){

                                        const valores =
                                            chart.data
                                                .datasets[0]
                                                .data;

                                        const total =
                                            valores.reduce(
                                                (
                                                    soma,
                                                    valor
                                                ) =>
                                                    soma +
                                                    Number(
                                                        valor || 0
                                                    ),
                                                0
                                            );

                                        return chart.data.labels.map(
                                            (
                                                label,
                                                indice
                                            ) => {

                                                const valor =
                                                    Number(
                                                        valores[
                                                            indice
                                                        ] || 0
                                                    );

                                                const percentual =
                                                    total > 0
                                                        ? (
                                                            valor /
                                                            total
                                                        ) * 100
                                                        : 0;

                                                const cor =
                                                    chart.data
                                                        .datasets[0]
                                                        .backgroundColor[
                                                            indice
                                                        ];

                                                return {

                                                    text:
                                                        label +
                                                        " — " +
                                                        percentual
                                                            .toLocaleString(
                                                                "pt-BR",
                                                                {
                                                                    minimumFractionDigits: 1,
                                                                    maximumFractionDigits: 1
                                                                }
                                                            ) +
                                                        "%",

                                                    fillStyle:
                                                        cor,

                                                    strokeStyle:
                                                        cor,

                                                    lineWidth:
                                                        0,

                                                    pointStyle:
                                                        "circle",

                                                    hidden:
                                                        !chart
                                                            .getDataVisibility(
                                                                indice
                                                            ),

                                                    index:
                                                        indice
                                                };
                                            }
                                        );
                                    }
                                },

                                onClick(
                                    evento,
                                    item,
                                    legenda
                                ){

                                    const chart =
                                        legenda.chart;

                                    chart.toggleDataVisibility(
                                        item.index
                                    );

                                    chart.update();
                                }
                            },

                            tooltip: {

                                callbacks: {

                                    label(context){

                                        const valor =
                                            Number(
                                                context.raw ||
                                                0
                                            );

                                        const total =
                                            context.dataset.data.reduce(
                                                (
                                                    soma,
                                                    item
                                                ) =>
                                                    soma +
                                                    Number(
                                                        item || 0
                                                    ),
                                                0
                                            );

                                        const percentual =
                                            total > 0
                                                ? (
                                                    valor /
                                                    total
                                                ) * 100
                                                : 0;

                                        return (
                                            context.label +
                                            ": " +
                                            moeda(valor) +
                                            " — " +
                                            percentual
                                                .toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        minimumFractionDigits: 1,
                                                        maximumFractionDigits: 1
                                                    }
                                                ) +
                                            "%"
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            );
    }


    graficoAtual =
        window.graficoDescarteBarra;
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

        senhaDescarteLiberada = true;

        renderDescarte();

    }else{

        if(erroSenha){

            erroSenha.innerText =
                "Senha incorreta.";
        }


        campoSenha.focus();

        campoSenha.select();
    }
}
