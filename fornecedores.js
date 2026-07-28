function abrirAnaliseFornecedor(){

    const f =
        dados.fornecedores?.selecionado || {};

    conteudo.innerHTML = `

        <div class="page-title">
            📊 ANÁLISE DETALHADA DO FORNECEDOR
        </div>

        <section class="cards">

            ${card(
                "🏭",
                "Fornecedor",
                f.nome || "-",
                "Fornecedor selecionado"
            )}

            ${card(
                "⭐",
                "Índice",
                (f.indice || 0) + "%",
                "Avaliação geral"
            )}

            ${card(
                "📄",
                "Processos",
                numero(f.processos || 0),
                "Total de processos"
            )}

            ${card(
                "⚠",
                "NC",
                numero(f.naoConformidades || 0),
                "Não conformidades"
            )}

        </section>

        <section class="grid-2">

            <div class="panel">

                <h3>
                    Evolução Mensal
                </h3>

                <div class="chart-box">
                    <canvas id="graficoFornecedor"></canvas>
                </div>

            </div>

            <div class="panel">

                <h3>
                    Indicadores
                </h3>

                <div class="rank-grid">

                    <div class="rank-card">
                        <div>
                            Retrabalhos
                            <strong>
                                ${numero(f.retrabalhos || 0)}
                            </strong>
                        </div>
                    </div>

                    <div class="rank-card">
                        <div>
                            Reclamações
                            <strong>
                                ${numero(f.reclamacoes || 0)}
                            </strong>
                        </div>
                    </div>

                    <div class="rank-card">
                        <div>
                            SKUs
                            <strong>
                                ${numero(f.skus || 0)}
                            </strong>
                        </div>
                    </div>

                </div>

            </div>

        </section>

        <div style="margin-top:10px;text-align:center;">

            <button
                class="btn"
                onclick="renderFornecedores()"
            >
                ← Voltar
            </button>

        </div>
    `;

    const historico =
        f.historico || [];

    graficoAtual = new Chart(
        document.getElementById("graficoFornecedor"),
        {

            type:"line",

            data:{

                labels:
                    historico.map(i => i.mes),

                datasets:[{

                    label:"Índice",

                    data:
                        historico.map(i => i.indice),

                    borderColor:"#1d4eff",

                    backgroundColor:"#1d4eff",

                    borderWidth:3,

                    tension:.35

                }]

            },

            options:baseOptions()

        }
    );
}
