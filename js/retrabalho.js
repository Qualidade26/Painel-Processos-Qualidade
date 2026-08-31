/* ==========================================================
   CONTROLE DAS ABAS — RETRABALHO
========================================================== */

let abaInternaRetrabalho = "retrabalho";

let graficoAdequacaoStatus = null;
let graficoAdequacaoMotivos = null;


/* ==========================================================
   PÁGINA PRINCIPAL
========================================================== */

function renderRetrabalho(){

    conteudo.innerHTML = `

        <div class="pagina-retrabalho">

            <div class="retrabalho-abas">

                <button
                    type="button"
                    id="botaoAbaRetrabalho"
                    class="retrabalho-aba"
                    onclick="abrirAbaInternaRetrabalho('retrabalho')"
                >
                    <span class="retrabalho-aba-icone">🔄</span>
                    RETRABALHO
                </button>

                <button
                    type="button"
                    id="botaoAbaAdequacao"
                    class="retrabalho-aba"
                    onclick="abrirAbaInternaRetrabalho('adequacao')"
                >
                    <span class="retrabalho-aba-icone">📦</span>
                    ADEQUAÇÃO DE CAIXA
                </button>

            </div>

            <div id="conteudoInternoRetrabalho"></div>

        </div>
    `;

    abrirAbaInternaRetrabalho(
        abaInternaRetrabalho
    );
}


/* ==========================================================
   TROCA ENTRE AS ABAS
========================================================== */

function abrirAbaInternaRetrabalho(aba){

    abaInternaRetrabalho = aba;

    destruirGraficosInternosRetrabalho();

    const botaoRetrabalho =
        document.getElementById(
            "botaoAbaRetrabalho"
        );

    const botaoAdequacao =
        document.getElementById(
            "botaoAbaAdequacao"
        );

    if(botaoRetrabalho){

        botaoRetrabalho.classList.toggle(
            "ativa",
            aba === "retrabalho"
        );
    }

    if(botaoAdequacao){

        botaoAdequacao.classList.toggle(
            "ativa",
            aba === "adequacao"
        );
    }

    if(aba === "adequacao"){

        renderAdequacaoCaixa();

    }else{

        renderRetrabalhoNormal();
    }
}


/* ==========================================================
   DESTRUIR GRÁFICOS
========================================================== */

function destruirGraficosInternosRetrabalho(){

    if(
        typeof destruirGrafico === "function"
    ){

        destruirGrafico();
    }

    if(graficoAdequacaoStatus){

        graficoAdequacaoStatus.destroy();

        graficoAdequacaoStatus = null;
    }

    if(graficoAdequacaoMotivos){

        graficoAdequacaoMotivos.destroy();

        graficoAdequacaoMotivos = null;
    }
}


/* ==========================================================
   ABA — RETRABALHO NORMAL
========================================================== */

