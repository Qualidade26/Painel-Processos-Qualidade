function renderEsfig(){

    const esfig = dados.esfig || {};

    /*
    |--------------------------------------------------------------------------
    | PRODUTOS DA TABELA
    |--------------------------------------------------------------------------
    | Mantém a tabela organizada pelo número do SKU.
    */
    const produtos = [...(esfig.produtos || [])]
        .sort((a,b) => {

            const na = parseInt(a.sku,10);
            const nb = parseInt(b.sku,10);

            if(
                Number.isNaN(na) &&
                Number.isNaN(nb)
            ){
                return String(a.sku)
                    .localeCompare(String(b.sku));
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
    | DADOS DO GRÁFICO PARETO
    |--------------------------------------------------------------------------
    | Remove valores zerados e ordena do maior para o menor.
    */
    const dadosPareto = produtos
        .map(item => ({
            sku:
                item.sku ||
                "Sem identificação",

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
    | TOTAL GERAL DO PARETO
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
    | PERCENTUAL ACUMULADO CORRETO
    |--------------------------------------------------------------------------
    | Este array contém os percentuais matematicamente corretos:
    |
    | Primeiro SKU: participação acumulada inicial
    | Último SKU: 100%
    */
    let acumulado = 0;

    const percentualAcumuladoCorreto =
        quantidadesPareto.map(valor => {

            acumulado += valor;

            if(totalPareto <= 0){
                return null;
            }

            return Number(
                (
                    (acumulado / totalPareto) *
                    100
                ).toFixed(1)
            );
        });


    /*
    |--------------------------------------------------------------------------
    | POSIÇÃO VISUAL DA LINHA
    |--------------------------------------------------------------------------
    | Como o gráfico horizontal mostra o maior SKU na parte superior,
    | o array é invertido somente para desenhar a linha subindo da
    | parte inferior esquerda para a parte superior direita.
    */
    const percentualLinhaPareto =
        [...percentualAcumuladoCorreto]
            .reverse();


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
                    ⏱ Esfigmomanômetro - Fluxo Operacional
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
                        style="width:${conclusao}%"
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
    | CRIAÇÃO DO GRÁFICO PARETO
    |--------------------------------------------------------------------------
    */
    graficoAtual = new Chart(
        canvas,
        {
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

                        barPercentage:0.75,
                        categoryPercentage:0.80,

                        xAxisID:"x",
                        order:2
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | LINHA ROSA
                    |--------------------------------------------------------------------------
                    */
                    {
                        type:"line",

                        label:"% Acumulado",

                        /*
                        |--------------------------------------------------------------------------
                        | Usa os percentuais invertidos somente para o desenho.
                        |--------------------------------------------------------------------------
                        */
                        data:percentualLinhaPareto,

                        borderColor:"#f04dd8",
                        backgroundColor:"#f04dd8",

                        pointBackgroundColor:"#f04dd8",
                        pointBorderColor:"#ffffff",
                        pointBorderWidth:1,

                        pointRadius:4,
                        pointHoverRadius:6,
                        pointHitRadius:10,

                        borderWidth:2,
                        tension:0.25,

                        fill:false,
                        spanGaps:false,

                        xAxisID:"x1",
                        order:1
                    }

                ]
            },


            options:{

                responsive:true,
                maintainAspectRatio:false,

                /*
                |--------------------------------------------------------------------------
                | TRANSFORMA O GRÁFICO EM HORIZONTAL
                |--------------------------------------------------------------------------
                */
                indexAxis:"y",

                layout:{
                    padding:{
                        top:15,
                        right:30,
                        bottom:8,
                        left:8
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
                            usePointStyle:false,
                            boxWidth:22,
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

                                    /*
                                    |--------------------------------------------------------------------------
                                    | Mostra o percentual correto correspondente ao SKU.
                                    |--------------------------------------------------------------------------
                                    */
                                    const percentualCorreto =
                                        percentualAcumuladoCorreto[
                                            context.dataIndex
                                        ];

                                    return (
                                        `% acumulado: ` +
                                        `${percentualCorreto}%`
                                    );
                                }

                                return (
                                    `Total de aferições: ` +
                                    `${numero(context.raw)}`
                                );
                            }
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | RÓTULOS SOBRE O GRÁFICO
                    |--------------------------------------------------------------------------
                    | Funciona caso ChartDataLabels esteja instalado.
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

                                const percentualCorreto =
                                    percentualAcumuladoCorreto[
                                        context.dataIndex
                                    ];

                                return `${percentualCorreto}%`;
                            }

                            return numero(valor);
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
                                    ? "right"
                                    : "top"
                            );
                        },

                        offset:4
                    }
                },


                scales:{

                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DOS SKUs
                    |--------------------------------------------------------------------------
                    */
                    y:{

                        grid:{
                            display:false
                        },

                        title:{
                            display:true,
                            text:"SKU"
                        },

                        ticks:{
                            autoSkip:false
                        }
                    },


                    /*
                    |--------------------------------------------------------------------------
                    | EIXO DAS QUANTIDADES
                    |--------------------------------------------------------------------------
                    */
                    x:{

                        beginAtZero:true,
                        position:"bottom",

                        grid:{
                            color:"rgba(15,31,77,.08)"
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
                    x1:{

                        beginAtZero:true,
                        min:0,
                        max:100,

                        position:"top",

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
