function renderRetrabalho(){

    const r = dados.retrabalho || {
        fabricantes:[]
    };

    conteudo.innerHTML = `
        <div class="page-title">🔄 RETRABALHO</div>

        <section class="cards">
            ${card("🔄","Total Retrabalhado",numero(r.totalUnidades),"Quantidade de produtos")}
            ${card("⏱","Total de Horas",numero(r.totalHoras),"Horas aplicadas")}
            ${card("📋","Processos",numero(r.processos),"Ocorrências registradas")}
        </section>

        <section class="grid-2">

            <div class="panel">

                <h3>🏭 RETRABALHO POR FABRICANTE</h3>

                <div style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    margin-bottom:10px;
                ">

                    <span style="
                        font-size:22px;
                        color:#1d4eff;
                    ">🔍</span>

                    <input
                        id="buscaFabricante"
                        type="search"
                        placeholder="Pesquisar fabricante..."
                        onkeyup="atualizarGraficoRetrabalho()"
                        style="
                            flex:1;
                            padding:10px 14px;
                            border-radius:12px;
                            border:1px solid #b8d1ff;
                            font-size:14px;
                            font-weight:700;
                            outline:none;
                        ">

                </div>

                <div class="chart-box tall">
                    <canvas id="grafico"></canvas>
                </div>

            </div>

            <div class="panel">

                <h3>📋 DETALHAMENTO RETRABALHO</h3>

                ${
                    tabelaFixa(
                        ["Fabricante","Quantidade","Horas","Motivo"],
                        montarLinhasRetrabalho(r.fabricantes),
                        true
                    )
                }

            </div>

        </section>
    `;

    atualizarGraficoRetrabalho();
}

function atualizarGraficoRetrabalho(){

    destruirGrafico();

    const r = dados.retrabalho || {
        fabricantes:[]
    };

    const pesquisa = (
        document.getElementById("buscaFabricante")?.value || ""
    ).toLowerCase();

    const fabricantes = (r.fabricantes || [])
        .filter(f => Number(f.quantidade || 0) > 0)
        .filter(f =>
            String(f.fabricante)
            .toLowerCase()
            .includes(pesquisa)
        )
        .sort((a,b)=>
            Number(b.quantidade) -
            Number(a.quantidade)
        );

    graficoAtual = new Chart(
        document.getElementById("grafico"),
        {

            type:"bar",

            data:{

                labels:
                    fabricantes.map(f => f.fabricante),

                datasets:[{

                    label:"Quantidade Retrabalhada",

                    data:
                        fabricantes.map(
                            f => Number(f.quantidade || 0)
                        ),

                    backgroundColor:
                        fabricantes.map((_, i) => [
                            "#1d4eff",
                            "#0f3cc9",
                            "#6b7cff",
                            "#4f7cff",
                            "#2d62ff",
                            "#5b88ff"
                        ][i % 6]),

                    borderWidth:0,

                    _ocultarZero:true

                }]

            },

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

                plugins:{
                    legend:{
                        display:false
                    }
                },

                onClick:(evt,elements)=>{

                    if(!elements.length)
                        return;

                    const indice =
                        elements[0].index;

                    const fabricante =
                        fabricantes[indice];

                    document.querySelector(
                        ".table-wrap tbody"
                    ).innerHTML =
                        montarLinhasRetrabalho(
                            [fabricante]
                        );
                }

            }

        }
    );
}

function filtrarFabricante(){

    const texto =
        document
        .getElementById("buscaFabricante")
        .value
        .toLowerCase();

    const select =
        document.getElementById("filtroFabricante");

    let primeiro = null;

    Array.from(select.options)
    .forEach(op=>{

        const visivel =
            op.text
            .toLowerCase()
            .includes(texto);

        op.style.display =
            visivel
                ? "block"
                : "none";

        if(visivel && !primeiro){
            primeiro = op;
        }

    });

    if(primeiro){

        select.value = primeiro.value;

        atualizarGraficoRetrabalho();
    }
}
