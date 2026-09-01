/* ==========================================================
   RELATÓRIOS SGQ
========================================================== */

function renderRelatorios(){

    const conteudo =
        document.getElementById("conteudo");

    if(!conteudo){
        return;
    }


    conteudo.innerHTML = `

        <section class="pagina-relatorios">

            <div class="relatorios-cabecalho">

                <div>
                    <h2>
                        📄 Relatórios SGQ
                    </h2>

                    <p>
                        Fechamento mensal e relatório anual
                    </p>
                </div>

            </div>


            <div class="relatorios-controles">

                <div class="relatorios-tipo">

                    <button
                        type="button"
                        class="relatorio-tipo-btn ativo"
                        data-tipo="mensal"
                    >
                        Fechamento Mensal
                    </button>

                    <button
                        type="button"
                        class="relatorio-tipo-btn"
                        data-tipo="anual"
                    >
                        Relatório Anual
                    </button>

                </div>


                <div class="relatorios-filtros">

                    <label>

                        <span>
                            Escopo
                        </span>

                        <select id="relatorioEscopo">

                            <option value="geral">
                                Geral SGQ
                            </option>

                            <option value="importacao">
                                Importação
                            </option>

                            <option value="esfig">
                                ESFIG
                            </option>

                            <option value="descarte">
                                Descarte
                            </option>

                            <option value="amostras">
                                Amostras
                            </option>

                            <option value="retrabalho">
                                Retrabalho
                            </option>

                            <option value="fornecedores">
                                Fornecedores
                            </option>

                        </select>

                    </label>


                    <label>

                        <span>
                            Ano
                        </span>

                        <select id="relatorioAno">

                            <option value="2026">
                                2026
                            </option>

                        </select>

                    </label>


                    <label
                        id="campoRelatorioMes"
                    >

                        <span>
                            Mês
                        </span>

                        <select id="relatorioMes">

                            <option value="01">
                                Janeiro
                            </option>

                            <option value="02">
                                Fevereiro
                            </option>

                            <option value="03">
                                Março
                            </option>

                            <option value="04">
                                Abril
                            </option>

                            <option value="05">
                                Maio
                            </option>

                            <option value="06">
                                Junho
                            </option>

                            <option value="07">
                                Julho
                            </option>

                            <option value="08" selected>
                                Agosto
                            </option>

                            <option value="09">
                                Setembro
                            </option>

                            <option value="10">
                                Outubro
                            </option>

                            <option value="11">
                                Novembro
                            </option>

                            <option value="12">
                                Dezembro
                            </option>

                        </select>

                    </label>


                    <button
                        type="button"
                        id="btnGerarRelatorio"
                        class="btn-gerar-relatorio"
                    >
                        Visualizar Relatório
                    </button>

                </div>

            </div>


            <div
                id="relatorioAviso"
                class="relatorio-aviso"
            >
                Selecione o período e clique em
                <strong>Visualizar Relatório</strong>.
            </div>


            <div
                id="relatorioPreview"
                class="relatorio-preview"
            ></div>

        </section>
    `;


    iniciarEventosRelatorios();
}


/* ==========================================================
   ESTADO
========================================================== */

let tipoRelatorioAtual = "mensal";


/* ==========================================================
   EVENTOS
========================================================== */

function iniciarEventosRelatorios(){

    const botoesTipo =
        document.querySelectorAll(
            ".relatorio-tipo-btn"
        );

    const campoMes =
        document.getElementById(
            "campoRelatorioMes"
        );

    const btnGerar =
        document.getElementById(
            "btnGerarRelatorio"
        );


    botoesTipo.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                botoesTipo.forEach(item => {

                    item.classList.remove(
                        "ativo"
                    );
                });


                botao.classList.add(
                    "ativo"
                );


                tipoRelatorioAtual =
                    botao.dataset.tipo;


                if(campoMes){

                    campoMes.style.display =
                        tipoRelatorioAtual ===
                        "mensal"
                            ? ""
                            : "none";
                }


                limparPreviewRelatorio();
            }
        );
    });


    if(btnGerar){

        btnGerar.addEventListener(
            "click",
            gerarRelatorioSelecionado
        );
    }
}