function renderRetrabalhoNormal(){

    const r =
        dados.retrabalho || {
            totalUnidades:0,
            totalHoras:0,
            processos:0,
            fabricantes:[]
        };

    const area =
        document.getElementById(
            "conteudoInternoRetrabalho"
        );

    if(!area){
        return;
    }

    area.innerHTML = `

        <div class="retrabalho-conteudo-aba animar">

            <div class="page-title">
                🔄 RETRABALHO
            </div>

            <section class="cards">

                ${card(
                    "🔄",
                    "Total Retrabalhado",
                    numero(r.totalUnidades),
                    "Quantidade de produtos"
                )}

                ${card(
                    "⏱",
                    "Total de Horas",
                    numero(r.totalHoras),
                    "Horas aplicadas"
                )}

                ${card(
                    "📋",
                    "Processos",
                    numero(r.processos),
                    "Ocorrências registradas"
                )}

            </section>

            <section class="grid-2">

                <div class="panel">

                    <h3>
                        🏭 RETRABALHO POR FABRICANTE
                    </h3>

                    <div class="retrabalho-filtros">

                        <span style="
                            font-size:22px;
                            color:#1d4eff;
                        ">
                            🔍
                        </span>

                        <input
                            id="buscaFabricante"
                            type="search"
                            placeholder="Pesquisar fabricante..."
                            oninput="atualizarGraficoRetrabalho()"
                        >

                    </div>

                    <div class="chart-box tall">

                        <canvas id="grafico"></canvas>

                    </div>

                </div>

                <div class="panel">

                    <h3>
                        📋 DETALHAMENTO RETRABALHO
                    </h3>

                    <div id="tabelaDetalhamentoRetrabalho">

                        ${
                            tabelaFixa(
                                [
                                    "Fabricante",
                                    "Quantidade",
                                    "Horas",
                                    "Motivo"
                                ],
                               montarLinhasRetrabalho(
    (
        Array.isArray(r.fabricantes)
            ? [...r.fabricantes]
            : []
    )
    .sort(
        (a,b) =>
            Number(b.quantidade || 0) -
            Number(a.quantidade || 0)
    )
),
                                true
                            )
                        }

                    </div>

                </div>

            </section>

        </div>
    `;

    atualizarGraficoRetrabalho();
}


/* ==========================================================
   GRÁFICO — RETRABALHO NORMAL
========================================================== */

function atualizarGraficoRetrabalho(){

    destruirGrafico();

    const canvas =
        document.getElementById(
            "grafico"
        );

    if(!canvas){
        return;
    }


    /* ======================================================
       DADOS
    ====================================================== */

    const r =
        dados.retrabalho || {
            fabricantes:[]
        };


    /* ======================================================
       PESQUISA
    ====================================================== */

    const pesquisa =
        String(
            document
                .getElementById(
                    "buscaFabricante"
                )
                ?.value || ""
        )
        .trim()
        .toLowerCase();


    /* ======================================================
       FABRICANTES
       - Remove quantidade zero
       - Aplica pesquisa
       - Ordena da maior para a menor quantidade
    ====================================================== */

    const fabricantes =
        (
            Array.isArray(r.fabricantes)
                ? [...r.fabricantes]
                : []
        )

        .filter(
            fabricante =>
                Number(
                    fabricante.quantidade || 0
                ) > 0
        )

        .filter(
            fabricante =>
                String(
                    fabricante.fabricante || ""
                )
                .toLowerCase()
                .includes(pesquisa)
        )

        .sort(
            (a,b) =>
                Number(
                    b.quantidade || 0
                ) -
                Number(
                    a.quantidade || 0
                )
        );

/* ======================================================
   CORES — PADRÃO DO PAINEL / IMPORTAÇÃO
====================================================== */

const cores = [
    "#1d4eff", // azul
   "#22c55e", // verde
    "#6b7cff", // violeta azulado
    "#f04dd8", // rosa
     "#0f3cc9", // azul escuro
    "#38bdf8", // azul claro
    "#8b5cf6"  // roxo
];

    /* ======================================================
       CRIAR GRÁFICO
    ====================================================== */

    graficoAtual =
        new Chart(
            canvas,
            {

                type:"bar",

                data:{

                    labels:
                        fabricantes.map(
                            fabricante =>
                                fabricante.fabricante
                        ),

                    datasets:[{

                        label:
                            "Quantidade Retrabalhada",

                        data:
                            fabricantes.map(
                                fabricante =>
                                    Number(
                                        fabricante.quantidade || 0
                                    )
                            ),

                        backgroundColor:
                            fabricantes.map(
                                (_,indice) =>
                                    cores[
                                        indice % cores.length
                                    ]
                            ),

                        borderWidth:0,

                        borderRadius:4,

                        _ocultarZero:true

                    }]

                },


                /* ==================================================
                   OPÇÕES
                ================================================== */

                options:{

                    ...baseOptions(),

                    indexAxis:"y",

                    layout:{

                        padding:{

                            top:20,
                            right:45,
                            left:8,
                            bottom:4

                        }

                    },


                    /* ==============================================
                       PLUGINS
                    ============================================== */

                    plugins:{

                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:false
                        }

                    },


                    /* ==============================================
                       CLIQUE NO FABRICANTE
                    ============================================== */

                    onClick:(evento,elementos)=>{

                        if(!elementos.length){
                            return;
                        }

                        const indice =
                            elementos[0].index;

                        const fabricante =
                            fabricantes[indice];

                        const corpoTabela =
                            document.querySelector(
                                "#tabelaDetalhamentoRetrabalho .table-wrap tbody"
                            );

                        if(corpoTabela){

                            corpoTabela.innerHTML =
                                montarLinhasRetrabalho(
                                    [fabricante]
                                );

                        }

                    }

                }

            }
        );
}

