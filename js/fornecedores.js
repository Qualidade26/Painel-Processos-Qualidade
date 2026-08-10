
function renderFornecedores(){

    const f = dados.fornecedores || {

        totalFornecedores:0,
        processosAno:0,
        naoConformidades:0,
        reclamacoes:0,
        retrabalhos:0,
        indiceMedio:0,

        selecionado:{
            nome:"Nenhum fornecedor",
            indice:0,
            processos:0,
            naoConformidades:0,
            retrabalhos:0,
            reclamacoes:0,
            skus:0,
            horas:0,
            produtos:0
        }

    };

    conteudo.innerHTML = `

    <div class="page-title">
        🏭 FORNECEDORES
    </div>

    <section class="cards">

        ${card("🏭","Fornecedores",numero(f.totalFornecedores),"Cadastrados")}

        ${card("📦","Processos",numero(f.processosAno),"Processos no ano")}

        ${card("⚠","Não Conformidades",numero(f.naoConformidades),"Total registrado")}

        ${card("💬","Reclamações",numero(f.reclamacoes),"Ocorrências")}

        ${card("🔄","Retrabalhos",numero(f.retrabalhos),"Total registrado")}

        ${card("⭐","Índice Médio",(f.indiceMedio||0)+"%","Avaliação geral")}

    </section>

    <section class="grid-3-2">

        <div class="panel">

            <h3>📊 Top 10 Fornecedores</h3>

            <div class="chart-box">
                <canvas id="graficoFornecedorTop"></canvas>
            </div>

        </div>

        <div class="panel">

            <h3>Fornecedor Selecionado</h3>

            <div class="info-text">

                <p><strong>${f.selecionado.nome}</strong></p>

                <p>⭐ Índice: ${f.selecionado.indice}%</p>

                <p>📦 Processos: ${numero(f.selecionado.processos)}</p>

                <p>⚠ NC: ${numero(f.selecionado.naoConformidades)}</p>

                <p>🔄 Retrabalhos: ${numero(f.selecionado.retrabalhos)}</p>

                <p>💬 Reclamações: ${numero(f.selecionado.reclamacoes)}</p>

                <p>🏷 SKUs: ${numero(f.selecionado.skus)}</p>

                <p>⏱ Horas: ${numero(f.selecionado.horas)}</p>

                <button
                    class="btn"
                    onclick="abrirAnaliseFornecedor()">
                    VER ANÁLISE DETALHADA
                </button>

            </div>

        </div>

    </section>

    <section class="panel">

        <h3>Resumo Geral</h3>

        ${tabelaFixa(

            ["Fornecedor","Processos","NC","Retrabalhos","Índice"],

            `
            <tr>

                <td>${f.selecionado.nome}</td>

                <td>${numero(f.selecionado.processos)}</td>

                <td>${numero(f.selecionado.naoConformidades)}</td>

                <td>${numero(f.selecionado.retrabalhos)}</td>

                <td>${f.selecionado.indice}%</td>

            </tr>
            `,

            false

        )}

    </section>

    `;

    graficoAtual = new Chart(

        document.getElementById("graficoFornecedorTop"),

        {

            type:"bar",

            data:{

                labels:["Fornecedor"],

                datasets:[{

                    label:"NC",

                    data:[f.selecionado.naoConformidades],

                    backgroundColor:"#1d4eff"

                }]

            },

            options:{

                ...baseOptions(),

                indexAxis:"y"

            }

        }

    );

}
