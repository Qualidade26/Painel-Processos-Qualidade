function renderEsfig(){

    const esfig = dados.esfig || {};

    const produtos = [...(esfig.produtos || [])].sort((a,b) => {

        const na = parseInt(a.sku,10);
        const nb = parseInt(b.sku,10);

        if(Number.isNaN(na) && Number.isNaN(nb))
            return String(a.sku).localeCompare(String(b.sku));

        if(Number.isNaN(na))
            return 1;

        if(Number.isNaN(nb))
            return -1;

        return na - nb;
    });

    const totalAguardando =
        produtos.reduce((s,i)=>s+Number(i.aguardando||0),0);

    const totalDesmontado =
        produtos.reduce((s,i)=>s+Number(i.desmontado||0),0);

    const totalAferidos =
        produtos.reduce((s,i)=>s+Number(i.aferidos||0),0);

    const totalGeral =
        totalAguardando +
        totalDesmontado +
        totalAferidos;

    const conclusao =
        totalGeral
            ? ((totalAferidos / totalGeral) * 100).toFixed(1)
            : 0;

    conteudo.innerHTML = `
        <div class="page-title">⏱ ESFIGMOMANÔMETRO</div>

        <section class="cards">
            ${card("💰","Total Gasto por GRU",moeda(esfig.totalGruInmetro),"Valor pago ao Inmetro")}
            ${card("📅","Última Aferição",esfig.ultimaAfericao || "-","Data registrada")}
            ${card("📆","Próxima Aferição",esfig.proximaAfericao || "-","Previsão")}
            ${card("⏱","Total de Horas",numero(esfig.totalHoras),"Horas da atividade")}
        </section>

        <section class="grid-3-2">

            <div class="panel esfig-flow">

                <h3>⏱ Esfigmomanômetro - Fluxo Operacional</h3>

                <div class="fluxo">

                    <div class="fluxo-item">
                        <strong>${numero(totalAguardando)}</strong>
                        <small>Aguardando Desmontagem</small>
                    </div>

                    <div class="fluxo-arrow">→</div>

                    <div class="fluxo-item pink">
                        <strong>${numero(totalDesmontado)}</strong>
                        <small>Desmontado</small>
                    </div>

                    <div class="fluxo-arrow">→</div>

                    <div class="fluxo-item green">
                        <strong>${numero(totalAferidos)}</strong>
                        <small>Aferidos / Montagem</small>
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
                        ["SKU","Descrição","Aguard.","Desm.","Afer.","Status"],
                        montarLinhasEsfig(produtos),
                        true
                    )
                }

            </div>

            <div class="panel esfig-chart">

                <h3>Total Anual por SKU</h3>

                <div class="chart-box esfig-large">
                    <canvas id="grafico"></canvas>
                </div>

            </div>

        </section>
    `;

    graficoAtual = new Chart(
        document.getElementById("grafico"),
        {

            type:"bar",

            data:{
                labels:produtos.map(i => `${i.sku}`),

                datasets:[{
                    label:"Total Anual",

                    data:produtos.map(
                        i => Number(i.totalAnualSku || 0)
                    ),

                    backgroundColor:[
                        "#1d4eff",
                        "#0f3cc9",
                        "#6b7cff",
                        "#f04dd8",
                        "#22c55e",
                        "#38bdf8",
                        "#8b5cf6"
                    ],

                    borderWidth:0
                }]
            },

            options:{
                ...baseOptions(),
                indexAxis:"y",
                layout:{
                    padding:{
                        top:20,
                        right:42,
                        left:8,
                        bottom:4
                    }
                },
                plugins:{
                    legend:{
                        display:false
                    }
                }
            }

        }
    );
}