/* ==========================================================
   ABA — ADEQUAÇÃO DE CAIXA
========================================================== */

function renderAdequacaoCaixa(){

    const a =
        dados.adequacaocaixa || {

            totalocorrenciasano:0,
            quantidaderetrabalhada:0,
            totalhoras:0,

            indicadores:{

                bom:{
                    valor:0,
                    percentual:0
                },

                avaria:{
                    valor:0,
                    percentual:0
                }
            },

            motivos:[],
            fabricantes:[]
        };

    const area =
        document.getElementById(
            "conteudoInternoRetrabalho"
        );

    if(!area){
        return;
    }

    const valorBom =
        Number(
            a.indicadores?.bom?.valor || 0
        );

    const valorAvaria =
        Number(
            a.indicadores?.avaria?.valor || 0
        );

    const valorTotal =
        valorBom + valorAvaria;

    area.innerHTML = `

        <div class="retrabalho-conteudo-aba animar">

            <div class="page-title">
                📦 ADEQUAÇÃO DE CAIXA
            </div>

            <section class="adequacao-indicadores">

                ${card(
                    "📦",
                    "Quantidade Retrabalhada",
                    numero(
                        a.quantidaderetrabalhada
                    ),
                    "Unidades adequadas"
                )}

                ${card(
                    "⏱",
                    "Total de Horas",
                    numero(a.totalhoras),
                    "Horas aplicadas"
                )}

                ${card(
                    "📋",
                    "Ocorrências no Ano",
                    numero(
                        a.totalocorrenciasano
                    ),
                    "Ocorrências registradas"
                )}

                ${card(
                    "💰",
                    "Valor Analisado",
                    moeda(valorTotal),
                    "Bom + avaria"
                )}

            </section>

            <section class="adequacao-grid">

                <div class="adequacao-coluna-graficos">

                    <div
                        class="
                            panel
                            adequacao-panel
                            adequacao-panel-bom-avaria
                        "
                    >

                        <h3>
                            📊 BOM × AVARIA
                        </h3>

                        <div
                            class="
                                adequacao-bom-avaria-conteudo
                            "
                        >

                            <div class="adequacao-chart-box">

                                <canvas
                                    id="graficoAdequacaoStatus"
                                ></canvas>

                            </div>

                            <div class="adequacao-legenda">

                                <div
                                    class="
                                        adequacao-legenda-item
                                    "
                                >

                                    <span
                                        class="
                                            adequacao-legenda-cor
                                            bom
                                        "
                                    ></span>

                                    <span
                                        class="
                                            adequacao-legenda-nome
                                        "
                                    >
                                        Bom
                                    </span>

                                    <span
                                        class="
                                            adequacao-legenda-valor
                                        "
                                    >
                                       ${moeda(valorBom)}
(${formatarPercentualAdequacao(
    a.indicadores?.bom?.percentual
)})
                                    </span>

                                </div>

                                <div
                                    class="
                                        adequacao-legenda-item
                                    "
                                >

                                    <span
                                        class="
                                            adequacao-legenda-cor
                                            avaria
                                        "
                                    ></span>

                                    <span
                                        class="
                                            adequacao-legenda-nome
                                        "
                                    >
                                        Avaria
                                    </span>

                                    <span
                                        class="
                                            adequacao-legenda-valor
                                        "
                                    >
                                      ${moeda(valorAvaria)}
(${formatarPercentualAdequacao(
    a.indicadores?.avaria?.percentual
)})
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div
                        class="
                            panel
                            adequacao-panel
                            adequacao-panel-motivos
                        "
                    >

                        <h3>
                            📋 ADEQUAÇÃO POR MOTIVO
                        </h3>

                        <div
                            class="
                                adequacao-chart-box-motivos
                            "
                        >

                            <canvas
                                id="graficoAdequacaoMotivos"
                            ></canvas>

                        </div>

                    </div>

                </div>

                <div
                    class="
                        panel
                        adequacao-panel
                        adequacao-panel-tabela
                    "
                >

                    <h3>
                        🏭 DETALHAMENTO POR FABRICANTE
                    </h3>

                    <div class="adequacao-pesquisa">

                        <span
                            class="
                                adequacao-pesquisa-icone
                            "
                        >
                            🔍
                        </span>

                        <input
                            id="buscaFabricanteAdequacao"
                            type="search"
                            placeholder="Pesquisar fabricante..."
                            oninput="filtrarTabelaAdequacao()"
                        >

                    </div>

                    <div class="adequacao-tabela">

                        <div class="adequacao-tabela-scroll">

                            <table>

                                <thead>

                                    <tr>

                                        <th>Fabricante</th>

                                        <th>Quantidade</th>

                                        <th>Horas</th>

                                        <th>Motivo</th>

                                    </tr>

                                </thead>

                                <tbody id="corpoTabelaAdequacao">

                                    ${
                                        montarLinhasAdequacao(
                                            a.fabricantes || []
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    `;

    criarGraficoAdequacaoStatus(a);

    criarGraficoAdequacaoMotivos(a);
}


