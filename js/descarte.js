/* ==========================================================
   PÁGINA — DESCARTE
========================================================== */


/* ==========================================================
   CORES DOS GRÁFICOS
========================================================== */

const coresDescarte = [
    "#1d4eff",
    "#0f3cc9",
    "#6b7cff",
    "#f04dd8",
    "#16a05d",
    "#38bdf8",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#14b8a6"
];


/* ==========================================================
   FORMATAÇÃO DE PERCENTUAL
========================================================== */

function percentualDescarte(valor, total){

    const numeroValor = Number(valor || 0);
    const numeroTotal = Number(total || 0);

    if(numeroTotal <= 0){
        return 0;
    }

    return (
        numeroValor /
        numeroTotal
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


/* ==========================================================
   ESCAPAR TEXTO HTML
========================================================== */

function escaparTextoDescarte(valor){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==========================================================
   TOP 3 ORIGENS
========================================================== */

function montarTop3Descarte(origens){

    const lista =
        Array.isArray(origens)
            ? [...origens]
            : [];


    const total = lista.reduce(
        (soma, item) =>
            soma + Number(item.valor || 0),
        0
    );


    const top3 = lista

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

                const nome =
                    item.nome ||
                    item.origem ||
                    "Sem origem";

                const valor =
                    Number(item.valor || 0);

                const percentual =
                    percentualDescarte(
                        valor,
                        total
                    );

                const cor =
                    coresDescarte[
                        indice %
                        coresDescarte.length
                    ];

                return `

                    <div class="descarte-top3-card">

                        <div class="descarte-top3-cabecalho">

                            <span
                                class="descarte-top3-posicao"
                                style="
                                    background:${cor};
                                "
                            >
                                ${indice + 1}
                            </span>

                            <span class="descarte-top3-nome">
                                ${escaparTextoDescarte(nome)}
                            </span>

                        </div>

                        <div class="descarte-top3-valor">
                            ${moeda(valor)}
                        </div>

                        <div class="descarte-top3-percentual">
                            ${formatarPercentualDescarte(percentual)}
                            do total
                        </div>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}


/* ==========================================================
   RÓTULOS DOS VALORES NAS BARRAS
========================================================== */

const rotulosBarrasDescarte = {

    id:"rotulosBarrasDescarte",

    afterDatasetsDraw(chart){

        const meta =
            chart.getDatasetMeta(0);

        const dataset =
            chart.data.datasets[0];

        if(
            !meta ||
            !meta.data ||
            !dataset ||
            !Array.isArray(dataset.data)
        ){
            return;
        }

        const ctx = chart.ctx;

        ctx.save();

        ctx.font =
            "800 11px 'Segoe UI', Arial, sans-serif";

        ctx.fillStyle = "#0f2557";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";


        meta.data.forEach((barra, indice) => {

            if(
                barra.hidden ||
                !chart.getDataVisibility(indice)
            ){
                return;
            }

            const valor =
                Number(
                    dataset.data[indice] || 0
                );

            const propriedades =
                barra.getProps(
                    [
                        "x",
                        "y",
                        "base"
                    ],
                    true
                );

            let posicaoX =
                propriedades.x + 7;

            const limiteDireito =
                chart.chartArea.right - 4;

            const texto =
                moeda(valor);

            const larguraTexto =
                ctx.measureText(texto).width;

            if(
                posicaoX +
                larguraTexto >
                limiteDireito
            ){

                posicaoX =
                    limiteDireito -
                    larguraTexto;
            }

            ctx.fillText(
                texto,
                posicaoX,
                propriedades.y
            );
        });

        ctx.restore();
    }
};


/* ==========================================================
   RÓTULOS EXTERNOS DO GRÁFICO DE PIZZA
========================================================== */

const rotulosExternosPizza = {

    id:"rotulosExternosPizza",

    afterDatasetsDraw(chart){

        const dataset =
            chart.data.datasets[0];

        if(
            !dataset ||
            !Array.isArray(dataset.data)
        ){
            return;
        }

        const valores =
            dataset.data.map(
                valor =>
                    Number(valor || 0)
            );


        const total =
            valores.reduce(
                (soma, valor) =>
                    soma + valor,
                0
            );


        if(total <= 0){
            return;
        }


        const meta =
            chart.getDatasetMeta(0);

        const ctx =
            chart.ctx;


        ctx.save();

        ctx.font =
            "800 10px 'Segoe UI', Arial, sans-serif";

        ctx.fillStyle =
            "#0f2557";

        ctx.strokeStyle =
            "#64748b";

        ctx.lineWidth =
            1;

        ctx.textBaseline =
            "middle";


        meta.data.forEach(
            (elemento, indice) => {

                if(
                    !chart.getDataVisibility(indice)
                ){
                    return;
                }


                const valor =
                    valores[indice];


                const percentual =
                    percentualDescarte(
                        valor,
                        total
                    );


                const propriedades =
                    elemento.getProps(
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
                    (
                        propriedades.outerRadius +
                        2
                    );


                const inicioY =
                    propriedades.y +
                    direcaoY *
                    (
                        propriedades.outerRadius +
                        2
                    );


                const meioX =
                    propriedades.x +
                    direcaoX *
                    (
                        propriedades.outerRadius +
                        13
                    );


                const meioY =
                    propriedades.y +
                    direcaoY *
                    (
                        propriedades.outerRadius +
                        13
                    );


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


                ctx.fillText(
                    formatarPercentualDescarte(
                        percentual
                    ),
                    finalX +
                    (
                        ladoDireito
                            ? 4
                            : -4
                    ),
                    meioY
                );
            }
        );


        ctx.restore();
    }
};


/* ==========================================================
   TEXTO CENTRAL DO GRÁFICO DE ROSCA
========================================================== */

const totalCentroPizza = {

    id:"totalCentroPizza",

    afterDraw(chart){

        const meta =
            chart.getDatasetMeta(0);


        if(
            !meta ||
            !meta.data ||
            !meta.data.length
        ){
            return;
        }


        const primeiroArco =
            meta.data[0];


        const propriedades =
            primeiroArco.getProps(
                [
                    "x",
                    "y",
                    "innerRadius"
                ],
                true
            );


        const ctx =
            chart.ctx;


        /*
        Limpa somente o centro da rosca.

        Isso evita borrões causados por outros plugins
        ou redesenhos sucessivos.
        */

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            propriedades.x,
            propriedades.y,
            Math.max(
                propriedades.innerRadius - 2,
                1
            ),
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();


        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillStyle =
            "#0f2557";


        ctx.font =
            "900 27px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "100%",
            propriedades.x,
            propriedades.y - 8
        );


        ctx.font =
            "800 11px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "Total",
            propriedades.x,
            propriedades.y + 17
        );


        ctx.restore();
    }
};


/* ==========================================================
   DESTRUIR GRÁFICOS DA PÁGINA
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


    if(
        window.graficoDescartePizza &&
        typeof window.graficoDescartePizza.destroy ===
        "function"
    ){

        window.graficoDescartePizza.destroy();

        window.graficoDescartePizza =
            null;
    }
}


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
       DADOS
    ====================================================== */

    const d =
        dados.descarte || {

            total:0,

            ultimoDescarte:0,

            origens:[],

            top10:[]
        };


    const origens =
        Array.isArray(d.origens)
            ? d.origens
            : [];


    const top =
        Array.isArray(d.top10)
            ? [...d.top10]
            : [];


    top.sort(
        (a,b) =>
            Number(b.valor || 0) -
            Number(a.valor || 0)
    );


    const nomesOrigens =
        origens.map(
            item =>
                item.nome ||
                item.origem ||
                "Sem origem"
        );


    const valoresOrigens =
        origens.map(
            item =>
                Number(item.valor || 0)
        );


    destruirGraficosDescarte();


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


            <!-- ==========================================
                 PAINEL ESQUERDO
            =========================================== -->

            <div class="panel descarte-panel-origens">


                <h3 class="descarte-titulo-painel">

                    📊 Descarte por Origem

                </h3>


                <div class="descarte-chart-barra">

                    <canvas
                        id="graficoDescarteOrigem"
                    ></canvas>

                </div>


                <div class="descarte-top3-area">

                    <h3 class="descarte-titulo-top3">

                        Top 3 Origens de Destino

                    </h3>


                    ${montarTop3Descarte(origens)}

                </div>

            </div>


            <!-- ==========================================
                 COLUNA DIREITA
            =========================================== -->

            <div class="descarte-coluna-direita">


                <div class="panel descarte-panel-pizza">


                    <h3 class="descarte-titulo-painel">

                        Descarte por Origem (%)

                    </h3>


                    <div class="descarte-chart-pizza">

                        <canvas
                            id="graficoDescartePizza"
                        ></canvas>

                    </div>

                </div>


                <div class="panel descarte-panel-top10">


                    <h3 class="descarte-titulo-painel">

                        Top 10 Descarte

                    </h3>


                    <div class="descarte-top10-conteudo">

                        ${
                            tabelaFixa(
                                [
                                    "SKU",
                                    "Descrição",
                                    "Valor"
                                ],
                                montarLinhasTopDescarte(
                                    top
                                ),
                                true
                            )
                        }

                    </div>

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

        const opcoesBaseBarra =
            typeof baseOptions === "function"
                ? baseOptions()
                : {};


        window.graficoDescarteBarra =
            new Chart(
                canvasBarra,
                {

                    type:"bar",

                    plugins:[
                        rotulosBarrasDescarte
                    ],

                    data:{

                        labels:
                            nomesOrigens,

                        datasets:[{

                            label:"Valor",

                            data:
                                valoresOrigens,

                            backgroundColor:
                                coresDescarte,

                            borderWidth:0,

                            borderRadius:4,

                            borderSkipped:false,

                            barPercentage:.72,

                            categoryPercentage:.78,

                            _moeda:true
                        }]
                    },

                    options:{

                        ...opcoesBaseBarra,

                        indexAxis:"y",

                        responsive:true,

                        maintainAspectRatio:false,

                        animation:{

                            duration:500
                        },

                        layout:{

                            padding:{

                                top:8,

                                right:105,

                                bottom:4,

                                left:4
                            }
                        },

                        plugins:{

                            ...(
                                opcoesBaseBarra.plugins ||
                                {}
                            ),

                            datalabels:{

                                display:false
                            },

                            legend:{

                                display:false
                            },

                            tooltip:{

                                callbacks:{

                                    label(context){

                                        return moeda(
                                            context.raw
                                        );
                                    }
                                }
                            }
                        },

                        scales:{

                            x:{

                                beginAtZero:true,

                                grace:"18%",

                                ticks:{

                                    color:"#334155",

                                    font:{

                                        size:10,

                                        weight:"600"
                                    },

                                    callback(valor){

                                        return Number(valor)
                                            .toLocaleString(
                                                "pt-BR"
                                            );
                                    }
                                },

                                grid:{

                                    color:
                                        "rgba(148,163,184,.22)"
                                },

                                border:{

                                    display:false
                                }
                            },

                            y:{

                                ticks:{

                                    color:"#334155",

                                    padding:8,

                                    font:{

                                        size:11,

                                        weight:"600"
                                    }
                                },

                                grid:{

                                    display:false
                                },

                                border:{

                                    display:false
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

                    type:"doughnut",

                    plugins:[

                        rotulosExternosPizza,

                        totalCentroPizza
                    ],

                    data:{

                        labels:
                            nomesOrigens,

                        datasets:[{

                            label:"Percentual",

                            data:
                                valoresOrigens,

                            backgroundColor:
                                coresDescarte,

                            borderColor:
                                "#ffffff",

                            borderWidth:2,

                            hoverOffset:5,

                            spacing:0
                        }]
                    },

                    options:{

                        responsive:true,

                        maintainAspectRatio:false,

                        animation:{

                            duration:500
                        },

                        cutout:"48%",

                        radius:"82%",

                        layout:{

                            padding:{

                                top:28,

                                right:24,

                                bottom:28,

                                left:24
                            }
                        },

                        plugins:{

                            datalabels:{

                                display:false
                            },

                            legend:{

                                display:true,

                                position:"right",

                                align:"center",

                                labels:{

                                    usePointStyle:true,

                                    pointStyle:"circle",

                                    boxWidth:8,

                                    boxHeight:8,

                                    padding:12,

                                    color:"#0f2557",

                                    font:{

                                        size:10,

                                        weight:"700"
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
                                                        valor ||
                                                        0
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
                                                        ] ||
                                                        0
                                                    );


                                                const percentual =
                                                    percentualDescarte(
                                                        valor,
                                                        total
                                                    );


                                                const cor =
                                                    chart.data
                                                        .datasets[0]
                                                        .backgroundColor[
                                                            indice %
                                                            coresDescarte.length
                                                        ];


                                                return {

                                                    text:
                                                        label +
                                                        " — " +
                                                        formatarPercentualDescarte(
                                                            percentual
                                                        ),

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

                            tooltip:{

                                callbacks:{

                                    label(context){

                                        const valor =
                                            Number(
                                                context.raw ||
                                                0
                                            );


                                        const total =
                                            context.dataset.data
                                                .reduce(
                                                    (
                                                        soma,
                                                        item
                                                    ) =>
                                                        soma +
                                                        Number(
                                                            item ||
                                                            0
                                                        ),
                                                    0
                                                );


                                        const percentual =
                                            percentualDescarte(
                                                valor,
                                                total
                                            );


                                        return (
                                            context.label +
                                            ": " +
                                            moeda(valor) +
                                            " — " +
                                            formatarPercentualDescarte(
                                                percentual
                                            )
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
