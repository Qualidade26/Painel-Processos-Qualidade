/* ==========================================================
   FORNECEDORES.JS
   Painel de Processos SGQ

   Entrada esperada:
   renderizarFornecedores(dados.fornecedores)

   Estrutura compatível:
   fornecedores
   ├── totalrncano
   ├── totalfornecedores
   ├── totalprocessos
   ├── totalretrabalho
   ├── totalreclamacao
   ├── indicemedioavaliacao
   ├── indicadores
   ├── avaliados
   ├── ranking
   └── top10Rnc
========================================================== */

(function(){

    "use strict";


    /* ======================================================
       CONFIGURAÇÕES
    ====================================================== */

    const CORES = {

        azul:"#1557d6",
        azulEscuro:"#0b45d8",

        verde:"#20b957",
        amarelo:"#ffc20a",
        laranja:"#ff7a00",
        vermelho:"#f52f3e",
        vermelhoEscuro:"#b91c1c",

        texto:"#1f2937",
        textoSecundario:"#64748b",

        grade:"rgba(148,163,184,.22)"
    };


    const CLASSIFICACOES = {

        excelente:{
            slug:"excelente",
            label:"Excelente",
            cor:CORES.verde
        },

        muitoBom:{
            slug:"muito-bom",
            label:"Muito bom",
            cor:"#84cc16"
        },

        atencao:{
            slug:"atencao",
            label:"Atenção",
            cor:CORES.amarelo
        },

        ruim:{
            slug:"ruim",
            label:"Ruim",
            cor:CORES.laranja
        },

        critico:{
            slug:"critico",
            label:"Crítico",
            cor:CORES.vermelho
        }
    };


    const ORDEM_CLASSIFICACOES = [
        "excelente",
        "muito-bom",
        "atencao",
        "ruim",
        "critico"
    ];


    /* ======================================================
       ESTADO
    ====================================================== */

    const estado = {

        raiz:null,

        dados:null,

        fornecedores:[],

        resumo:null,

        abaAtual:"geral",

        termoBusca:"",

        filtroClassificacao:"todos",

        fornecedorSelecionado:null,

        graficos:new Map()
    };


    /* ======================================================
       UTILITÁRIOS
    ====================================================== */

    function numero(valor){

        if(
            valor === null ||
            valor === undefined ||
            valor === ""
        ){
            return 0;
        }


        if(typeof valor === "number"){

            return Number.isFinite(valor)
                ? valor
                : 0;
        }


        let texto = String(valor)
            .trim()
            .replace(/\s/g,"");


        if(!texto){
            return 0;
        }


        texto = texto.replace("%","");


        /*
           Formato brasileiro:
           1.234,56
        */

        if(
            texto.includes(",") &&
            texto.includes(".")
        ){

            texto = texto
                .replace(/\./g,"")
                .replace(",",".");
        }

        else if(texto.includes(",")){

            texto = texto.replace(",",".");
        }


        const convertido =
            Number(texto);


        return Number.isFinite(convertido)
            ? convertido
            : 0;
    }


    function primeiroValor(
        objeto,
        chaves,
        padrao = null
    ){

        if(
            !objeto ||
            typeof objeto !== "object"
        ){
            return padrao;
        }


        for(const chave of chaves){

            if(
                objeto[chave] !== undefined &&
                objeto[chave] !== null &&
                objeto[chave] !== ""
            ){
                return objeto[chave];
            }
        }


        return padrao;
    }


    function primeiroNumero(
        objeto,
        chaves,
        padrao = 0
    ){

        const valor =
            primeiroValor(
                objeto,
                chaves,
                null
            );


        if(
            valor === null ||
            valor === undefined ||
            valor === ""
        ){
            return padrao;
        }


        return numero(valor);
    }


    function normalizarIndice(valor){

        let indice =
            numero(valor);


        /*
           Permite:
           0.95
           95
           "95%"
        */

        if(indice > 1){
            indice = indice / 100;
        }


        return Math.max(
            0,
            Math.min(1,indice)
        );
    }


    function formatarInteiro(valor){

        return Math.round(
            numero(valor)
        ).toLocaleString(
            "pt-BR"
        );
    }


    function formatarPercentual(valor){

        const n =
            numero(valor);


        const percentual =
            n <= 1
                ? n * 100
                : n;


        return `${Math.round(percentual)}%`;
    }


    function escaparHtml(valor){

        return String(
            valor ?? ""
        )
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
    }


    function normalizarTexto(valor){

        return String(
            valor ?? ""
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
    }


    function criarId(
        nome,
        indice
    ){

        const base =
            normalizarTexto(nome)
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );


        return `${base || "fornecedor"}-${indice}`;
    }


    function somar(
        lista,
        campo
    ){

        return lista.reduce(
            (total,item) =>
                total +
                numero(item[campo]),
            0
        );
    }


    function media(lista){

        if(!lista.length){
            return 0;
        }


        return lista.reduce(
            (total,valor) =>
                total +
                numero(valor),
            0
        ) / lista.length;
    }


    /* ======================================================
       CLASSIFICAÇÃO
    ====================================================== */

    function obterClassificacao(indice){

        const percentual =
            normalizarIndice(indice) * 100;


        if(percentual >= 95){

            return CLASSIFICACOES.excelente;
        }


        if(percentual >= 90){

            return CLASSIFICACOES.muitoBom;
        }


        if(percentual >= 80){

            return CLASSIFICACOES.atencao;
        }


        if(percentual >= 70){

            return CLASSIFICACOES.ruim;
        }


        return CLASSIFICACOES.critico;
    }


    function obterClassificacaoPorSlug(
        slug
    ){

        return Object.values(
            CLASSIFICACOES
        )
        .find(
            item =>
                item.slug === slug
        ) || CLASSIFICACOES.critico;
    }


    /* ======================================================
       NORMALIZAÇÃO DO FORNECEDOR
    ====================================================== */

    function normalizarFornecedor(
        item,
        indice
    ){

        const nome = String(
            primeiroValor(
                item,
                [
                    "fabricante",
                    "fornecedor",
                    "nome",
                    "razaoSocial",
                    "descricao"
                ],
                `Fornecedor ${indice + 1}`
            )
        ).trim();


        const avaliacao =
            normalizarIndice(
                primeiroValor(
                    item,
                    [
                        "indiceavaliacao",
                        "indiceAvaliacao",
                        "indice",
                        "scoreFinal",
                        "score",
                        "percentual"
                    ],
                    0
                )
            );


        const classificacao =
            obterClassificacao(
                avaliacao
            );


        return {

            id:
                criarId(
                    nome,
                    indice
                ),

            nome,

            processos:
                primeiroNumero(
                    item,
                    [
                        "processosano",
                        "processosAno",
                        "processos",
                        "totalProcessos"
                    ],
                    0
                ),

            produtos:
                primeiroNumero(
                    item,
                    [
                        "produtosfornecidos",
                        "produtos",
                        "totalProdutos",
                        "skuano",
                        "sku",
                        "skus",
                        "totalSku",
                        "quantidadeProdutos"
                    ],
                    0
                ),

            rncs:
                primeiroNumero(
                    item,
                    [
                        "rnc",
                        "rncs",
                        "totalRnc",
                        "naoConformidades",
                        "nãoConformidades"
                    ],
                    0
                ),

            retrabalhos:
                primeiroNumero(
                    item,
                    [
                        "retrabalhos",
                        "retrabalho",
                        "totalRetrabalhos",
                        "totalRetrabalho"
                    ],
                    0
                ),

            reclamacoes:
                primeiroNumero(
                    item,
                    [
                        "reclamacoes",
                        "reclamações",
                        "totalReclamacoes",
                        "totalReclamações"
                    ],
                    0
                ),

            ocorrencias:
                primeiroNumero(
                    item,
                    [
                        "ocorrencias",
                        "ocorrências"
                    ],
                    0
                ),

            horas:
                primeiroNumero(
                    item,
                    [
                        "horas"
                    ],
                    0
                ),

            indice:
                avaliacao,

            classificacao,

            original:item
        };
    }


    /* ======================================================
       LOCALIZAR LISTA
    ====================================================== */

    function localizarLista(
        entrada,
        raizDados
    ){

        const candidatas = [

            Array.isArray(entrada)
                ? entrada
                : null,

            /*
               avaliados precisa vir antes de ranking,
               porque ranking pode conter somente
               informações resumidas.
            */

            raizDados?.avaliados,

            raizDados?.lista,

            raizDados?.avaliacoes,

            raizDados?.avaliações,

            raizDados?.detalhes,

            Array.isArray(
                raizDados?.fornecedores
            )
                ? raizDados.fornecedores
                : null,

            raizDados?.ranking
        ];


        return candidatas.find(
            Array.isArray
        ) || [];
    }


    /* ======================================================
       NORMALIZAR ENTRADA
    ====================================================== */

    function normalizarEntrada(
        entrada
    ){

        let raizDados =
            entrada || {};


        /*
           Aceita:

           renderizarFornecedores(
               dados.fornecedores
           )

           e também:

           renderizarFornecedores(
               dados
           )
        */

        if(
            !Array.isArray(entrada) &&
            entrada?.fornecedores &&
            !Array.isArray(
                entrada.fornecedores
            )
        ){

            raizDados =
                entrada.fornecedores;
        }


        const lista =
            localizarLista(
                entrada,
                raizDados
            )
            .filter(
                item =>
                    item &&
                    typeof item === "object"
            )
            .map(
                normalizarFornecedor
            );


        const resumo = {

            totalFornecedores:
                primeiroNumero(
                    raizDados,
                    [
                        "totalfornecedores",
                        "totalFornecedores",
                        "fornecedoresAno",
                        "quantidadeFornecedores"
                    ],
                    lista.length
                ),

            processos:
                primeiroNumero(
                    raizDados,
                    [
                        "totalprocessos",
                        "totalProcessos",
                        "processosAno",
                        "processos"
                    ],
                    somar(
                        lista,
                        "processos"
                    )
                ),

            rncs:
                primeiroNumero(
                    raizDados,
                    [
                        "totalrncano",
                        "totalRncAno",
                        "totalRnc",
                        "totalRncs",
                        "rncAno",
                        "rncsAno",
                        "naoConformidades"
                    ],
                    somar(
                        lista,
                        "rncs"
                    )
                ),

            retrabalhos:
                primeiroNumero(
                    raizDados,
                    [
                        "totalretrabalho",
                        "totalRetrabalho",
                        "totalRetrabalhos",
                        "retrabalhosAno"
                    ],
                    somar(
                        lista,
                        "retrabalhos"
                    )
                ),

            indiceMedio:
                normalizarIndice(
                    primeiroValor(
                        raizDados,
                        [
                            "indicemedioavaliacao",
                            "indiceMedioAvaliacao",
                            "indiceMedio",
                            "mediaIndice",
                            "scoreMedio",
                            "avaliacaoMedia"
                        ],
                        media(
                            lista.map(
                                item =>
                                    item.indice
                            )
                        )
                    )
                )
        };


        /*
           DISTRIBUIÇÃO POR ORIGEM

           Prioridade:
           1. bloco raizDados.origens, quando existir;
           2. totais gerais já existentes no objeto fornecedores;
           3. soma dos registros avaliados.

           Assim não é necessário manter um CSV separado apenas
           para alimentar este painel.
        */

        const origensEntrada =
            raizDados?.origens ||
            raizDados?.distribuicaoOrigem ||
            raizDados?.distribuicaoPorOrigem ||
            {};

        resumo.reclamacoes =
            primeiroNumero(
                origensEntrada,
                ["reclamacao","reclamacoes","reclamação","reclamações"],
                primeiroNumero(
                    raizDados,
                    [
                        "totalreclamacao",
                        "totalReclamacao",
                        "totalreclamacoes",
                        "totalReclamacoes",
                        "reclamacoesAno",
                        "reclamaçõesAno"
                    ],
                    somar(lista,"reclamacoes")
                )
            );

        resumo.ocorrencias =
            primeiroNumero(
                origensEntrada,
                ["ocorrencia","ocorrencias","ocorrência","ocorrências"],
                primeiroNumero(
                    raizDados,
                    [
                        "totalocorrencias",
                        "totalOcorrencias",
                        "ocorrenciasAno",
                        "ocorrênciasAno"
                    ],
                    somar(lista,"ocorrencias")
                )
            );

        resumo.origens = {

            importacao:
                primeiroNumero(
                    origensEntrada,
                    ["importacao","importação","processosImportacao","processosImportação"],
                    resumo.processos
                ),

            retrabalho:
                primeiroNumero(
                    origensEntrada,
                    ["retrabalho","retrabalhos"],
                    resumo.retrabalhos
                ),

            naoConformidade:
                primeiroNumero(
                    origensEntrada,
                    [
                        "naoConformidade",
                        "nãoConformidade",
                        "naoConformidades",
                        "nãoConformidades",
                        "rnc",
                        "rncs"
                    ],
                    resumo.rncs
                ),

            reclamacao:resumo.reclamacoes,

            ocorrencias:resumo.ocorrencias
        };


        if(
            !resumo.totalFornecedores &&
            lista.length
        ){

            resumo.totalFornecedores =
                lista.length;
        }


        return {
            resumo,
            lista,
            raizDados
        };
    }


    /* ======================================================
       ÍCONES
    ====================================================== */

    function iconeSvg(tipo){

        const icones = {

            fornecedores:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"/>
                </svg>
            `,

            processos:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM9 12v2h8v-2H9Zm0 4v2h8v-2H9Z"/>
                </svg>
            `,

            alerta:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/>
                </svg>
            `,

            ferramenta:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.7 19.3 14.9 11.5a6 6 0 0 1-7.4-7.4l3.6 3.6 2.8-2.8-3.6-3.6a6 6 0 0 1 7.4 7.4l7.8 7.8-2.8 2.8Z"/>
                </svg>
            `,

            estrela:`
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z"/>
                </svg>
            `
        };


        return icones[tipo] || "";
    }


    /* ======================================================
       PAINÉIS E MÉTRICAS
    ====================================================== */

    function criarPainelGrafico(
        titulo,
        idCanvas,
        rosca = false
    ){

        return `
            <article class="fornecedores-panel">

                <h3 class="fornecedores-panel__titulo">
                    ${titulo}
                </h3>

                <div class="fornecedores-chart-box${rosca ? " fornecedores-chart-box--rosca" : ""}">

                    <canvas
                        id="${idCanvas}"
                        role="img"
                        aria-label="${titulo}"
                    ></canvas>

                </div>

            </article>
        `;
    }


    function criarMetrica(
        label,
        icone,
        cor,
        idValor
    ){

        return `
            <div class="fornecedor-metrica">

                <span class="fornecedor-metrica__icone fornecedor-metrica__icone--${cor}">
                    ${iconeSvg(icone)}
                </span>

                <span class="fornecedor-metrica__label">
                    ${label}
                </span>

                <strong
                    class="fornecedor-metrica__valor"
                    id="${idValor}"
                >
                    0
                </strong>

            </div>
        `;
    }


    /* ======================================================
       DISTRIBUIÇÃO POR ORIGEM
       Usa os próprios totais já recebidos em dados.fornecedores.
    ====================================================== */

    function criarPainelDistribuicaoOrigem(){

        const origens = estado.resumo?.origens || {};

        const itens = [
            { chave:"importacao", label:"Importação", cor:CORES.azul },
            { chave:"retrabalho", label:"Retrabalho", cor:CORES.laranja },
            { chave:"naoConformidade", label:"Não conformidade", cor:CORES.amarelo },
            { chave:"reclamacao", label:"Reclamação", cor:"#8b5cf6" },
            { chave:"ocorrencias", label:"Ocorrências", cor:CORES.verde }
        ];

        const total = itens.reduce(
            (soma,item) => soma + numero(origens[item.chave]),
            0
        );

        const colunas = itens.map(item => {

            const valor = numero(origens[item.chave]);
            const percentual = total
                ? Math.round((valor / total) * 100)
                : 0;

            return `
                <div class="fornecedores-origem-item">
                    <div
                        class="fornecedores-origem-item__topo"
                        style="--origem-cor:${item.cor}"
                    >
                        <span class="fornecedores-origem-item__marcador"></span>
                        <span class="fornecedores-origem-item__label">
                            ${item.label}
                        </span>
                    </div>

                    <strong class="fornecedores-origem-item__valor">
                        ${formatarInteiro(valor)}
                    </strong>

                    <span class="fornecedores-origem-item__percentual">
                        ${percentual}%
                    </span>
                </div>
            `;
        }).join("");

        return `
            <article class="fornecedores-panel fornecedores-panel--origem">

                <h3 class="fornecedores-panel__titulo">
                    DISTRIBUIÇÃO POR ORIGEM
                </h3>

                <div class="fornecedores-origem-grid">
                    ${colunas}
                </div>

                <div class="fornecedores-origem-total">
                    Total de entradas:
                    <strong>${formatarInteiro(total)} (100%)</strong>
                </div>

            </article>
        `;
    }


    /* ======================================================
       CRIAÇÃO DOS KPIs
    ====================================================== */

    function criarKpi(
        titulo,
        icone,
        classeCor,
        idValor
    ){

        return `
            <article class="fornecedor-kpi">

                <h3 class="fornecedor-kpi__titulo">
                    ${titulo}
                </h3>

                <span class="fornecedor-kpi__icone fornecedor-kpi__icone--${classeCor}">
                    ${iconeSvg(icone)}
                </span>

                <strong
                    class="fornecedor-kpi__valor"
                    id="${idValor}"
                >
                    0
                </strong>

            </article>
        `;
    }
       /* ======================================================
       MONTAGEM DA ESTRUTURA
    ====================================================== */

    function montarEstrutura(raiz){

        raiz.classList.add(
            "pagina-fornecedores"
        );


        raiz.innerHTML = `

            <nav
                class="fornecedores-abas"
                aria-label="Abas de fornecedores"
            >

                <button
                    type="button"
                    class="fornecedores-aba is-active"
                    data-fornecedores-aba="geral"
                    aria-selected="true"
                >
                    Visão geral
                </button>


                <button
                    type="button"
                    class="fornecedores-aba"
                    data-fornecedores-aba="avaliacao"
                    aria-selected="false"
                >
                    Avaliação por fornecedor
                </button>

            </nav>


            <section
                class="fornecedores-conteudo"
                data-fornecedores-conteudo="geral"
            >

                <div class="fornecedores-indicadores">

                    ${criarKpi(
                        "TOTAL DE FORNECEDORES",
                        "fornecedores",
                        "azul",
                        "forn-kpi-total"
                    )}

                    ${criarKpi(
                        "PROCESSOS NO ANO",
                        "processos",
                        "azul",
                        "forn-kpi-processos"
                    )}

                    ${criarKpi(
                        "RNCs NO ANO",
                        "alerta",
                        "vermelho",
                        "forn-kpi-rncs"
                    )}

                    ${criarKpi(
                        "RETRABALHOS",
                        "ferramenta",
                        "laranja",
                        "forn-kpi-retrabalhos"
                    )}

                    ${criarKpi(
                        "ÍNDICE MÉDIO",
                        "estrela",
                        "verde",
                        "forn-kpi-indice"
                    )}

                </div>


                <div class="fornecedores-graficos">

                    ${criarPainelGrafico(
                        "FORNECEDORES COM MAIS RNCs",
                        "grafico-fornecedores-rncs"
                    )}

                    ${criarPainelGrafico(
                        "DISTRIBUIÇÃO POR CLASSIFICAÇÃO",
                        "grafico-fornecedores-classificacao",
                        true
                    )}

                    ${criarPainelDistribuicaoOrigem()}

                    ${criarPainelGrafico(
                        "PROCESSOS POR FORNECEDOR",
                        "grafico-fornecedores-processos"
                    )}

                </div>

            </section>


            <section
                class="fornecedores-conteudo"
                data-fornecedores-conteudo="avaliacao"
                hidden
            >

                <div class="fornecedores-avaliacao-grid">

                    <div class="fornecedores-lista-panel">

                        <div class="fornecedores-controles">

                            <label class="fornecedores-pesquisa">

                                <span>
                                    Pesquisar fornecedor
                                </span>

                                <input
                                    id="fornecedores-pesquisa"
                                    type="search"
                                    placeholder="Digite o nome..."
                                    autocomplete="off"
                                >

                            </label>


                            <label class="fornecedores-filtro">

                                <span>
                                    Classificação
                                </span>

                                <select
                                    id="fornecedores-classificacao"
                                >

                                    <option value="todos">
                                        Todas
                                    </option>

                                    <option value="excelente">
                                        Excelente
                                    </option>

                                    <option value="muito-bom">
                                        Muito bom
                                    </option>

                                    <option value="atencao">
                                        Atenção
                                    </option>

                                    <option value="ruim">
                                        Ruim
                                    </option>

                                    <option value="critico">
                                        Crítico
                                    </option>

                                </select>

                            </label>

                        </div>


                        <div class="fornecedores-tabela-wrap">

                            <table class="fornecedores-tabela">

                                <thead>

                                    <tr>

                                        <th>
                                            Fornecedor
                                        </th>

                                        <th>
                                            Processos
                                        </th>

                                        <th>
                                            Produtos/SKUs
                                        </th>

                                        <th>
                                            RNCs
                                        </th>

                                        <th>
                                            Retrabalhos
                                        </th>

                                        <th>
                                            Reclamações
                                        </th>

                                        <th>
                                            Índice
                                        </th>

                                        <th>
                                            Classificação
                                        </th>

                                    </tr>

                                </thead>


                                <tbody
                                    id="fornecedores-tabela-corpo"
                                ></tbody>

                            </table>

                        </div>

                    </div>


                    <aside
                        class="fornecedor-detalhe"
                        aria-live="polite"
                    >

                        <p class="fornecedor-detalhe__rotulo">
                            Fornecedor selecionado
                        </p>


                        <h3
                            class="fornecedor-detalhe__nome"
                            id="fornecedor-detalhe-nome"
                        >
                            —
                        </h3>


                        <div
                            class="fornecedor-gauge"
                            id="fornecedor-gauge"
                        >

                            <div class="fornecedor-gauge__arco">
                            </div>


                            <div class="fornecedor-gauge__conteudo">

                                <span
                                    class="fornecedor-gauge__valor"
                                    id="fornecedor-gauge-valor"
                                >
                                    0%
                                </span>


                                <span
                                    class="fornecedor-gauge__classificacao"
                                    id="fornecedor-gauge-classificacao"
                                >
                                    —
                                </span>

                            </div>

                        </div>


                        <div class="fornecedor-detalhe__metricas">

                            ${criarMetrica(
                                "Processos",
                                "processos",
                                "azul",
                                "forn-detalhe-processos"
                            )}

                            ${criarMetrica(
                                "Produtos/SKUs",
                                "processos",
                                "azul",
                                "forn-detalhe-produtos"
                            )}

                            ${criarMetrica(
                                "RNCs",
                                "alerta",
                                "vermelho",
                                "forn-detalhe-rncs"
                            )}

                            ${criarMetrica(
                                "Retrabalhos",
                                "ferramenta",
                                "laranja",
                                "forn-detalhe-retrabalhos"
                            )}

                            ${criarMetrica(
                                "Reclamações",
                                "alerta",
                                "roxo",
                                "forn-detalhe-reclamacoes"
                            )}

                            ${criarMetrica(
                                "Posição no ranking",
                                "estrela",
                                "azul",
                                "forn-detalhe-posicao"
                            )}

                        </div>

                    </aside>

                </div>

            </section>
        `;
    }


    /* ======================================================
       PREENCHER INDICADORES
    ====================================================== */

    function preencherIndicadores(){

        const resumo =
            estado.resumo || {};


        definirTexto(
            "forn-kpi-total",
            formatarInteiro(
                resumo.totalFornecedores
            )
        );


        definirTexto(
            "forn-kpi-processos",
            formatarInteiro(
                resumo.processos
            )
        );


        definirTexto(
            "forn-kpi-rncs",
            formatarInteiro(
                resumo.rncs
            )
        );


        definirTexto(
            "forn-kpi-retrabalhos",
            formatarInteiro(
                resumo.retrabalhos
            )
        );


        definirTexto(
            "forn-kpi-indice",
            formatarPercentual(
                resumo.indiceMedio
            )
        );
    }


    function definirTexto(
        id,
        valor
    ){

        const elemento =
            estado.raiz?.querySelector(
                `#${id}`
            );


        if(elemento){

            elemento.textContent =
                valor;
        }
    }


    /* ======================================================
       ABAS
    ====================================================== */

    function abrirAba(nome){

        estado.abaAtual =
            nome;


        estado.raiz
            .querySelectorAll(
                "[data-fornecedores-aba]"
            )
            .forEach(
                botao => {

                    const ativa =
                        botao.dataset.fornecedoresAba === nome;


                    botao.classList.toggle(
                        "is-active",
                        ativa
                    );


                    botao.setAttribute(
                        "aria-selected",
                        String(ativa)
                    );
                }
            );


        estado.raiz
            .querySelectorAll(
                "[data-fornecedores-conteudo]"
            )
            .forEach(
                conteudo => {

                    conteudo.hidden =
                        conteudo.dataset.fornecedoresConteudo !== nome;
                }
            );


        if(nome === "geral"){

            requestAnimationFrame(
                () => {

                    estado.graficos.forEach(
                        grafico => {

                            try{

                                grafico.resize();

                            }catch(_erro){
                                /* vazio */
                            }
                        }
                    );
                }
            );
        }
    }


    /* ======================================================
       EVENTOS
    ====================================================== */

    function configurarEventos(){

        const botoes =
            estado.raiz.querySelectorAll(
                "[data-fornecedores-aba]"
            );


        botoes.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirAba(
                            botao.dataset.fornecedoresAba
                        );
                    }
                );
            }
        );


        const pesquisa =
            estado.raiz.querySelector(
                "#fornecedores-pesquisa"
            );


        pesquisa?.addEventListener(
            "input",
            evento => {

                estado.termoBusca =
                    evento.target.value;

                aplicarFiltros();
            }
        );


        const filtro =
            estado.raiz.querySelector(
                "#fornecedores-classificacao"
            );


        filtro?.addEventListener(
            "change",
            evento => {

                estado.filtroClassificacao =
                    evento.target.value;

                aplicarFiltros();
            }
        );


        const corpo =
            estado.raiz.querySelector(
                "#fornecedores-tabela-corpo"
            );


        corpo?.addEventListener(
            "click",
            evento => {

                const linha =
                    evento.target.closest(
                        "tr[data-fornecedor-id]"
                    );


                if(!linha){
                    return;
                }


                selecionarFornecedor(
                    linha.dataset.fornecedorId
                );
            }
        );


        corpo?.addEventListener(
            "keydown",
            evento => {

                if(
                    evento.key !== "Enter" &&
                    evento.key !== " "
                ){
                    return;
                }


                const linha =
                    evento.target.closest(
                        "tr[data-fornecedor-id]"
                    );


                if(!linha){
                    return;
                }


                evento.preventDefault();


                selecionarFornecedor(
                    linha.dataset.fornecedorId
                );
            }
        );
    }


    /* ======================================================
       FILTROS
    ====================================================== */

    function aplicarFiltros(){

        const busca =
            normalizarTexto(
                estado.termoBusca
            );


        const classificacao =
            estado.filtroClassificacao;


        const filtrados =
            [...estado.fornecedores]

            .filter(
                item => {

                    if(!busca){
                        return true;
                    }


                    return normalizarTexto(
                        item.nome
                    ).includes(
                        busca
                    );
                }
            )

            .filter(
                item => {

                    if(
                        !classificacao ||
                        classificacao === "todos"
                    ){
                        return true;
                    }


                    return item.classificacao.slug === classificacao;
                }
            )

            .sort(
                (a,b) =>

                    b.indice -
                    a.indice ||

                    b.processos -
                    a.processos ||

                    b.produtos -
                    a.produtos
            );


        renderizarTabela(
            filtrados
        );


        const selecionadoExiste =
            filtrados.some(
                item =>
                    item.id ===
                    estado.fornecedorSelecionado
            );


        if(!selecionadoExiste){

            selecionarFornecedor(
                filtrados[0]?.id || null
            );

        }else{

            destacarLinhaSelecionada();
        }
    }


    /* ======================================================
       TABELA
    ====================================================== */

    function renderizarTabela(lista){

        const corpo =
            estado.raiz.querySelector(
                "#fornecedores-tabela-corpo"
            );


        if(!corpo){
            return;
        }


        if(!lista.length){

            corpo.innerHTML = `
                <tr>

                    <td
                        colspan="8"
                        class="fornecedores-tabela-vazia"
                    >
                        Nenhum fornecedor encontrado.
                    </td>

                </tr>
            `;

            return;
        }


        corpo.innerHTML =
            lista.map(
                item => {

                    return `
                        <tr
                            data-fornecedor-id="${escaparHtml(item.id)}"
                            tabindex="0"
                        >

                            <td>
                                ${escaparHtml(item.nome)}
                            </td>

                            <td>
                                ${formatarInteiro(item.processos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.produtos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.rncs)}
                            </td>

                            <td>
                                ${formatarInteiro(item.retrabalhos)}
                            </td>

                            <td>
                                ${formatarInteiro(item.reclamacoes)}
                            </td>

                            <td>
                                ${formatarPercentual(item.indice)}
                            </td>

                            <td>

                                <span
                                    class="fornecedor-badge fornecedor-badge--${item.classificacao.slug}"
                                >
                                    ${item.classificacao.label}
                                </span>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


        destacarLinhaSelecionada();
    }


    /* ======================================================
       SELEÇÃO
    ====================================================== */

    function selecionarFornecedor(id){

        estado.fornecedorSelecionado =
            id;


        const fornecedor =
            estado.fornecedores.find(
                item =>
                    item.id === id
            ) || null;


        atualizarDetalhe(
            fornecedor
        );


        destacarLinhaSelecionada();
    }


    function destacarLinhaSelecionada(){

        estado.raiz
            .querySelectorAll(
                "tr[data-fornecedor-id]"
            )
            .forEach(
                linha => {

                    linha.classList.toggle(
                        "is-selected",
                        linha.dataset.fornecedorId ===
                        estado.fornecedorSelecionado
                    );
                }
            );
    }


    /* ======================================================
       DETALHE DO FORNECEDOR
    ====================================================== */

    function atualizarDetalhe(
        fornecedor
    ){

        const nome =
            fornecedor?.nome ||
            "Nenhum fornecedor";


        const indice =
            fornecedor?.indice || 0;


        const classificacao =
            fornecedor?.classificacao ||
            CLASSIFICACOES.critico;


        definirTexto(
            "fornecedor-detalhe-nome",
            nome
        );


        definirTexto(
            "fornecedor-gauge-valor",
            formatarPercentual(
                indice
            )
        );


        definirTexto(
            "fornecedor-gauge-classificacao",
            fornecedor
                ? classificacao.label
                : "—"
        );


        const gauge =
            estado.raiz.querySelector(
                "#fornecedor-gauge"
            );


        if(gauge){

            gauge.style.setProperty(
                "--gauge-valor",
                String(
                    indice * 100
                )
            );


            gauge.style.setProperty(
                "--gauge-cor",
                classificacao.cor
            );
        }


        definirTexto(
            "forn-detalhe-processos",
            formatarInteiro(
                fornecedor?.processos || 0
            )
        );


        definirTexto(
            "forn-detalhe-produtos",
            formatarInteiro(
                fornecedor?.produtos || 0
            )
        );


        definirTexto(
            "forn-detalhe-rncs",
            formatarInteiro(
                fornecedor?.rncs || 0
            )
        );


        definirTexto(
            "forn-detalhe-retrabalhos",
            formatarInteiro(
                fornecedor?.retrabalhos || 0
            )
        );


        definirTexto(
            "forn-detalhe-reclamacoes",
            formatarInteiro(
                fornecedor?.reclamacoes || 0
            )
        );


        const posicao =
            fornecedor
                ? obterPosicaoRanking(
                    fornecedor.id
                )
                : 0;


        definirTexto(
            "forn-detalhe-posicao",
            posicao
                ? `${posicao}º`
                : "—"
        );
    }


    function obterPosicaoRanking(id){

        const ranking =
            [...estado.fornecedores]

            .sort(
                (a,b) =>

                    b.indice -
                    a.indice ||

                    b.processos -
                    a.processos ||

                    b.produtos -
                    a.produtos
            );


        const indice =
            ranking.findIndex(
                item =>
                    item.id === id
            );


        return indice >= 0
            ? indice + 1
            : 0;
    }


    /* ======================================================
       DESTRUIR GRÁFICOS
    ====================================================== */

    function destruirGraficosFornecedores(){

        estado.graficos.forEach(
            grafico => {

                try{

                    grafico.destroy();

                }catch(erro){

                    console.warn(
                        "Não foi possível destruir gráfico de fornecedores.",
                        erro
                    );
                }
            }
        );


        estado.graficos.clear();
    }

    /* ======================================================
       PLUGINS EXCLUSIVOS DOS GRÁFICOS
    ====================================================== */

    const rotuloBarraFornecedores = {

        id:"rotuloBarraFornecedoresUnico",

        afterDatasetsDraw(chart,args,options){

            if(
                chart.config.type !== "bar" ||
                chart.options.indexAxis !== "y"
            ){
                return;
            }

            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            if(!dataset || !meta){
                return;
            }

            const ctx = chart.ctx;
            const sufixo = options?.sufixo || "";

            ctx.save();
            ctx.font = "700 11px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#172033";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";

            meta.data.forEach((barra,indice) => {

                const valor = numero(dataset.data[indice]);

                const texto = sufixo === "%"
                    ? `${Math.round(valor)}%`
                    : formatarInteiro(valor);

                const posicao = barra.tooltipPosition();

                ctx.fillText(
                    texto,
                    posicao.x + 7,
                    posicao.y
                );
            });

            ctx.restore();
        }
    };


    const rotuloRoscaFornecedores = {

        id:"rotuloRoscaFornecedores",

        afterDatasetsDraw(chart){

            if(chart.config.type !== "doughnut"){
                return;
            }

            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            if(!dataset || !meta){
                return;
            }

            const total = dataset.data.reduce(
                (soma,valor) => soma + numero(valor),
                0
            );

            if(!total){
                return;
            }

            const ctx = chart.ctx;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "800 12px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#ffffff";

            meta.data.forEach((arco,indice) => {

                const valor = numero(dataset.data[indice]);

                if(!valor){
                    return;
                }

                const percentual = Math.round((valor / total) * 100);

                // Evita poluir visualmente fatias muito pequenas.
                if(percentual < 5){
                    return;
                }

                const ponto = arco.getCenterPoint();

                ctx.fillText(
                    `${percentual}%`,
                    ponto.x,
                    ponto.y
                );
            });

            ctx.restore();
        },

        afterDraw(chart,args,options){

            if(chart.config.type !== "doughnut"){
                return;
            }

            const total = chart.data.datasets[0].data.reduce(
                (soma,valor) => soma + numero(valor),
                0
            );

            if(!total){
                return;
            }

            const legend = chart.legend;

            if(!legend){
                return;
            }

            const ctx = chart.ctx;
            const x = legend.left + 2;
            const y = Math.min(
                chart.height - 12,
                legend.bottom + 18
            );

            ctx.save();
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "700 11px Segoe UI, Arial, sans-serif";
            ctx.fillStyle = "#172033";
            ctx.fillText(
                `Total de fornecedores: ${formatarInteiro(total)}`,
                x,
                y
            );
            ctx.restore();
        }
    };


    /* ======================================================
       PREPARAR DADOS DOS GRÁFICOS
    ====================================================== */

    function criarGraficos(){

        destruirGraficosFornecedores();

        if(typeof window.Chart === "undefined"){

            mostrarAvisoGraficos(
                "Chart.js não foi carregado."
            );

            return;
        }


        /* ==================================================
           FORNECEDORES COM MAIS RNCs
        ================================================== */

        const maisRncs = [...estado.fornecedores]
            .filter(item => item.rncs > 0)
            .sort((a,b) =>
                b.rncs - a.rncs ||
                b.processos - a.processos
            )
            .slice(0,5);


        /* ==================================================
           PROCESSOS POR FORNECEDOR
        ================================================== */

        const maisProcessos = [...estado.fornecedores]
            .filter(item => item.processos > 0)
            .sort((a,b) =>
                b.processos - a.processos ||
                b.produtos - a.produtos
            )
            .slice(0,5);


        criarGraficoBarras(
            "grafico-fornecedores-rncs",
            maisRncs,
            item => item.rncs,
            CORES.vermelho,
            "",
            null,
            "Quantidade de RNCs"
        );


        criarGraficoClassificacoes();


        criarGraficoBarras(
            "grafico-fornecedores-processos",
            maisProcessos,
            item => item.processos,
            CORES.azul,
            "",
            null,
            "Quantidade de Processos"
        );
    }


    /* ======================================================
       GRÁFICO DE BARRAS
    ====================================================== */

    function criarGraficoBarras(
        idCanvas,
        lista,
        obterValor,
        cor,
        sufixo,
        maximo,
        tituloEixoX = ""
    ){

        const canvas = estado.raiz.querySelector(
            `#${idCanvas}`
        );

        if(!canvas){
            return;
        }

        if(!lista.length){

            mostrarAvisoCanvas(
                canvas,
                "Sem dados para exibir."
            );

            return;
        }

        const valores = lista.map(obterValor);
        const maiorValor = Math.max(...valores,1);

        const limiteX = maximo || Math.max(
            1,
            Math.ceil(maiorValor * 1.12)
        );

        const grafico = new window.Chart(
            canvas,
            {
                type:"bar",

                data:{
                    labels:lista.map(item => item.nome),

                    datasets:[{
                        data:valores,
                        backgroundColor:cor,
                        borderColor:cor,
                        borderWidth:0,
                        borderRadius:1,
                        borderSkipped:false,
                        barThickness:14,
                        maxBarThickness:16,
                        categoryPercentage:.72,
                        datalabels:{
                            display:false
                        }
                    }]
                },

                plugins:[
                    rotuloBarraFornecedores
                ],

                options:{
                    indexAxis:"y",
                    responsive:true,
                    maintainAspectRatio:false,
                    devicePixelRatio:2,

                    animation:{
                        duration:650,
                        easing:"easeOutQuart"
                    },

                    layout:{
                        padding:{
                            top:8,
                            right:44,
                            bottom:2,
                            left:0
                        }
                    },

                    plugins:{
                        legend:{
                            display:false
                        },

                        datalabels:{
                            display:false
                        },

                        rotuloBarraFornecedoresUnico:{
                            sufixo:sufixo
                        },

                        tooltip:{
                            displayColors:false,

                            callbacks:{
                                title(context){
                                    return context[0]?.label || "";
                                },

                                label(context){

                                    if(sufixo === "%"){
                                        return ` ${Math.round(numero(context.raw))}%`;
                                    }

                                    return ` ${formatarInteiro(context.raw)}`;
                                }
                            }
                        }
                    },

                    scales:{
                        x:{
                            beginAtZero:true,
                            max:limiteX,

                            title:{
                                display:Boolean(tituloEixoX),
                                text:tituloEixoX,
                                color:"#374151",
                                padding:{
                                    top:8
                                },
                                font:{
                                    family:"Segoe UI",
                                    size:11,
                                    weight:"600"
                                }
                            },

                            grid:{
                                color:CORES.grade,
                                drawTicks:false
                            },

                            border:{
                                display:true,
                                color:"#cfd6e3",
                                width:1
                            },

                            ticks:{
                                color:CORES.texto,
                                precision:0,
                                padding:7,
                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"500"
                                }
                            }
                        },

                        y:{
                            grid:{
                                display:false
                            },

                            border:{
                                display:false
                            },

                            ticks:{
                                color:"#1f2937",
                                autoSkip:false,
                                padding:9,

                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"500"
                                },

                                callback:function(value){

                                    const label = String(
                                        this.getLabelForValue(value) ?? ""
                                    );

                                    if(label.length > 28){
                                        return `${label.slice(0,28)}…`;
                                    }

                                    return label;
                                }
                            },

                            afterFit(scale){
                                scale.width = 175;
                            }
                        }
                    }
                }
            }
        );

        estado.graficos.set(
            idCanvas,
            grafico
        );
    }


    /* ======================================================
       DISTRIBUIÇÃO POR CLASSIFICAÇÃO
    ====================================================== */

    function criarGraficoClassificacoes(){

        const canvas = estado.raiz.querySelector(
            "#grafico-fornecedores-classificacao"
        );

        if(!canvas){
            return;
        }

        const totais = {
            excelente:0,
            "muito-bom":0,
            atencao:0,
            ruim:0,
            critico:0
        };

        // A distribuição usa todos os fornecedores avaliados.
        estado.fornecedores.forEach(item => {

            const slug = item.classificacao.slug;

            if(totais[slug] !== undefined){
                totais[slug] += 1;
            }
        });

        const configuracoes = [
            {
                slug:"excelente",
                label:"Excelente",
                faixa:"95% - 100%",
                cor:CLASSIFICACOES.excelente.cor
            },
            {
                slug:"muito-bom",
                label:"Muito bom",
                faixa:"90% - 94%",
                cor:CLASSIFICACOES.muitoBom.cor
            },
            {
                slug:"atencao",
                label:"Atenção",
                faixa:"80% - 89%",
                cor:CLASSIFICACOES.atencao.cor
            },
            {
                slug:"ruim",
                label:"Ruim",
                faixa:"70% - 79%",
                cor:CLASSIFICACOES.ruim.cor
            },
            {
                slug:"critico",
                label:"Crítico",
                faixa:"< 70%",
                cor:CLASSIFICACOES.critico.cor
            }
        ];

        const dados = configuracoes.map(
            item => totais[item.slug]
        );

        const total = dados.reduce(
            (soma,valor) => soma + numero(valor),
            0
        );

        if(!total){

            mostrarAvisoCanvas(
                canvas,
                "Sem avaliações para exibir."
            );

            return;
        }

        const grafico = new window.Chart(
            canvas,
            {
                type:"doughnut",

                data:{
                    labels:configuracoes.map(item => item.label),

                    datasets:[{
                        data:dados,
                        backgroundColor:configuracoes.map(item => item.cor),
                        borderColor:"#ffffff",
                        borderWidth:2,
                        hoverOffset:3,
                        datalabels:{
                            display:false
                        }
                    }]
                },

                plugins:[
                    rotuloRoscaFornecedores
                ],

                options:{
                    responsive:true,
                    maintainAspectRatio:false,
                    devicePixelRatio:2,
                    cutout:"58%",
                    radius:"88%",

                    animation:{
                        duration:650,
                        easing:"easeOutQuart"
                    },

                    layout:{
                        padding:{
                            top:4,
                            right:4,
                            bottom:24,
                            left:4
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
                                color:"#1f2937",
                                usePointStyle:false,
                                boxWidth:12,
                                boxHeight:12,
                                padding:14,

                                font:{
                                    family:"Segoe UI",
                                    size:10,
                                    weight:"600"
                                },

                                generateLabels(){

                                    return configuracoes.map((item,indice) => {

                                        const valor = dados[indice];
                                        const percentual = total
                                            ? Math.round((valor / total) * 100)
                                            : 0;

                                        return {
                                            text:`${item.label} (${item.faixa})     ${valor} (${percentual}%)`,
                                            fillStyle:item.cor,
                                            strokeStyle:item.cor,
                                            lineWidth:0,
                                            hidden:false,
                                            index:indice
                                        };
                                    });
                                }
                            },

                            onClick(evento,item,legend){

                                const indice = item.index;
                                const chart = legend.chart;

                                chart.toggleDataVisibility(indice);
                                chart.update();
                            }
                        },

                        tooltip:{
                            displayColors:true,

                            callbacks:{
                                label(context){

                                    const indice = context.dataIndex;
                                    const valor = numero(context.raw);
                                    const percentual = total
                                        ? ((valor / total) * 100)
                                            .toFixed(1)
                                            .replace(".",",")
                                        : "0";

                                    const item = configuracoes[indice];

                                    return (
                                        ` ${item.label}: ` +
                                        `${valor} fornecedores ` +
                                        `(${percentual}%)`
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );

        estado.graficos.set(
            "grafico-fornecedores-classificacao",
            grafico
        );
    }

    /* ======================================================
       AVISOS NOS GRÁFICOS
    ====================================================== */

    function mostrarAvisoGraficos(
        mensagem
    ){

        estado.raiz
            .querySelectorAll(
                ".fornecedores-chart-box"
            )
            .forEach(
                box => {

                    box.innerHTML = `
                        <div class="fornecedores-chart-aviso">
                            ${escaparHtml(mensagem)}
                        </div>
                    `;
                }
            );
    }


    function mostrarAvisoCanvas(
        canvas,
        mensagem
    ){

        const box =
            canvas.parentElement;


        if(!box){
            return;
        }


        box.innerHTML = `
            <div class="fornecedores-chart-aviso">
                ${escaparHtml(mensagem)}
            </div>
        `;
    }


    /* ======================================================
       LOCALIZAR RAIZ
    ====================================================== */

    function encontrarRaiz(
        alvo
    ){

        if(
            typeof Element !==
                "undefined" &&
            alvo instanceof Element
        ){

            return alvo;
        }


        if(
            typeof alvo ===
            "string"
        ){

            return document
                .querySelector(
                    alvo
                );
        }


        return document
            .querySelector(
                "#pagina-fornecedores, .pagina-fornecedores"
            );
    }


    /* ======================================================
       RENDERIZAÇÃO PRINCIPAL
    ====================================================== */

    function renderizarFornecedores(
        entrada,
        alvo
    ){

        const raiz =
            encontrarRaiz(
                alvo
            );


        if(!raiz){

            console.warn(
                "Área da página de fornecedores não encontrada."
            );

            return false;
        }


        destruirGraficosFornecedores();


        const normalizado =
            normalizarEntrada(
                entrada
            );


        estado.raiz =
            raiz;


        estado.dados =
            normalizado.raizDados;


        estado.resumo =
            normalizado.resumo;


        estado.fornecedores =
            normalizado.lista;


        estado.abaAtual =
            "geral";


        estado.termoBusca =
            "";


        estado.filtroClassificacao =
            "todos";


        estado.fornecedorSelecionado =
            null;


        montarEstrutura(
            raiz
        );


        preencherIndicadores();


        configurarEventos();


        aplicarFiltros();


        requestAnimationFrame(
            () => {

                criarGraficos();
            }
        );


        raiz.dataset
            .fornecedoresInicializado =
            "true";


        return true;
    }


    /* ======================================================
       ATUALIZAÇÃO DOS DADOS
    ====================================================== */

    function atualizarFornecedores(
        novosDados
    ){

        if(!estado.raiz){

            return renderizarFornecedores(
                novosDados
            );
        }


        return renderizarFornecedores(
            novosDados,
            estado.raiz
        );
    }


    /* ======================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ====================================================== */

    function tentarInicializacaoAutomatica(){

        const raiz =
            encontrarRaiz();


        if(
            !raiz ||
            raiz.dataset
                .fornecedoresInicializado ===
                "true"
        ){

            return;
        }


        const fonte =

            window.dadosFornecedores ||

            window.dadosPainel
                ?.fornecedores ||

            window.dados
                ?.fornecedores;


        if(fonte){

            renderizarFornecedores(
                fonte,
                raiz
            );
        }
    }


    /* ======================================================
       FUNÇÕES PÚBLICAS
    ====================================================== */

    window.renderizarFornecedores =
        renderizarFornecedores;


    window.inicializarFornecedores =
        renderizarFornecedores;


    window.carregarFornecedores =
        renderizarFornecedores;


    window.atualizarFornecedores =
        atualizarFornecedores;


    window.destruirGraficosFornecedores =
        destruirGraficosFornecedores;


    /* ======================================================
       BOOT
    ====================================================== */

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            tentarInicializacaoAutomatica,
            {
                once:true
            }
        );

    }else{

        tentarInicializacaoAutomatica();
    }


})();


2. fornecedores.css - completo

/* ==========================================================
   PÁGINA — FORNECEDORES
   Visão geral + Avaliação por fornecedor
========================================================== */

.pagina-fornecedores{
    --forn-azul:var(--primary,#0b45d8);
    --forn-azul-escuro:var(--primary-dark,#0736ad);
    --forn-texto:var(--text,#172033);
    --forn-texto-suave:#64748b;
    --forn-linha:var(--line,#dfe5ef);
    --forn-fundo:#f8fafc;
    --forn-verde:#22b955;
    --forn-verde-claro:#84cc16;
    --forn-amarelo:#facc15;
    --forn-laranja:#f97316;
    --forn-vermelho:#ef3340;

    width:100%;
    min-width:0;
    color:var(--forn-texto);
}

.pagina-fornecedores,
.pagina-fornecedores *{
    box-sizing:border-box;
}


/* ==========================================================
   NAVEGAÇÃO INTERNA
========================================================== */

.fornecedores-abas{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    width:100%;
    margin-bottom:12px;
    border:1px solid var(--forn-linha);
    border-radius:10px;
    overflow:hidden;
    background:#fff;
}

.fornecedores-aba{
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:50px;
    padding:11px 18px;
    border:0;
    background:#fff;
    color:var(--forn-azul);
    font:800 14px/1.2 inherit;
    text-transform:uppercase;
    cursor:pointer;
    transition:background-color .2s ease,color .2s ease,box-shadow .2s ease;
}

.fornecedores-aba + .fornecedores-aba{
    border-left:1px solid var(--forn-linha);
}

.fornecedores-aba:hover{
    background:#f3f7ff;
}

.fornecedores-aba.is-active{
    background:linear-gradient(90deg,var(--forn-azul-escuro),var(--forn-azul));
    color:#fff;
    box-shadow:inset 0 -3px 0 rgba(255,255,255,.18);
}

.fornecedores-aba:focus-visible,
.fornecedores-pesquisa input:focus-visible,
.fornecedores-filtro select:focus-visible{
    outline:3px solid rgba(11,69,216,.24);
    outline-offset:2px;
}

.fornecedores-conteudo[hidden]{
    display:none !important;
}


/* ==========================================================
   INDICADORES
========================================================== */

.fornecedores-indicadores{
    display:grid;
    grid-template-columns:repeat(5,minmax(0,1fr));
    gap:10px;
    margin-bottom:12px;
}

.fornecedor-kpi{
    display:grid;
    grid-template-columns:58px minmax(0,1fr);
    grid-template-rows:auto 1fr;
    align-items:center;
    min-width:0;
    min-height:132px;
    padding:16px;
    border:1px solid var(--forn-linha);
    border-radius:10px;
    background:#fff;
    box-shadow:0 3px 12px rgba(15,23,42,.045);
}

.fornecedor-kpi__titulo{
    grid-column:1/-1;
    margin:0 0 11px;
    color:#111827;
    font-size:11px;
    font-weight:800;
    line-height:1.2;
    text-align:center;
    text-transform:uppercase;
}

.fornecedor-kpi__icone{
    display:flex;
    align-items:center;
    justify-content:center;
    width:48px;
    height:48px;
    color:var(--forn-azul);
    font-size:36px;
    line-height:1;
}

.fornecedor-kpi__icone svg{
    display:block;
    width:42px;
    height:42px;
    fill:currentColor;
}

.fornecedor-kpi__icone--azul{color:#1762e8;}
.fornecedor-kpi__icone--vermelho{color:var(--forn-vermelho);}
.fornecedor-kpi__icone--laranja{color:#ff9800;}
.fornecedor-kpi__icone--verde{color:var(--forn-verde);}

.fornecedor-kpi__valor{
    min-width:0;
    color:#1b2134;
    font-size:clamp(31px,2.5vw,46px);
    font-weight:800;
    line-height:1;
    text-align:center;
    white-space:nowrap;
}


/* ==========================================================
   PAINÉIS E GRÁFICOS
========================================================== */

.fornecedores-graficos{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:14px;
}

.fornecedores-panel{
    min-width:0;
    padding:16px 20px 14px;
    border:1px solid var(--forn-linha);
    border-radius:10px;
    background:#fff;
    box-shadow:0 3px 12px rgba(15,23,42,.04);
}

.fornecedores-panel__titulo{
    margin:0 0 10px;
    color:var(--forn-azul-escuro);
    font-size:14px;
    font-weight:800;
    line-height:1.25;
    text-transform:uppercase;
}

.fornecedores-chart-box{
    position:relative;
    width:100%;
    height:290px;
    min-height:290px;
}

.fornecedores-chart-box--rosca{
    height:290px;
}

.fornecedores-chart-box canvas{
    display:block;
    width:100% !important;
    height:100% !important;
}

.fornecedores-chart-aviso{
    display:flex;
    align-items:center;
    justify-content:center;
    height:100%;
    padding:24px;
    color:var(--forn-texto-suave);
    font-size:13px;
    text-align:center;
}


/* ==========================================================
   AVALIAÇÃO POR FORNECEDOR
========================================================== */

.fornecedores-avaliacao-grid{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(280px,330px);
    gap:12px;
    align-items:stretch;
}

.fornecedores-lista-panel,
.fornecedor-detalhe{
    min-width:0;
    border:1px solid var(--forn-linha);
    border-radius:10px;
    background:#fff;
    box-shadow:0 3px 12px rgba(15,23,42,.04);
}

.fornecedores-lista-panel{
    padding:14px;
}

.fornecedores-controles{
    display:grid;
    grid-template-columns:minmax(220px,1fr) minmax(190px,.7fr);
    gap:12px;
    margin-bottom:14px;
}

.fornecedores-pesquisa,
.fornecedores-filtro{
    position:relative;
    display:flex;
    align-items:center;
}

.fornecedores-pesquisa__icone{
    position:absolute;
    left:14px;
    z-index:1;
    width:19px;
    height:19px;
    color:#64748b;
    pointer-events:none;
}

.fornecedores-pesquisa__icone svg,
.fornecedor-metrica__icone svg{
    display:block;
    width:100%;
    height:100%;
    fill:currentColor;
}

.fornecedores-pesquisa input,
.fornecedores-filtro select{
    width:100%;
    height:48px;
    border:1px solid #ccd5e4;
    border-radius:9px;
    background:#fff;
    color:#1f2937;
    font:500 14px/1.2 inherit;
    transition:border-color .2s ease,box-shadow .2s ease;
}

.fornecedores-pesquisa input{
    padding:0 14px 0 44px;
}

.fornecedores-filtro select{
    padding:0 38px 0 14px;
    cursor:pointer;
}

.fornecedores-pesquisa input:focus,
.fornecedores-filtro select:focus{
    border-color:var(--forn-azul);
    box-shadow:0 0 0 3px rgba(11,69,216,.1);
}

.fornecedores-tabela-wrap{
    width:100%;
    max-height:610px;
    overflow:auto;
    border:1px solid var(--forn-linha);
    border-radius:9px;
}

.fornecedores-tabela{
    width:100%;
    min-width:850px;
    border-collapse:separate;
    border-spacing:0;
    font-size:12px;
}

.fornecedores-tabela th,
.fornecedores-tabela td{
    padding:12px 10px;
    border-right:1px solid var(--forn-linha);
    border-bottom:1px solid var(--forn-linha);
    text-align:center;
    vertical-align:middle;
}

.fornecedores-tabela th:last-child,
.fornecedores-tabela td:last-child{
    border-right:0;
}

.fornecedores-tabela tbody tr:last-child td{
    border-bottom:0;
}

.fornecedores-tabela thead th{
    position:sticky;
    top:0;
    z-index:2;
    background:#f8fafc;
    color:#172033;
    font-size:10px;
    font-weight:800;
    line-height:1.2;
    text-transform:uppercase;
    white-space:nowrap;
}

.fornecedores-tabela th:first-child,
.fornecedores-tabela td:first-child{
    min-width:180px;
    text-align:left;
}

.fornecedores-tabela tbody tr{
    background:#fff;
    cursor:pointer;
    transition:background-color .16s ease,color .16s ease;
}

.fornecedores-tabela tbody tr:hover{
    background:#f4f7ff;
}

.fornecedores-tabela tbody tr.is-selected{
    background:#eef5ff;
    color:#0645d8;
}

.fornecedores-tabela tbody tr:focus-visible{
    outline:3px solid rgba(11,69,216,.25);
    outline-offset:-3px;
}

.fornecedores-tabela-vazia{
    padding:34px 16px !important;
    color:var(--forn-texto-suave);
    text-align:center !important;
}

.fornecedor-badge{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-width:86px;
    min-height:30px;
    padding:6px 10px;
    border-radius:8px;
    color:#fff;
    font-size:11px;
    font-weight:800;
    line-height:1;
    white-space:nowrap;
}

.fornecedor-badge--excelente{background:linear-gradient(180deg,#2bc95f,#159542);}
.fornecedor-badge--muito-bom{background:linear-gradient(180deg,#70cc39,#3ca823);}
.fornecedor-badge--atencao{background:linear-gradient(180deg,#ffd94b,#f4b711);color:#392b00;}
.fornecedor-badge--ruim{background:linear-gradient(180deg,#ff8a24,#ed5d0c);}
.fornecedor-badge--critico{background:linear-gradient(180deg,#ff5057,#e8242c);}


/* ==========================================================
   DETALHAMENTO DO FORNECEDOR
========================================================== */

.fornecedor-detalhe{
    display:flex;
    flex-direction:column;
    padding:18px 14px 14px;
}

.fornecedor-detalhe__rotulo{
    margin:0 0 8px;
    color:#4b5563;
    font-size:11px;
    font-weight:700;
    text-align:center;
    text-transform:uppercase;
}

.fornecedor-detalhe__nome{
    margin:0 0 12px;
    color:var(--forn-azul);
    font-size:18px;
    font-weight:800;
    line-height:1.2;
    text-align:center;
    text-transform:uppercase;
}

.fornecedor-gauge{
    --gauge-valor:0;
    --gauge-cor:var(--forn-verde);
    position:relative;
    width:220px;
    height:126px;
    margin:2px auto 16px;
    overflow:hidden;
}

.fornecedor-gauge__arco{
    position:absolute;
    inset:0 0 auto;
    width:220px;
    height:220px;
    border-radius:50%;
    background:conic-gradient(
        from 270deg,
        var(--gauge-cor) 0deg,
        var(--gauge-cor) calc(var(--gauge-valor) * 1.8deg),
        #e5e7eb calc(var(--gauge-valor) * 1.8deg),
        #e5e7eb 180deg,
        transparent 180deg,
        transparent 360deg
    );
}

.fornecedor-gauge__arco::after{
    content:"";
    position:absolute;
    inset:15px;
    border-radius:50%;
    background:#fff;
}

.fornecedor-gauge__conteudo{
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    z-index:1;
    text-align:center;
}

.fornecedor-gauge__valor{
    display:block;
    color:#171d2f;
    font-size:39px;
    font-weight:800;
    line-height:1;
}

.fornecedor-gauge__classificacao{
    display:block;
    margin-top:7px;
    color:var(--gauge-cor);
    font-size:14px;
    font-weight:800;
}

.fornecedor-detalhe__metricas{
    display:grid;
    gap:8px;
    margin-top:2px;
}

.fornecedor-metrica{
    display:grid;
    grid-template-columns:34px minmax(0,1fr) auto;
    align-items:center;
    gap:9px;
    min-height:56px;
    padding:8px 12px;
    border:1px solid var(--forn-linha);
    border-radius:9px;
    background:#fff;
}

.fornecedor-metrica__icone{
    display:flex;
    align-items:center;
    justify-content:center;
    width:30px;
    height:30px;
    color:var(--forn-azul);
    font-size:22px;
}

.fornecedor-metrica__icone--vermelho{color:var(--forn-vermelho);}
.fornecedor-metrica__icone--laranja{color:#ff9800;}
.fornecedor-metrica__icone--roxo{color:#a329e8;}

.fornecedor-metrica__label{
    color:#374151;
    font-size:12px;
    font-weight:600;
}

.fornecedor-metrica__valor{
    min-width:42px;
    padding-left:10px;
    border-left:1px solid var(--forn-linha);
    color:#151b2b;
    font-size:18px;
    font-weight:800;
    text-align:center;
}

/* ==========================================================
   RESPONSIVO
========================================================== */

@media (max-width:1280px){
    .fornecedores-indicadores{
        grid-template-columns:repeat(3,minmax(0,1fr));
    }

    .fornecedor-kpi:nth-child(4),
    .fornecedor-kpi:nth-child(5){
        min-height:112px;
    }

    .fornecedores-avaliacao-grid{
        grid-template-columns:minmax(0,1fr) 280px;
    }
}

@media (max-width:1050px){
    .fornecedores-graficos{
        grid-template-columns:1fr;
    }

    .fornecedores-chart-box{
        height:275px;
    }

    .fornecedores-avaliacao-grid{
        grid-template-columns:1fr;
    }

    .fornecedor-detalhe__metricas{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

}

@media (max-width:760px){
    .fornecedores-abas{
        grid-template-columns:1fr;
    }

    .fornecedores-aba + .fornecedores-aba{
        border-top:1px solid var(--forn-linha);
        border-left:0;
    }

    .fornecedores-indicadores{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .fornecedores-controles{
        grid-template-columns:1fr;
    }

    .fornecedor-detalhe__metricas{
        grid-template-columns:1fr;
    }
}

@media (max-width:480px){
    .fornecedores-indicadores{
        grid-template-columns:1fr;
    }

    .fornecedor-kpi{
        min-height:108px;
    }

    .fornecedores-panel,
    .fornecedores-lista-panel{
        padding:12px 10px;
    }

    .fornecedores-chart-box,
    .fornecedores-chart-box--rosca{
        height:250px;
    }
}

@media (prefers-reduced-motion:reduce){
    .pagina-fornecedores *,
    .pagina-fornecedores *::before,
    .pagina-fornecedores *::after{
        scroll-behavior:auto !important;
        transition:none !important;
    }
}

/* ==========================================================
   DISTRIBUIÇÃO POR ORIGEM
========================================================== */

.fornecedores-panel--origem{
    display:flex;
    flex-direction:column;
    min-height:0;
}

.fornecedores-origem-grid{
    display:grid;
    grid-template-columns:repeat(5,minmax(0,1fr));
    width:100%;
    min-height:210px;
    margin-top:8px;
    border:1px solid var(--forn-linha);
    border-radius:8px;
    overflow:hidden;
    background:#fff;
}

.fornecedores-origem-item{
    display:grid;
    grid-template-rows:minmax(74px,auto) 1fr 1fr;
    align-items:center;
    min-width:0;
    border-right:1px solid var(--forn-linha);
    text-align:center;
}

.fornecedores-origem-item:last-child{
    border-right:0;
}

.fornecedores-origem-item__topo{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:8px;
    min-width:0;
    min-height:74px;
    padding:10px 6px;
    border-bottom:1px solid var(--forn-linha);
    background:#f8fbff;
}

.fornecedores-origem-item__marcador{
    display:block;
    width:22px;
    height:7px;
    border-radius:999px;
    background:var(--origem-cor,#1557d6);
}

.fornecedores-origem-item__label{
    color:#172033;
    font-size:11px;
    font-weight:800;
    line-height:1.15;
}

.fornecedores-origem-item__valor{
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:62px;
    padding:8px 4px;
    border-bottom:1px solid var(--forn-linha);
    color:#172033;
    font-size:clamp(24px,2vw,34px);
    font-weight:800;
    line-height:1;
}

.fornecedores-origem-item__percentual{
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:54px;
    padding:8px 4px;
    color:#f05a28;
    font-size:clamp(20px,1.7vw,29px);
    font-weight:800;
    line-height:1;
}

.fornecedores-origem-total{
    margin-top:12px;
    color:#475569;
    font-size:12px;
    font-weight:600;
    text-align:center;
}

.fornecedores-origem-total strong{
    color:#f05a28;
    font-size:13px;
    font-weight:800;
}

@media (max-width:760px){
    .fornecedores-origem-grid{
        grid-template-columns:1fr;
        min-height:0;
    }

    .fornecedores-origem-item{
        grid-template-columns:minmax(130px,1fr) .65fr .65fr;
        grid-template-rows:1fr;
        border-right:0;
        border-bottom:1px solid var(--forn-linha);
    }

    .fornecedores-origem-item:last-child{
        border-bottom:0;
    }

    .fornecedores-origem-item__topo{
        min-height:58px;
        border-right:1px solid var(--forn-linha);
        border-bottom:0;
    }

    .fornecedores-origem-item__valor{
        min-height:58px;
        border-right:1px solid var(--forn-linha);
        border-bottom:0;
    }

    .fornecedores-origem-item__percentual{
        min-height:58px;
    }
}