/* ==========================================================
   GERAR RELATÓRIO
========================================================== */
async function gerarRelatorioSelecionado(){

    const ano =
        document.getElementById(
            "relatorioAno"
        )?.value;

    const mes =
        document.getElementById(
            "relatorioMes"
        )?.value;

    const escopo =
        document.getElementById(
            "relatorioEscopo"
        )?.value || "geral";


    const aviso =
        document.getElementById(
            "relatorioAviso"
        );

    const preview =
        document.getElementById(
            "relatorioPreview"
        );


    if(!ano || !preview){
        return;
    }


    if(aviso){

        aviso.innerHTML =
            "Carregando e comparando os dados...";
    }


    try{

        /* ==================================================
           RELATÓRIO MENSAL
           CONGELADO X ATUAL
        ================================================== */

        if(
            tipoRelatorioAtual ===
            "mensal"
        ){
const caminhoCongelado =
    `Fechamento/fechamento-${ano}/${mes}.json`;


            const [
                respostaCongelado,
                respostaAtual
            ] =
                await Promise.all([

                    fetch(
                        caminhoCongelado,
                        {
                            cache:"no-store"
                        }
                    ),

                    fetch(
                        "data.json",
                        {
                            cache:"no-store"
                        }
                    )

                ]);


            if(!respostaCongelado.ok){

                throw new Error(
                    `Fechamento não encontrado: ${caminhoCongelado}`
                );
            }


            if(!respostaAtual.ok){

                throw new Error(
                    "Não foi possível carregar data.json"
                );
            }


            const dadosCongelados =
                await respostaCongelado.json();


            const dadosAtuais =
                await respostaAtual.json();


            montarPreviewRelatorio(
                dadosCongelados,
                {
                    tipo:"mensal",
                    ano,
                    mes,
                    escopo,
                    dadosAtuais
                }
            );


        /* ==================================================
           RELATÓRIO ANUAL
        ================================================== */

        }else{

            const caminhoAnual =
                `Relatorio-Anual/${ano}.json`;


            const resposta =
                await fetch(
                    caminhoAnual,
                    {
                        cache:"no-store"
                    }
                );


            if(!resposta.ok){

                throw new Error(
                    `Relatório anual não encontrado: ${caminhoAnual}`
                );
            }


            const dadosAnuais =
                await resposta.json();


            montarPreviewRelatorio(
                dadosAnuais,
                {
                    tipo:"anual",
                    ano,
                    mes:null,
                    escopo,
                    dadosAtuais:null
                }
            );
        }


        if(aviso){

            aviso.innerHTML = "";
        }


    }catch(erro){

        console.error(
            "Erro ao gerar relatório:",
            erro
        );


        preview.innerHTML = "";


        if(aviso){

            aviso.innerHTML = `
                <strong>
                    Não foi possível gerar o relatório.
                </strong>
                <br>
                ${erro.message}
            `;
        }
    }
}


/* ==========================================================
   PREVIEW
========================================================== */

