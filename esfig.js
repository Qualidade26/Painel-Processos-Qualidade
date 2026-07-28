function renderEsfig(){

    const esfig = dados.esfig || {};


    /*
    |--------------------------------------------------------------------------
    | PRODUTOS DA TABELA
    |--------------------------------------------------------------------------
    | A tabela permanece ordenada pelo número do SKU.
    */
    const produtos = [...(esfig.produtos || [])]
        .sort((a,b) => {

            const na = parseInt(a.sku,10);
            const nb = parseInt(b.sku,10);

            if(
                Number.isNaN(na) &&
                Number.isNaN(nb)
            ){
                return String(a.sku || "")
                    .localeCompare(String(b.sku || ""));
            }

            if(Number.isNaN(na)){
                return 1;
            }

            if(Number.isNaN(nb)){
                return -1;
            }

            return na - nb;
        });


    /*
    |--------------------------------------------------------------------------
    | TOTAIS DO FLUXO OPERACIONAL
    |--------------------------------------------------------------------------
    */
    const totalAguardando =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.aguardando || 0),
            0
        );

    const totalDesmontado =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.desmontado || 0),
            0
        );

    const totalAferidos =
        produtos.reduce(
            (soma,item) =>
                soma + Number(item.aferidos || 0),
            0
        );

    const totalGeral =
        totalAguardando +
        totalDesmontado +
        totalAferidos;


    const conclusao =
        totalGeral > 0
            ? Number(
                (
                    (totalAferidos / totalGeral) *
                    100
                ).toFixed(1)
            )
            : 0;


    /*
    |--------------------------------------------------------------------------
    | DADOS DO PARETO
    |--------------------------------------------------------------------------
    | Remove valores zerados e ordena do maior para o menor.
    */
    const dadosPareto = produtos
        .map(item => ({

            sku:
                item.sku ||
                "Sem SKU",

            quantidade:
                Number(item.totalAnualSku || 0)

        }))
        .filter(item =>

            Number.isFinite(item.quantidade) &&
            item.quantidade > 0

        )
        .sort(
            (a,b) =>
                b.quantidade -
                a.quantidade
        );


    /*
    |--------------------------------------------------------------------------
    | ARRAYS DO GRÁFICO
    |--------------------------------------------------------------------------
    */
    const labelsPareto =
        dadosPareto.map(item =>
            String(item.sku)
        );

    const quantidadesPareto =
        dadosPareto.map(item =>
            item.quantidade
        );


    /*
    |--------------------------------------------------------------------------
    | TOTAL DO PARETO
    |--------------------------------------------------------------------------
    */
    const totalPareto =
        quantidadesPareto.reduce(
            (soma,valor) =>
                soma + valor,
            0
        );


    /*
    |--------------------------------------------------------------------------
    | PERCENTUAL ACUMULADO
    |--------------------------------------------------------------------------
    | Exemplo:
    |
    | 1º SKU: 40%
    | 2º SKU: 65%
    | 3º SKU: 82%
    | Último SKU: 100%
    */
    let acumuladoPareto = 0;

    const percentualAcumulado =
        quantidadesPareto.map(valor => {

            acumuladoPareto += valor;

            if(totalPareto <= 0){
                return null;
            }

            return Number(
                (
                    (
                        acumuladoPareto /
                        totalPareto
                    ) *
                    100
                ).toFixed(1)
            );
        });


    /*
    |--------------------------------------------------------------------------
    | CONTEÚDO DA PÁGINA
    |--------------------------------------------------------------------------
    */
    conteudo.innerHTML = `

        <div class="page-title">
            ⏱ ESFIGMOMANÔMETRO
        </div>


        <section class="cards">

            ${card(
                "💰",
                "Total Gasto por GRU",
                moeda(esfig.totalGruInmetro),
                "Valor pago ao Inmetro"
            )}

            ${card(
                "📅",
                "Última Aferição",
                esfig.ultimaAfericao || "-",
                "Data registrada"
            )}

            ${card(
                "📆",
                "Próxima Aferição",
                esfig.proximaAfericao || "-",
                "Previsão"
            )}

            ${card(
                "⏱",
                "Total de Horas",
                numero(esfig.totalHoras),
                "Horas da atividade"
            )}

        </section>


        <section class="grid-3-2">

            <div class="panel esfig-flow">

                <h3>
                    ⏱ Esfigmomanômetro — Fluxo Operacional
                </h3>


                <div class="fluxo">

                    <div class="fluxo-item">

                        <strong>
                            ${numero(totalAguardando)}
                        </strong>

                        <small>
                            Aguardando Desmontagem
                        </small>

                    </div>


                    <div class="fluxo-arrow">
                        →
                    </div>


                    <div class="fluxo-item pink">

                        <strong>
                            ${numero(totalDesmontado)}
                        </strong>

                        <small>
                            Desmontado
                        </small>

                    </div>


                    <div class="fluxo-arrow">
                        →
                    </div>


                    <div class="fluxo-item green">

                        <strong>
                            ${numero(totalAferidos)}
                        </strong>

                        <small>
                            Aferidos / Montagem
                        </small>

                    </div>

                </div>


                <div class="progress-title">
                    Processamento geral
                </div>


                <div class="progress-box">

                    <div
                        class="progress-bar"
                        style="width:${Math.min(conclusao,100)}%"
                    >
                        ${conclusao}% concluído
                    </div>

                </div>


                ${
                    tabelaFixa(
                        [
                            "SKU",
                            "Descrição",
                            "Aguard.",
                            "Desm.",
                            "Afer.",
                            "Status"
                        ],
                        montarLinhasEsfig(produtos),
                        true
                    )
                }

            </div>


            <div class="panel esfig-chart">

                <h3>
                    Total Anual por SKU — Pareto
                </h3>

                <div class="chart-box esfig-large">
                    <canvas id="grafico"></canvas>
                </div>

            </div>

        </section>
    `;


    /*
    |--------------------------------------------------------------------------
    | DESTRÓI O GRÁFICO ANTERIOR
    |--------------------------------------------------------------------------
    */
    if(
        typeof graficoAtual !== "undefined" &&
        graficoAtual
    ){
        graficoAtual.destroy();
        graficoAtual = null;
    }


    /*
    |--------------------------------------------------------------------------
    | LOCALIZA O CANVAS
    |--------------------------------------------------------------------------
    */
    const canvas =
        document.getElementById("grafico");

    if(!canvas){

        console.error(
            "Canvas do gráfico Esfig não encontrado."
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | SEM DADOS PARA O PARETO
    |--------------------------------------------------------------------------
    */
    if(!dadosPareto.length){

        const contexto =
            canvas.getContext("2d");

        contexto.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        contexto.textAlign = "center";
        contexto.textBaseline = "middle";
        contexto.font = "16px Arial";

        contexto.fillText(
            "Não há dados disponíveis para o Pareto.",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | GRÁFICO PARETO
    |--------------------------------------------------------------------------
    */
    graficoAtual = new Chart(
        canvas,
        {

            type:"bar",


            data:{

                labels:labelsPareto,

                datasets:[

                    /*
                    |--------------------------------------------------------------------------
                    | BARRAS
                    |--------------------------------------------------------------------------
                    */
                    {
                        type:"bar",

                        label:"Total de Aferições",

                        data:quantidadesPareto,

                        backgroundColor:"#1d4eff",
                        borderColor:"#1d4eff",

                        borderWidth:1,
                        borderRadius:3,

                        maxBarThickness:60,

                        yAxisID:"y",

                        order:2
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | LINHA ACUMULADA
                    |--------------------------------------------------------------------------
                    */
                    {
                        type:"line",

                        label:"% Acumulado",

                        data:percentualAcumulado,

                        borderColor:"#f04dd8",
                        backgroundColor:"#f04dd8",

                        pointBackgroundColor:"#f04dd8",
                        pointBorderColor:"#ffffff",
                        pointBorderWidth:1,

                        pointRadius:4,
                        pointHoverRadius:6,
                        pointHitRadius:12,

                        borderWidth:2,

                        tension:0.20,

                        fill:false,
                        spanGaps:false,

                        yAxisID:"y1",

                        order:1
                    }

                ]
            },


            options:{

                responsive:true,
                maintainAspectRatio:false,

                layout:{

                    padding:{
                        top:20,
                        right:15,
                        bottom:10,
                        left:5
                    }
                },


                interaction:{
                    mode:"index",
                    intersect:false
                },


                plugins:{

                    /*
                    |--------------------------------------------------------------------------
                    | LEGENDA
                    |--------------------------------------------------------------------------
                    */
                    legend:{

                        display:true,
                        position:"top",

                        labels:{
                            boxWidth:24,
                            padding:16
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | TOOLTIP
                    |--------------------------------------------------------------------------
                    */
                    tooltip:{

                        enabled:true,

                        filter:function(context){

                            return (
                                context.raw !== null &&
                                context.raw !== undefined &&
                                Number(context.raw) !== 0
                            );
                        },

                        callbacks:{

                            label:function(context){

                                if(
                                    context.dataset.label ===
                                    "% Acumulado"
                                ){
                                    return (
                                        "% acumulado: " +
                                        context.raw +
                                        "%"
                                    );
                                }

                                return (
                                    "Total de aferições: " +
                                    numero(context.raw)
                                );
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | RÓTULOS
                    |--------------------------------------------------------------------------
                    | Funciona caso o ChartDataLabels esteja carregado.
                    |--------------------------------------------------------------------------
                    */
                    datalabels:{

                        display:function(context){

                            const valor =
                                context.dataset.data[
                                    context.dataIndex
                                ];

                            return (
                                valor !== null &&
                                valor !== undefined &&
                                Number(valor) !== 0
                            );
                        },


                        formatter:function(valor,context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return `${valor}%`;
                            }

                            return numero(valor);
                        },


                        color:function(context){

                            if(
                                context.dataset.label ===
                                "% Acumulado"
                            ){
                                return "#b51ca8";
                            }

                            return "#1f2937";
                        },


                        anchor:function(context){

                            return (
                                context.dataset.type === "bar"
                                    ? "end"
                                    : "center"
                            );
                        },


                        align:function(context){

                            return (
                                context.dataset.type === "bar"
                                    ? "top"
                                    : "top"
                            );
                        },


                        offset:function(context){

                            return (
                                context.dataset.type === "bar"
                                    ? 2
                                    : 6
                            );
                        },


                        font:{

                            size:11,
                            weight:"bold"
                        }
                    }
                },


                scales:{

                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DOS SKUs
                    |--------------------------------------------------------------------------
                    */
                    x:{

                        grid:{
                            display:false
                        },

                        title:{
                            display:true,
                            text:"SKU"
                        },

                        ticks:{

                            autoSkip:false,

                            maxRotation:45,
                            minRotation:0
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DAS QUANTIDADES
                    |--------------------------------------------------------------------------
                    */
                    y:{

                        beginAtZero:true,

                        position:"left",

                        grid:{
                            color:"rgba(15,31,77,0.08)"
                        },

                        title:{
                            display:true,
                            text:"Total de aferições"
                        },

                        ticks:{

                            precision:0,

                            callback:function(valor){
                                return numero(valor);
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DO PERCENTUAL
                    |--------------------------------------------------------------------------
                    */
                    y1:{

                        beginAtZero:true,

                        min:0,
                        max:100,

                        position:"right",

                        grid:{
                            drawOnChartArea:false
                        },

                        title:{
                            display:true,
                            text:"% Acumulado"
                        },

                        ticks:{

                            stepSize:20,

                            callback:function(valor){
                                return `${valor}%`;
                            }
                        }
                    }
                }
            }
        }
    );
}