/* ==========================================================
   FORMATAR PERCENTUAL
========================================================== */

function formatarPercentualAdequacao(valor){

    let percentual =
        Number(valor || 0);

    if(percentual <= 1){

        percentual =
            percentual * 100;
    }

    return (
        percentual.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits:0,
                maximumFractionDigits:1
            }
        ) + "%"
    );
}


/* ==========================================================
   TABELA — ADEQUAÇÃO
========================================================== */

function montarLinhasAdequacao(fabricantes){

    const lista =
        Array.isArray(fabricantes)
            ? [...fabricantes].sort(
                (a, b) =>
                    Number(b.quantidade || 0) -
                    Number(a.quantidade || 0)
            )
            : [];

    if(!lista.length){

        return `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:20px;
                    "
                >
                    Nenhum fabricante cadastrado.
                </td>

            </tr>
        `;
    }

    return lista.map(

        fabricante => {

            const nome =
                fabricante.fabricante ||
                "Sem fabricante";

            const quantidade =
                Number(
                    fabricante.quantidade || 0
                );

            const horas =
                Number(
                    fabricante.horas || 0
                );

            const motivo =
                String(
                    fabricante.motivo || ""
                ).trim() || "-";

            return `

                <tr
                    data-fabricante="${
                        String(nome)
                        .toLowerCase()
                    }"
                >

                    <td>${nome}</td>

                    <td>
                        ${numero(quantidade)}
                    </td>

                    <td>
                        ${numero(horas)}
                    </td>

                    <td class="adequacao-tabela-motivo">
                        ${motivo}
                    </td>

                </tr>
            `;
        }

    ).join("");
}


/* ==========================================================
   FILTRO DA TABELA — ADEQUAÇÃO
========================================================== */