function montarPreviewRelatorio(
    dadosRelatorio,
    configuracao
){

    const preview =
        document.getElementById(
            "relatorioPreview"
        );

    if(!preview){
        return;
    }


    const nomeMes =
        obterNomeMes(
            configuracao.mes
        );


    const tituloPeriodo =
        configuracao.tipo === "mensal"
            ? `${nomeMes} / ${configuracao.ano}`
            : `Ano ${configuracao.ano}`;


    preview.innerHTML = `

        <div class="relatorio-acoes nao-imprimir">

            <button
                type="button"
                onclick="window.print()"
            >
                🖨 Imprimir / PDF
            </button>

        </div>


        <article
            id="relatorioDocumento"
            class="relatorio-documento"
        >

            <header class="relatorio-documento-topo">

                <div>

                    <strong>
                        LABOR
                    </strong>

                    <span>
                        HEALTH SUPPLY
                    </span>

                </div>


                <div>

                    <h1>
                        ${
                            configuracao.tipo ===
                            "mensal"
                                ? "RELATÓRIO DE FECHAMENTO SGQ"
                                : "RELATÓRIO ANUAL SGQ"
                        }
                    </h1>

                    <p>
                        ${tituloPeriodo}
                    </p>

                </div>

            </header>


            <div class="relatorio-corpo">

                ${
                    gerarConteudoRelatorio(
                        dadosRelatorio,
                        configuracao
                    )
                }

            </div>


            <footer class="relatorio-rodape">

                Painel de Processos SGQ

            </footer>

        </article>
    `;
}

/* ==========================================================
   CONTEÚDO POR ESCOPO
========================================================== */

