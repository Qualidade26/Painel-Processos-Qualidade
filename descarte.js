function renderDescarte(){

    if(!senhaDescarteLiberada){

        conteudo.innerHTML = `
            <div class="senha-box">
                <h2>🔒 Área Restrita - Descarte</h2>

                <p>
                    Digite a senha para acessar as informações.
                </p>

                <input
                    type="password"
                    id="senhaDescarte"
                    placeholder="Digite a senha"
                >

                <button
                    class="btn"
                    onclick="validarSenhaDescarte()"
                >
                    Acessar
                </button>

                <p
                    id="erroSenha"
                    style="color:#ef4444;font-weight:900;"
                ></p>
            </div>
        `;

        return;
    }

    const d = dados.descarte || {
        origens:[],
        top10:[]
    };

    const top = [...(d.top10 || [])]
        .sort((a,b)=>
            Number(b.valor || 0) -
            Number(a.valor || 0)
        );

    conteudo.innerHTML = `
        <div class="page-title">🗑 DESCARTE</div>

        <section class="cards">

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

        <section class="grid-2">

            <div class="panel">

                <h3>📊 Descarte por Origem</h3>

                <div class="chart-box tall">
                    <canvas id="grafico"></canvas>
                </div>

                <h3 style="margin-top:10px;">
                    Top 3 Origens de Destino
                </h3>

                ${rankTop3Origem(d.origens || [])}

            </div>

            <div class="panel">

                <h3>Top 10 Descarte</h3>

                ${
                    tabelaFixa(
                        ["SKU","Descrição","Valor"],
                        montarLinhasTopDescarte(top),
                        true
                    )
                }

            </div>

        </section>
    `;

    graficoAtual = new Chart(
        document.getElementById("grafico"),
        {

            type:"bar",

            data:{
                labels:(d.origens || [])
                    .map(i => i.nome),

                datasets:[{
                    label:"Valor",

                    data:(d.origens || [])
                        .map(i => i.valor),

                    backgroundColor:[
                        "#1d4eff",
                        "#0f3cc9",
                        "#6b7cff",
                        "#f04dd8",
                        "#22c55e",
                        "#38bdf8",
                        "#8b5cf6"
                    ],

                    borderWidth:0,

                    _moeda:true
                }]
            },

            options:{
                ...baseOptions(),
                indexAxis:"y",
                plugins:{
                    legend:{
                        display:false
                    }
                }
            }

        }
    );
}

function validarSenhaDescarte(){

    const senha =
        document.getElementById("senhaDescarte").value;

    if(senha === "SGQ2026"){

        senhaDescarteLiberada = true;
        renderDescarte();

    }else{

        document.getElementById("erroSenha").innerText =
            "Senha incorreta.";
    }
}