function filtrarTabelaAdequacao(){

    const pesquisa =
        String(
            document
            .getElementById(
                "buscaFabricanteAdequacao"
            )
            ?.value || ""
        )
        .trim()
        .toLowerCase();

    const linhas =
        document.querySelectorAll(
            "#corpoTabelaAdequacao tr"
        );

    linhas.forEach(

        linha => {

            const fabricante =
                linha.dataset.fabricante ||
                linha.textContent
                .toLowerCase();

            linha.style.display =
                fabricante.includes(pesquisa)
                    ? ""
                    : "none";
        }

    );
}
/* ==========================================================
   GRÁFICO — BOM X AVARIA
========================================================== */

function criarGraficoAdequacaoStatus(a){

    const canvas =
        document.getElementById(
            "graficoAdequacaoStatus"
        );

    if(!canvas){
        return;
    }


    /* ======================================================
       DESTRUIR GRÁFICO ANTERIOR
    ====================================================== */

    if(graficoAdequacaoStatus){

        graficoAdequacaoStatus.destroy();

        graficoAdequacaoStatus = null;
    }


    /* ======================================================
       DADOS
    ====================================================== */

    const valorBom =
        Number(
            a.indicadores?.bom?.valor || 0
        );

    const valorAvaria =
        Number(
            a.indicadores?.avaria?.valor || 0
        );

    const total =
        valorBom + valorAvaria;

    const percentualBom =
        total > 0
            ? (valorBom / total) * 100
            : 0;

    const percentualAvaria =
        total > 0
            ? (valorAvaria / total) * 100
            : 0;


   /* ======================================================
   TEXTO CENTRAL — LIMPA O PLUGIN GLOBAL E ESCREVE 98%
====================================================== */

const textoCentroAdequacao = {

    id:"textoCentroAdequacao",

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

        const arco =
            meta.data[0];

        const ctx =
            chart.ctx;

        const centroX =
            arco.x;

        const centroY =
            arco.y;

        const raioInterno =
            arco.innerRadius;


        ctx.save();


        /* limpa qualquer texto criado pelo tema global */

        ctx.beginPath();

        ctx.arc(
            centroX,
            centroY,
            raioInterno - 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();


        /* percentual central */

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillStyle =
            "#111827";

        ctx.font =
            "800 22px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            `${Math.round(percentualBom)}%`,
            centroX,
            centroY - 6
        );


        /* texto BOM */

        ctx.fillStyle =
            "#334155";

        ctx.font =
            "700 9px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "BOM",
            centroX,
            centroY + 15
        );

        ctx.restore();
    }
};


    /* ======================================================
       LINHA E RÓTULO EXTERNO — AVARIA
    ====================================================== */

    const rotuloAvariaAdequacao = {

        id:"rotuloAvariaAdequacao",

        afterDatasetsDraw(chart){

            const meta =
                chart.getDatasetMeta(0);

            if(
                !meta ||
                !meta.data ||
                !meta.data[0]
            ){
                return;
            }


            /*
                Como AVARIA é o primeiro valor do dataset,
                utilizamos o arco de índice zero.
            */

            const arcoAvaria =
                meta.data[0];

            const ctx =
                chart.ctx;

            const chartArea =
                chart.chartArea;


            /* ângulo central da fatia vermelha */

            const angulo =
                (
                    arcoAvaria.startAngle +
                    arcoAvaria.endAngle
                ) / 2;


            /* início da linha na fatia */

            const inicioX =
                arcoAvaria.x +
                Math.cos(angulo) *
                (
                    arcoAvaria.outerRadius - 2
                );

            const inicioY =
                arcoAvaria.y +
                Math.sin(angulo) *
                (
                    arcoAvaria.outerRadius - 2
                );


            /* pequeno avanço para fora da pizza */

            const cotoveloX =
                arcoAvaria.x +
                Math.cos(angulo) *
                (
                    arcoAvaria.outerRadius + 13
                );

            const cotoveloY =
                arcoAvaria.y +
                Math.sin(angulo) *
                (
                    arcoAvaria.outerRadius + 13
                );


            /*
                Posição final do rótulo.

                O Math.min impede que o texto saia
                para fora da área do canvas.
            */

            const finalX =
                Math.min(
                    cotoveloX + 18,
                    chartArea.right - 46
                );

            const finalY =
                cotoveloY - 18;


            ctx.save();


            /* linha indicativa */

            ctx.beginPath();

            ctx.moveTo(
                inicioX,
                inicioY
            );

            ctx.lineTo(
                cotoveloX,
                cotoveloY
            );

            ctx.lineTo(
                finalX,
                finalY
            );

            ctx.strokeStyle =
                "#ef4444";

            ctx.lineWidth =
                1.5;

            ctx.lineCap =
                "round";

            ctx.lineJoin =
                "round";

            ctx.stroke();


            /* percentual 2% */

            ctx.textAlign =
                "left";

            ctx.textBaseline =
                "bottom";

            ctx.fillStyle =
                "#ef4444";

            ctx.font =
                "800 17px 'Segoe UI', Arial, sans-serif";

            ctx.fillText(
                `${Math.round(percentualAvaria)}%`,
                finalX + 5,
                finalY - 18
            );


            /* texto AVARIA */

            ctx.textBaseline =
                "top";

            ctx.fillStyle =
                "#475569";

            ctx.font =
                "700 8px 'Segoe UI', Arial, sans-serif";

            ctx.fillText(
                "AVARIA",
                finalX + 5,
                finalY - 12
            );

            ctx.restore();
        }
    };


    /* ======================================================
       CRIAÇÃO DO GRÁFICO
    ====================================================== */

    graficoAdequacaoStatus =
        new Chart(
            canvas,
            {

                type:"doughnut",

                data:{

                    /*
                        AVARIA deve continuar primeiro,
                        pois o rótulo externo utiliza
                        o arco de índice zero.
                    */

                    labels:[
                        "Avaria",
                        "Bom"
                    ],

                    datasets:[{

                        data:[
                            valorAvaria,
                            valorBom
                        ],

                        backgroundColor:[
                            "#ef4444",
                            "#2855d9"
                        ],

                        borderColor:[
                            "#ffffff",
                            "#ffffff"
                        ],

                        borderWidth:2,

                        hoverOffset:0,

                        spacing:0,

                        _ocultarZero:true,
                        _ocultarRotulos:true,

                        mostrarTextoCentro:false,
                        mostrarValorCentro:false,
                        mostrarPercentualCentro:false

                    }]
                },


                /* plugins exclusivos deste gráfico */

                plugins:[

                    textoCentroAdequacao,

                    rotuloAvariaAdequacao

                ],


                options:{

                    responsive:true,

                    maintainAspectRatio:false,


                    /*
                        Espessura semelhante à imagem.
                    */

                    cutout:"57%",


                    /*
                        Posiciona a fatia vermelha
                        na região superior direita.
                    */

                    rotation:38,

                    circumference:360,


                    animation:{

                        duration:600,

                        easing:"easeOutQuart"
                    },


                    /*
                        Espaço superior e direito para
                        a linha e o texto da avaria.
                    */

                    layout:{

                        padding:{

                            top:34,
                            right:72,
                            bottom:12,
                            left:12
                        }
                    },


                    plugins:{

                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:false
                        },

                        tooltip:{

                            callbacks:{

                                label(context){

                                    const valor =
                                        Number(
                                            context.raw || 0
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
                                        " (" +
                                        percentual.toLocaleString(
                                            "pt-BR",
                                            {
                                                minimumFractionDigits:0,
                                                maximumFractionDigits:1
                                            }
                                        ) +
                                        "%)"
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );
}
/* ==========================================================
   GRÁFICO — ADEQUAÇÃO POR MOTIVO
========================================================== */

function criarGraficoAdequacaoMotivos(a){

    const canvas =
        document.getElementById(
            "graficoAdequacaoMotivos"
        );

    if(!canvas){
        return;
    }


    /* ======================================================
       DADOS
    ====================================================== */

    const motivos =
        Array.isArray(a.motivos)
            ? [...a.motivos]
            : [];


    /* ======================================================
       ORDENAR — MAIOR PARA MENOR
    ====================================================== */

    motivos.sort(
        (a,b) =>
            Number(b.valor || 0) -
            Number(a.valor || 0)
    );


    /* ======================================================
       CORES — PADRÃO COLORIDO DO PAINEL
    ====================================================== */

    const cores = [

        "#1d4eff", // Azul
        "#f04dd8", // Rosa
        "#22c55e", // Verde
        "#f59e0b", // Laranja
        "#8b5cf6", // Roxo
        "#38bdf8", // Azul claro
        "#ef4444"  // Vermelho

    ];


    /* ======================================================
       CRIAR GRÁFICO
    ====================================================== */

    graficoAdequacaoMotivos =
        new Chart(
            canvas,
            {

                type:"bar",

                data:{

                    labels:
                        motivos.map(
                            motivo =>
                                motivo.nome
                        ),

                    datasets:[{

                        label:"Valor",

                        data:
                            motivos.map(
                                motivo =>
                                    Number(
                                        motivo.valor || 0
                                    )
                            ),


                        /* ==========================================
                           COR INDIVIDUAL POR MOTIVO
                        ========================================== */

                        backgroundColor:
                            motivos.map(
                                (_,indice) =>
                                    cores[
                                        indice % cores.length
                                    ]
                            ),

                        borderColor:
                            motivos.map(
                                (_,indice) =>
                                    cores[
                                        indice % cores.length
                                    ]
                            ),

                        borderWidth:0,

                        borderRadius:4,

                        borderSkipped:false

                    }]

                },


                /* ==================================================
                   OPÇÕES
                ================================================== */

                options:{

                    ...baseOptions(),

                    indexAxis:"y",

                    responsive:true,

                    maintainAspectRatio:false,


                    /* ==============================================
                       ESPAÇAMENTO
                    ============================================== */

                    layout:{

                        padding:{

                            top:8,
                            right:65,
                            left:5,
                            bottom:5

                        }

                    },


                    /* ==============================================
                       PLUGINS
                    ============================================== */

                    plugins:{

                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:false
                        },

                        tooltip:{

                            displayColors:true,

                            callbacks:{

                                label(context){

                                    const motivo =
                                        motivos[
                                            context.dataIndex
                                        ];

                                    return (
                                        moeda(
                                            context.raw
                                        ) +
                                        " - " +
                                        formatarPercentualAdequacao(
                                            motivo.percentual
                                        )
                                    );

                                }

                            }

                        }

                    },


                    /* ==============================================
                       ESCALAS
                    ============================================== */

                    scales:{


                        /* ==========================================
                           EIXO X — VALORES
                        ========================================== */

                        x:{

                            beginAtZero:true,

                            grid:{

                                color:
                                    "rgba(148,163,184,.22)"

                            },

                            border:{
                                display:false
                            },

                            ticks:{

                                color:"#334155",

                                font:{

                                    size:10,
                                    weight:"600"

                                },

                                callback:value =>
                                    Number(value)
                                        .toLocaleString(
                                            "pt-BR"
                                        )

                            }

                        },


                        /* ==========================================
                           EIXO Y — MOTIVOS
                        ========================================== */

                        y:{

                            grid:{
                                display:false
                            },

                            border:{
                                display:false
                            },

                            ticks:{

                                color:"#334155",

                                padding:6,

                                font:{

                                    size:10,
                                    weight:"700"

                                }

                            }

                        }

                    }

                }

            }
        );
}
/* ==========================================================
   COMPATIBILIDADE COM FUNÇÃO ANTIGA
========================================================== */

function filtrarFabricante(){

    atualizarGraficoRetrabalho();
}