function gerarConteudoRelatorio(
    dadosCongelados,
    configuracao
){

    const dadosAtuais =
        configuracao.dadosAtuais ||
        dadosCongelados;


    /* ==================================================
       RELATÓRIO ANUAL
       Não compara com data.json
    ================================================== */

    const comparar =
        configuracao.tipo === "mensal";


    if(
        configuracao.escopo ===
        "geral"
    ){

        return `
            ${
                gerarResumoGeral(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoImportacao(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoEsfig(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoDescarte(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoAmostras(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoRetrabalho(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoAdequacaoCaixa(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }

            ${
                gerarBlocoFornecedores(
                    dadosCongelados,
                    dadosAtuais,
                    comparar
                )
            }
        `;
    }


    switch(
        configuracao.escopo
    ){

        case "importacao":

            return gerarBlocoImportacao(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        case "esfig":

            return gerarBlocoEsfig(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        case "descarte":

            return gerarBlocoDescarte(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        case "amostras":

            return gerarBlocoAmostras(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        case "retrabalho":

            return gerarBlocoRetrabalho(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        case "fornecedores":

            return gerarBlocoFornecedores(
                dadosCongelados,
                dadosAtuais,
                comparar
            );


        default:

            return gerarResumoGeral(
                dadosCongelados,
                dadosAtuais,
                comparar
            );
    }
}


/* ==========================================================
   RESUMO GERAL
========================================================== */

function gerarResumoGeral(
    congelado,
    atual,
    comparar
){

    return `

        <section class="relatorio-secao">

            <h2>
                📊 Visão Geral SGQ
            </h2>

            <div class="relatorio-comparacao-grid">

                ${
                    linhaComparacao(
                        "Importação",
                        congelado.importacao?.processosAno,
                        atual.importacao?.processosAno,
                        "numero",
                        comparar
                    )
                }

                ${
                    linhaComparacao(
                        "ESFIG - Horas",
                        congelado.esfig?.totalHoras,
                        atual.esfig?.totalHoras,
                        "horas",
                        comparar
                    )
                }

                ${
                    linhaComparacao(
                        "Descarte",
                        congelado.descarte?.descartadoAno?.total,
                        atual.descarte?.descartadoAno?.total,
                        "moeda",
                        comparar
                    )
                }

                ${
                    linhaComparacao(
                        "Retrabalho",
                        congelado.retrabalho?.totalUnidades,
                        atual.retrabalho?.totalUnidades,
                        "numero",
                        comparar
                    )
                }

                ${
                    linhaComparacao(
                        "RNC Fornecedores",
                        congelado.fornecedores?.totalrncano,
                        atual.fornecedores?.totalrncano,
                        "numero",
                        comparar
                    )
                }

            </div>

        </section>
    `;
}


/* ==========================================================
   IMPORTAÇÃO
========================================================== */

function gerarBlocoImportacao(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.importacao || {};

    const corrente =
        atual.importacao || {};


    return `

        <section class="relatorio-secao">

            <h2>
                📦 Inspeção de Importação
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Processos",
                            anterior:anterior.processosAno,
                            atual:corrente.processosAno,
                            tipo:"numero"
                        },

                        {
                            titulo:"SKUs acumulados",
                            anterior:anterior.totalSku,
                            atual:corrente.totalSku,
                            tipo:"numero"
                        },

                        {
                            titulo:"Lotes",
                            anterior:anterior.totalLotes,
                            atual:corrente.totalLotes,
                            tipo:"numero"
                        },

                        {
                            titulo:"Laudos emitidos",
                            anterior:anterior.laudosEmitidos,
                            atual:corrente.laudosEmitidos,
                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",
                            anterior:anterior.totalHoras,
                            atual:corrente.totalHoras,
                            tipo:"horas"
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   ESFIG
========================================================== */

function gerarBlocoEsfig(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.esfig || {};

    const corrente =
        atual.esfig || {};


    return `

        <section class="relatorio-secao">

            <h2>
                ⏱ Esfigmomanômetro
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Horas",
                            anterior:anterior.totalHoras,
                            atual:corrente.totalHoras,
                            tipo:"horas"
                        },

                        {
                            titulo:"GRU Inmetro",
                            anterior:anterior.totalGruInmetro,
                            atual:corrente.totalGruInmetro,
                            tipo:"moeda"
                        },

                        {
                            titulo:"Total aferido",
                            anterior:
                                anterior.resumoAfericoes
                                    ?.totalAferido,

                            atual:
                                corrente.resumoAfericoes
                                    ?.totalAferido,

                            tipo:"numero"
                        },

                        {
                            titulo:"Total aprovado",
                            anterior:
                                anterior.resumoAfericoes
                                    ?.totalAprovado,

                            atual:
                                corrente.resumoAfericoes
                                    ?.totalAprovado,

                            tipo:"numero"
                        },

                        {
                            titulo:"Total reprovado",
                            anterior:
                                anterior.resumoAfericoes
                                    ?.totalReprovado,

                            atual:
                                corrente.resumoAfericoes
                                    ?.totalReprovado,

                            tipo:"numero"
                        }
                    ],
                    comparar
                )
            }


            <div class="relatorio-posicao">

                <span>
                    Última aferição:
                    <strong>
                        ${corrente.ultimaAfericao || "-"}
                    </strong>
                </span>

                <span>
                    Próxima aferição:
                    <strong>
                        ${corrente.proximaAfericao || "-"}
                    </strong>
                </span>

            </div>

        </section>
    `;
}


/* ==========================================================
   DESCARTE
========================================================== */

function gerarBlocoDescarte(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.descarte || {};

    const corrente =
        atual.descarte || {};


    return `

        <section class="relatorio-secao">

            <h2>
                🗑 Descarte
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Valor atual",
                            anterior:
                                anterior.valorAtual?.total,

                            atual:
                                corrente.valorAtual?.total,

                            tipo:"moeda",
                            subtrair:false
                        },

                        {
                            titulo:"Total descartado no ano",
                            anterior:
                                anterior.descartadoAno?.total,

                            atual:
                                corrente.descartadoAno?.total,

                            tipo:"moeda"
                        },

                        {
                            titulo:"Custo ambiental - 1º semestre",
                            anterior:
                                anterior.custoAmbiental
                                    ?.totalPrimeiroSemestre,

                            atual:
                                corrente.custoAmbiental
                                    ?.totalPrimeiroSemestre,

                            tipo:"moeda"
                        },

                        {
                            titulo:"Custo ambiental - 2º semestre",
                            anterior:
                                anterior.custoAmbiental
                                    ?.totalSegundoSemestre,

                            atual:
                                corrente.custoAmbiental
                                    ?.totalSegundoSemestre,

                            tipo:"moeda"
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   AMOSTRAS
========================================================== */

function gerarBlocoAmostras(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.amostras || {};

    const corrente =
        atual.amostras || {};


    const totalAnterior =
        somarAmostras(
            anterior.mensal
        );


    const totalAtual =
        somarAmostras(
            corrente.mensal
        );


    return `

        <section class="relatorio-secao">

            <h2>
                📦 Amostras
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Quantidade acumulada",
                            anterior:totalAnterior,
                            atual:totalAtual,
                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",
                            anterior:anterior.totalHoras,
                            atual:corrente.totalHoras,
                            tipo:"horas"
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   RETRABALHO
========================================================== */

function gerarBlocoRetrabalho(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.retrabalho || {};

    const corrente =
        atual.retrabalho || {};


    return `

        <section class="relatorio-secao">

            <h2>
                🔄 Retrabalho
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Processos",
                            anterior:anterior.processos,
                            atual:corrente.processos,
                            tipo:"numero"
                        },

                        {
                            titulo:"Unidades retrabalhadas",
                            anterior:anterior.totalUnidades,
                            atual:corrente.totalUnidades,
                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",
                            anterior:anterior.totalHoras,
                            atual:corrente.totalHoras,
                            tipo:"horas"
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   ADEQUAÇÃO DE CAIXA
========================================================== */

function gerarBlocoAdequacaoCaixa(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.adequacaocaixa || {};

    const corrente =
        atual.adequacaocaixa || {};


    return `

        <section class="relatorio-secao">

            <h2>
                📦 Adequação de Caixa
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Ocorrências",
                            anterior:
                                anterior.totalocorrenciasano,

                            atual:
                                corrente.totalocorrenciasano,

                            tipo:"numero"
                        },

                        {
                            titulo:"Quantidade retrabalhada",
                            anterior:
                                anterior.quantidaderetrabalhada,

                            atual:
                                corrente.quantidaderetrabalhada,

                            tipo:"numero"
                        },

                        {
                            titulo:"Horas",
                            anterior:
                                anterior.totalhoras,

                            atual:
                                corrente.totalhoras,

                            tipo:"horas"
                        },

                        {
                            titulo:"Valor bom",
                            anterior:
                                anterior.indicadores
                                    ?.bom?.valor,

                            atual:
                                corrente.indicadores
                                    ?.bom?.valor,

                            tipo:"moeda",
                            subtrair:false
                        },

                        {
                            titulo:"Valor avaria",
                            anterior:
                                anterior.indicadores
                                    ?.avaria?.valor,

                            atual:
                                corrente.indicadores
                                    ?.avaria?.valor,

                            tipo:"moeda",
                            subtrair:false
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   FORNECEDORES
========================================================== */

function gerarBlocoFornecedores(
    congelado,
    atual,
    comparar
){

    const anterior =
        congelado.fornecedores || {};

    const corrente =
        atual.fornecedores || {};


    return `

        <section class="relatorio-secao">

            <h2>
                🏭 Fornecedores
            </h2>

            ${
                tabelaComparacao(
                    [
                        {
                            titulo:"Fornecedores",
                            anterior:
                                anterior.totalfornecedores,

                            atual:
                                corrente.totalfornecedores,

                            tipo:"numero",
                            subtrair:false
                        },

                        {
                            titulo:"Processos",
                            anterior:
                                anterior.totalprocessos,

                            atual:
                                corrente.totalprocessos,

                            tipo:"numero"
                        },

                        {
                            titulo:"RNC",
                            anterior:
                                anterior.totalrncano,

                            atual:
                                corrente.totalrncano,

                            tipo:"numero"
                        },

                        {
                            titulo:"Retrabalhos",
                            anterior:
                                anterior.totalretrabalho,

                            atual:
                                corrente.totalretrabalho,

                            tipo:"numero"
                        },

                        {
                            titulo:"Reclamações",
                            anterior:
                                anterior.totalreclamacao,

                            atual:
                                corrente.totalreclamacao,

                            tipo:"numero"
                        },

                        {
                            titulo:"Índice médio",
                            anterior:
                                anterior.indicemedioavaliacao,

                            atual:
                                corrente.indicemedioavaliacao,

                            tipo:"percentual",
                            subtrair:false
                        }
                    ],
                    comparar
                )
            }

        </section>
    `;
}


/* ==========================================================
   TABELA DE COMPARAÇÃO
========================================================== */

function tabelaComparacao(
    indicadores,
    comparar = true
){

    const linhas =
        indicadores
            .map(
                indicador => {

                    const anterior =
                        indicador.anterior;

                    const atual =
                        indicador.atual;


                    const subtrair =
                        indicador.subtrair !== false;


                    let variacao = "-";


                    if(
                        comparar &&
                        subtrair &&
                        numeroValido(anterior) &&
                        numeroValido(atual)
                    ){

                        variacao =
                            formatarValorRelatorio(
                                Number(atual) -
                                Number(anterior),
                                indicador.tipo,
                                true
                            );
                    }


                    if(
                        comparar &&
                        !subtrair
                    ){

                        variacao =
                            "Posição";
                    }


                    return `

                        <tr>

                            <td>
                                ${indicador.titulo}
                            </td>

                            <td>
                                ${
                                    formatarValorRelatorio(
                                        anterior,
                                        indicador.tipo
                                    )
                                }
                            </td>

                            <td>
                                ${
                                    comparar
                                        ? formatarValorRelatorio(
                                            atual,
                                            indicador.tipo
                                        )
                                        : "-"
                                }
                            </td>

                            <td>
                                ${
                                    comparar
                                        ? variacao
                                        : "-"
                                }
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    return `

        <div class="relatorio-tabela-wrap">

            <table class="relatorio-tabela-comparacao">

                <thead>

                    <tr>

                        <th>
                            Indicador
                        </th>

                        <th>
                            Fechamento
                        </th>

                        <th>
                            Atual
                        </th>

                        <th>
                            Variação
                        </th>

                    </tr>

                </thead>

                <tbody>
                    ${linhas}
                </tbody>

            </table>

        </div>
    `;
}


/* ==========================================================
   LINHA RESUMIDA
========================================================== */

function linhaComparacao(
    titulo,
    anterior,
    atual,
    tipo,
    comparar
){

    let variacao =
        "-";


    if(
        comparar &&
        numeroValido(anterior) &&
        numeroValido(atual)
    ){

        variacao =
            formatarValorRelatorio(
                Number(atual) -
                Number(anterior),
                tipo,
                true
            );
    }


    return `

        <div class="relatorio-comparacao-card">

            <span class="relatorio-comparacao-titulo">
                ${titulo}
            </span>

            <div>

                <small>
                    Fechamento
                </small>

                <strong>
                    ${
                        formatarValorRelatorio(
                            anterior,
                            tipo
                        )
                    }
                </strong>

            </div>


            <div>

                <small>
                    Atual
                </small>

                <strong>
                    ${
                        comparar
                            ? formatarValorRelatorio(
                                atual,
                                tipo
                            )
                            : "-"
                    }
                </strong>

            </div>


            <div>

                <small>
                    Variação
                </small>

                <strong>
                    ${variacao}
                </strong>

            </div>

        </div>
    `;
}


/* ==========================================================
   FORMATAÇÃO
========================================================== */

function formatarValorRelatorio(
    valor,
    tipo = "numero",
    mostrarSinal = false
){

    if(
        valor === undefined ||
        valor === null ||
        valor === ""
    ){

        return "-";
    }


    if(
        tipo === "moeda"
    ){

        const numero =
            Number(valor);


        if(
            !Number.isFinite(numero)
        ){

            return "-";
        }


        const sinal =
            mostrarSinal &&
            numero > 0
                ? "+"
                : "";


        return (
            sinal +
            numero.toLocaleString(
                "pt-BR",
                {
                    style:"currency",
                    currency:"BRL"
                }
            )
        );
    }


    if(
        tipo === "horas"
    ){

        const numero =
            Number(valor);


        if(
            !Number.isFinite(numero)
        ){

            return "-";
        }


        const sinal =
            mostrarSinal &&
            numero > 0
                ? "+"
                : "";


        return (
            sinal +
            numero.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits:0,
                    maximumFractionDigits:2
                }
            ) +
            " h"
        );
    }


    if(
        tipo === "percentual"
    ){

        const numero =
            Number(valor);


        if(
            !Number.isFinite(numero)
        ){

            return "-";
        }


        return (
            numero * 100
        )
            .toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits:1
                }
            ) +
            "%";
    }


    if(
        numeroValido(valor)
    ){

        const numero =
            Number(valor);


        const sinal =
            mostrarSinal &&
            numero > 0
                ? "+"
                : "";


        return (
            sinal +
            numero.toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits:2
                }
            )
        );
    }


    return String(valor);
}


/* ==========================================================
   NÚMERO VÁLIDO
========================================================== */

function numeroValido(valor){

    return (
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number.isFinite(
            Number(valor)
        )
    );
}


/* ==========================================================
   SOMAR AMOSTRAS
========================================================== */

function somarAmostras(lista){

    if(
        !Array.isArray(lista)
    ){

        return 0;
    }


    return lista.reduce(
        (
            soma,
            item
        ) =>

            soma +
            Number(
                item.valor || 0
            ),

        0
    );
}
/* ==========================================================
   CARD
========================================================== */

function cardRelatorio(
    titulo,
    valor,
    sufixo = "",
    moeda = false
){

    let valorExibido = "-";


    if(
        valor !== undefined &&
        valor !== null &&
        valor !== ""
    ){

        if(
            moeda &&
            !isNaN(Number(valor))
        ){

            valorExibido =
                Number(valor)
                    .toLocaleString(
                        "pt-BR",
                        {
                            style:"currency",
                            currency:"BRL"
                        }
                    );

        }else if(
            typeof valor === "number"
        ){

            valorExibido =
                valor.toLocaleString(
                    "pt-BR",
                    {
                        maximumFractionDigits:2
                    }
                ) + sufixo;

        }else{

            valorExibido =
                `${valor}${sufixo}`;
        }
    }


    return `

        <div class="relatorio-card">

            <span>
                ${titulo}
            </span>

            <strong>
                ${valorExibido}
            </strong>

        </div>
    `;
}


/* ==========================================================
   BUSCA SEGURA
========================================================== */

function extrairValor(
    objeto,
    caminhos
){

    for(
        const caminho of caminhos
    ){

        const partes =
            caminho.split(".");

        let atual =
            objeto;


        for(
            const parte of partes
        ){

            if(
                atual === null ||
                atual === undefined
            ){

                atual =
                    undefined;

                break;
            }

            atual =
                atual[parte];
        }


        if(
            atual !== undefined &&
            atual !== null
        ){

            return atual;
        }
    }


    return null;
}


/* ==========================================================
   NOME DO MÊS
========================================================== */

function obterNomeMes(mes){

    const meses = {

        "01":"Janeiro",
        "02":"Fevereiro",
        "03":"Março",
        "04":"Abril",
        "05":"Maio",
        "06":"Junho",
        "07":"Julho",
        "08":"Agosto",
        "09":"Setembro",
        "10":"Outubro",
        "11":"Novembro",
        "12":"Dezembro"

    };


    return meses[mes] || "";
}


/* ==========================================================
   LIMPAR PREVIEW
========================================================== */

function limparPreviewRelatorio(){

    const preview =
        document.getElementById(
            "relatorioPreview"
        );

    const aviso =
        document.getElementById(
            "relatorioAviso"
        );


    if(preview){

        preview.innerHTML = "";
    }


    if(aviso){

        aviso.innerHTML = `
            Selecione o período e clique em
            <strong>
                Visualizar Relatório
            </strong>.
        `;
    }
}
