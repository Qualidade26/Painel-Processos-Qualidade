/* ==========================================================
   APRESENTACAO.JS
   MODO APRESENTAÇÃO — PAINEL DE PROCESSOS SGQ
========================================================== */

(function(){

    "use strict";


    /* ======================================================
       ROTEIRO DA APRESENTAÇÃO

       Cada item abaixo representa UMA tela.

       Ordem:
       01 Importação - Indicadores
       02 Importação - Fluxo
       03 Esfig - Aferições
       04 Esfig - Fluxo
       05 Descarte - Atual
       06 Descarte - Ano
       07 Amostras
       08 Retrabalho
       09 Adequação de Caixa
       10 Fornecedores - Geral
       11 Fornecedores - Avaliação
       12 Informativo
    ====================================================== */

    const telasApresentacao = [

        {
            painel:"importacao",
            subaba:"resumo",
            titulo:"Importação",
            subtitulo:"Indicador de Importação"
        },

        {
            painel:"importacao",
            subaba:"fluxo",
            titulo:"Importação",
            subtitulo:"Fluxo de Inspeção Semanal"
        },

        {
            painel:"esfig",
            subaba:"afericoes",
            titulo:"Esfigmomanômetro",
            subtitulo:"Aferições Anuais por SKU"
        },

        {
            painel:"esfig",
            subaba:"fluxo",
            titulo:"Esfigmomanômetro",
            subtitulo:"Fluxo Operacional"
        },

        {
            painel:"descarte",
            subaba:"atual",
            titulo:"Descarte",
            subtitulo:"Valor Atual"
        },

        {
            painel:"descarte",
            subaba:"descartado",
            titulo:"Descarte",
            subtitulo:"Descartado por Ano"
        },

        {
            painel:"amostra",
            subaba:null,
            titulo:"Amostras",
            subtitulo:"Painel de Amostras"
        },

        {
            painel:"retrabalho",
            subaba:"retrabalho",
            titulo:"Retrabalho",
            subtitulo:"Retrabalho"
        },

        {
            painel:"retrabalho",
            subaba:"adequacao",
            titulo:"Retrabalho",
            subtitulo:"Adequação de Caixa"
        },

        {
            painel:"fornecedores",
            subaba:"geral",
            titulo:"Fornecedores",
            subtitulo:"Visão Geral"
        },

        {
            painel:"fornecedores",
            subaba:"avaliacao",
            titulo:"Fornecedores",
            subtitulo:"Avaliação por Fornecedor"
        },

        {
            painel:"informativo",
            subaba:null,
            titulo:"Informativo",
            subtitulo:"Painel Informativo"
        }

    ];


    /* ======================================================
       ESTADO
    ====================================================== */

    let indiceAtual = 0;

    let automatico = false;

    let timerAutomatico = null;

    let barraOculta = false;

    let trocandoTela = false;


    /* ======================================================
       ELEMENTOS DO INDEX
    ====================================================== */

    const barra =
        document.getElementById(
            "barraApresentacao"
        );


    const btnAnterior =
        document.getElementById(
            "apresAnterior"
        );


    const btnProximo =
        document.getElementById(
            "apresProximo"
        );


    const btnPlay =
        document.getElementById(
            "apresPlay"
        );


    const btnOcultar =
        document.getElementById(
            "apresOcultar"
        );


    const btnFechar =
        document.getElementById(
            "apresFechar"
        );


    const selectTempo =
        document.getElementById(
            "apresTempo"
        );


    const contador =
        document.getElementById(
            "apresContador"
        );


    const nomeProcesso =
        document.getElementById(
            "apresProcesso"
        );


    const nomeSubaba =
        document.getElementById(
            "apresSubaba"
        );


    const modoAtual =
        document.getElementById(
            "apresModoAtual"
        );


    /* ======================================================
       VERIFICAR MODO APRESENTAÇÃO
    ====================================================== */

    function estaEmApresentacao(){

        return document.body.classList.contains(
            "modo-apresentacao"
        );

    }


    /* ======================================================
       LOCALIZAR BOTÃO ORIGINAL DO MENU
    ====================================================== */

    function localizarBotaoOriginal(
        painel
    ){

        return document.querySelector(
            `#menuLateral button[onclick*="abrirAba('${painel}'"]`
        );

    }


    /* ======================================================
       IDENTIFICAR PAINEL ATUAL
    ====================================================== */

    function painelAtual(){

        if(
            typeof window.abaAtual ===
            "string"
        ){

            return window.abaAtual;

        }


        const botaoAtivo =
            document.querySelector(
                "#menuLateral button.active"
            );


        if(!botaoAtivo){

            return null;

        }


        const onclick =
            botaoAtivo.getAttribute(
                "onclick"
            ) || "";


        const encontrada =
            telasApresentacao.find(
                function(tela){

                    return onclick.includes(
                        `'${tela.painel}'`
                    );

                }
            );


        return encontrada
            ? encontrada.painel
            : null;

    }


    /* ======================================================
       AGUARDAR ELEMENTO SER RENDERIZADO
    ====================================================== */

    function esperarElemento(
        seletor,
        limite = 3000
    ){

        return new Promise(
            function(resolve){

                const inicio =
                    Date.now();


                function verificar(){

                    const elemento =
                        document.querySelector(
                            seletor
                        );


                    if(elemento){

                        resolve(elemento);

                        return;

                    }


                    if(
                        Date.now() - inicio >=
                        limite
                    ){

                        resolve(null);

                        return;

                    }


                    requestAnimationFrame(
                        verificar
                    );

                }


                verificar();

            }
        );

    }


    /* ======================================================
       ABRIR SUBABA
    ====================================================== */

    async function abrirSubaba(
        tela
    ){

        if(!tela.subaba){

            return;

        }


      /* ==================================================
   IMPORTAÇÃO
================================================== */

if(
    tela.painel ===
    "importacao"
){

    const seletor =
        tela.subaba === "fluxo"
            ? "#botaoAbaFluxoImportacao"
            : "#botaoAbaResumoImportacao";


    const botao =
        await esperarElemento(
            seletor
        );


    /*
     * Usa o próprio botão da página.
     * Isso garante que o estado interno da
     * Importação também seja atualizado.
     */

    if(botao){

        botao.click();

    }else if(
        typeof window
            .abrirAbaInternaImportacao ===
            "function"
    ){

        /*
         * Fallback caso o botão ainda
         * não tenha sido encontrado.
         */

        window
            .abrirAbaInternaImportacao(
                tela.subaba === "fluxo"
                    ? "fluxo"
                    : "resumo"
            );
    }


    return;
}


        /* ==================================================
           ESFIG
        ================================================== */

        if(
            tela.painel ===
            "esfig"
        ){

            const botao =
                tela.subaba === "fluxo"
                    ? await esperarElemento(
                        "#botaoEsfigFluxo"
                    )
                    : await esperarElemento(
                        "#botaoEsfigAfericoes"
                    );


            if(
                typeof window
                    .abrirAbaInternaEsfig ===
                    "function"
            ){

                window
                    .abrirAbaInternaEsfig(
                        tela.subaba,
                        botao
                    );

            }

            return;

        }


        /* ==================================================
           DESCARTE
        ================================================== */

        if(
            tela.painel ===
            "descarte"
        ){

            await esperarElemento(
                ".pagina-descarte"
            );


            if(
                typeof window
                    .trocarAbaDescarte ===
                    "function"
            ){

                window
                    .trocarAbaDescarte(
                        tela.subaba
                    );

            }

            return;

        }


        /* ==================================================
           RETRABALHO
        ================================================== */

        if(
            tela.painel ===
            "retrabalho"
        ){

            const botao =
                tela.subaba === "adequacao"
                    ? await esperarElemento(
                        "#botaoRetrabalhoAdequacao"
                    )
                    : await esperarElemento(
                        "#botaoRetrabalhoPrincipal"
                    );


            if(
                typeof window
                    .abrirAbaInternaRetrabalho ===
                    "function"
            ){

                window
                    .abrirAbaInternaRetrabalho(
                        tela.subaba,
                        botao
                    );

            }

            return;

        }


        /* ==================================================
           FORNECEDORES
        ================================================== */

        if(
            tela.painel ===
            "fornecedores"
        ){

            await esperarElemento(
                ".pagina-fornecedores"
            );


            /*
             * Primeiro tenta utilizar a função oficial
             * do painel de fornecedores.
             */

            if(
                typeof window
                    .abrirAbaInternaFornecedores ===
                    "function"
            ){

                window
                    .abrirAbaInternaFornecedores(
                        tela.subaba
                    );

                return;

            }


            /*
             * Compatibilidade caso o painel utilize
             * botões internos sem função global.
             */

            const candidatos =
                document.querySelectorAll(
                    ".fornecedores-aba, " +
                    ".forn-aba, " +
                    "[data-fornecedor-aba]"
                );


            candidatos.forEach(
                function(botao){

                    const texto =
                        (
                            botao.textContent ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    const desejaAvaliacao =
                        tela.subaba ===
                        "avaliacao";


                    const corresponde =
                        desejaAvaliacao
                            ? texto.includes(
                                "avalia"
                            )
                            : (
                                texto.includes(
                                    "geral"
                                ) ||
                                texto.includes(
                                    "visão"
                                ) ||
                                texto.includes(
                                    "visao"
                                )
                            );


                    if(corresponde){

                        botao.click();

                    }

                }
            );

        }

    }


    /* ======================================================
       REAJUSTAR PAINEL / GRÁFICOS
    ====================================================== */

    function reajustarPainel(){

        setTimeout(
            function(){

                window.dispatchEvent(
                    new Event("resize")
                );


                /*
                 * Compatibilidade com gráfico global.
                 */

                if(
                    typeof window.graficoAtual !==
                        "undefined" &&
                    window.graficoAtual &&
                    typeof window.graficoAtual.resize ===
                        "function"
                ){

                    window.graficoAtual.resize();

                }


                /*
                 * Reajusta todos os gráficos Chart.js
                 * existentes na página.
                 */

                if(
                    typeof Chart !==
                        "undefined" &&
                    Chart.instances
                ){

                    Object.values(
                        Chart.instances
                    ).forEach(
                        function(grafico){

                            if(
                                grafico &&
                                typeof grafico.resize ===
                                    "function"
                            ){

                                grafico.resize();

                            }

                        }
                    );

                }

            },
            150
        );

    }


    /* ======================================================
       ATUALIZAR CONTROLES
    ====================================================== */

    function atualizarControles(){

        const tela =
            telasApresentacao[
                indiceAtual
            ];


        if(!tela){

            return;

        }


        if(contador){

            contador.textContent =
                `${indiceAtual + 1} / ` +
                `${telasApresentacao.length}`;

        }


        if(nomeProcesso){

            nomeProcesso.textContent =
                tela.titulo;

        }


        if(nomeSubaba){

            nomeSubaba.textContent =
                tela.subtitulo;

        }


        if(modoAtual){

            modoAtual.textContent =
                automatico
                    ? "Automático"
                    : "Manual";

        }


        if(btnPlay){

            btnPlay.textContent =
                automatico
                    ? "⏸ Pausar automático"
                    : "▶ Iniciar automático";

        }

    }


    /* ======================================================
       MOSTRAR TELA
    ====================================================== */

    async function mostrarTela(
        indice
    ){

        if(trocandoTela){

            return;

        }


        if(
            indice < 0 ||
            indice >=
                telasApresentacao.length
        ){

            return;

        }


        trocandoTela = true;

        indiceAtual = indice;


        const tela =
            telasApresentacao[
                indiceAtual
            ];


        atualizarControles();


        try{

            const atual =
                painelAtual();


            /*
             * Se mudou o painel principal,
             * utiliza abrirAba().
             *
             * Se continua no mesmo painel,
             * somente muda a subaba.
             */

            if(
                atual !== tela.painel
            ){

                const botaoOriginal =
                    localizarBotaoOriginal(
                        tela.painel
                    );


                if(
                    typeof window.abrirAba ===
                    "function"
                ){

                    await window.abrirAba(
                        tela.painel,
                        botaoOriginal
                    );

                }

            }


            await abrirSubaba(
                tela
            );


            reajustarPainel();

        }catch(erro){

            console.error(
                "Erro ao trocar tela da apresentação:",
                erro
            );

        }finally{

            trocandoTela = false;

        }

    }


    /* ======================================================
       PRÓXIMA TELA
    ====================================================== */

    async function proximaTela(){

        if(trocandoTela){

            return;

        }


        const novoIndice =
            (
                indiceAtual + 1
            ) %
            telasApresentacao.length;


        await mostrarTela(
            novoIndice
        );

    }


    /* ======================================================
       TELA ANTERIOR
    ====================================================== */

    async function telaAnterior(){

        if(trocandoTela){

            return;

        }


        const novoIndice =
            (
                indiceAtual -
                1 +
                telasApresentacao.length
            ) %
            telasApresentacao.length;


        await mostrarTela(
            novoIndice
        );

    }


    /* ======================================================
       MOSTRAR / OCULTAR BARRA
    ====================================================== */

    function definirBarraOculta(
        ocultar
    ){

        barraOculta =
            Boolean(ocultar);


        if(barra){

            barra.classList.toggle(
                "oculta",
                barraOculta
            );


            barra.setAttribute(
                "aria-hidden",
                barraOculta
                    ? "true"
                    : "false"
            );

        }


        document.body.classList.toggle(
            "barra-apresentacao-oculta",
            barraOculta
        );


        reajustarPainel();

    }


    /* ======================================================
       ALTERNAR BARRA NO MODO MANUAL
    ====================================================== */

    function alternarBarra(){

        if(!estaEmApresentacao()){

            return;

        }


        /*
         * No automático a barra deve permanecer
         * escondida até o automático ser pausado.
         */

        if(automatico){

            return;

        }


        definirBarraOculta(
            !barraOculta
        );

    }


    /* ======================================================
       CANCELAR TIMER
    ====================================================== */

    function cancelarTimer(){

        if(timerAutomatico){

            clearTimeout(
                timerAutomatico
            );

            timerAutomatico = null;

        }

    }


    /* ======================================================
       OBTER TEMPO SELECIONADO
    ====================================================== */

    function obterTempo(){

        const valor =
            Number(
                selectTempo?.value
            );


        /*
         * Valores aceitos:
         * 5, 10, 15 ou 20 segundos.
         *
         * O HTML pode fornecer em milissegundos
         * (5000, 10000...) ou segundos (5, 10...).
         */

        if(
            valor === 5 ||
            valor === 10 ||
            valor === 15 ||
            valor === 20
        ){

            return valor * 1000;

        }


        if(
            valor === 5000 ||
            valor === 10000 ||
            valor === 15000 ||
            valor === 20000
        ){

            return valor;

        }


        return 20000;

    }


    /* ======================================================
       PROGRAMAR PRÓXIMA TELA
    ====================================================== */

    function programarProximaTela(){

        cancelarTimer();


        if(
            !automatico ||
            !estaEmApresentacao()
        ){

            return;

        }


        const tempo =
            obterTempo();


        timerAutomatico =
            setTimeout(
                async function(){

                    if(
                        !automatico ||
                        !estaEmApresentacao()
                    ){

                        return;

                    }


                    const novoIndice =
                        (
                            indiceAtual + 1
                        ) %
                        telasApresentacao.length;


                    await mostrarTela(
                        novoIndice
                    );


                    /*
                     * O próximo tempo começa somente
                     * depois que a tela terminou de abrir.
                     */

                    if(automatico){

                        programarProximaTela();

                    }

                },
                tempo
            );

    }


    /* ======================================================
       INICIAR AUTOMÁTICO
    ====================================================== */

    function iniciarAutomatico(){

        if(!estaEmApresentacao()){

            return;

        }


        cancelarTimer();


        automatico = true;


        document.body.classList.add(
            "modo-apresentacao-automatico"
        );


        /*
         * Automaticamente esconde a barra.
         */

        definirBarraOculta(
            true
        );


        atualizarControles();


        /*
         * A tela que está aberta também respeita
         * o tempo selecionado antes da troca.
         */

        programarProximaTela();

    }


    /* ======================================================
       PARAR AUTOMÁTICO
    ====================================================== */

    function pararAutomatico(){

        cancelarTimer();


        automatico = false;


        document.body.classList.remove(
            "modo-apresentacao-automatico"
        );


        /*
         * Voltando ao manual,
         * os controles reaparecem.
         */

        if(estaEmApresentacao()){

            definirBarraOculta(
                false
            );

        }


        atualizarControles();

    }


    /* ======================================================
       PLAY / PAUSE
    ====================================================== */

    function alternarAutomatico(){

        if(automatico){

            pararAutomatico();

        }else{

            iniciarAutomatico();

        }

    }


    /* ======================================================
       DESCOBRIR TELA INICIAL
    ====================================================== */

    function descobrirIndiceInicial(){

        const atual =
            painelAtual();


        if(!atual){

            return 0;

        }


        const indice =
            telasApresentacao.findIndex(
                function(tela){

                    return tela.painel ===
                        atual;

                }
            );


        return indice >= 0
            ? indice
            : 0;

    }


    /* ======================================================
       ENTRAR NO MODO APRESENTAÇÃO
    ====================================================== */

    async function abrirModoApresentacao(){

        if(estaEmApresentacao()){

            return;

        }


        cancelarTimer();


        automatico = false;

        barraOculta = false;


       indiceAtual = 0;


        document.body.classList.add(
            "modo-apresentacao"
        );


        document.body.classList.remove(
            "modo-apresentacao-automatico",
            "barra-apresentacao-oculta"
        );


        if(barra){

            barra.classList.remove(
                "oculta"
            );


            barra.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        atualizarControles();


        /* ==================================================
           ENTRAR EM TELA CHEIA
        ================================================== */

        try{

            if(
                !document.fullscreenElement &&
                document.documentElement
                    .requestFullscreen
            ){

                await document
                    .documentElement
                    .requestFullscreen();

            }

        }catch(erro){

            /*
             * Se o navegador impedir fullscreen,
             * a apresentação continua normalmente.
             */

            console.warn(
                "Tela cheia não foi ativada:",
                erro
            );

        }


        /*
         * Abre a tela correspondente ao painel
         * que o usuário estava visualizando.
         */

        await mostrarTela(
            indiceAtual
        );


        reajustarPainel();

    }


    /* ======================================================
       SAIR DO MODO APRESENTAÇÃO
    ====================================================== */

    async function fecharModoApresentacao(){

        cancelarTimer();


        automatico = false;

        barraOculta = false;


        document.body.classList.remove(
            "modo-apresentacao",
            "modo-apresentacao-automatico",
            "barra-apresentacao-oculta"
        );


        if(barra){

            barra.classList.remove(
                "oculta"
            );


            barra.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        atualizarControles();


        /* ==================================================
           SAIR DA TELA CHEIA
        ================================================== */

        try{

            if(
                document.fullscreenElement &&
                document.exitFullscreen
            ){

                await document
                    .exitFullscreen();

            }

        }catch(erro){

            console.warn(
                "Não foi possível sair da tela cheia:",
                erro
            );

        }


        reajustarPainel();

    }


    /* ======================================================
       EVENTOS DOS BOTÕES
    ====================================================== */

    if(btnAnterior){

        btnAnterior.addEventListener(
            "click",
            telaAnterior
        );

    }


    if(btnProximo){

        btnProximo.addEventListener(
            "click",
            proximaTela
        );

    }


    if(btnPlay){

        btnPlay.addEventListener(
            "click",
            alternarAutomatico
        );

    }


    if(btnOcultar){

        btnOcultar.addEventListener(
            "click",
            alternarBarra
        );

    }


    if(btnFechar){

        btnFechar.addEventListener(
            "click",
            fecharModoApresentacao
        );

    }


    /* ======================================================
       ALTERAÇÃO DO TEMPO
    ====================================================== */

    if(selectTempo){

        selectTempo.addEventListener(
            "change",
            function(){

                /*
                 * Se o tempo for alterado durante
                 * o automático, reinicia a contagem
                 * da tela atual.
                 */

                if(automatico){

                    programarProximaTela();

                }

            }
        );

    }


    /* ======================================================
       TECLADO
    ====================================================== */

    document.addEventListener(
        "keydown",
        function(event){

            if(!estaEmApresentacao()){

                return;

            }


            /* ==============================================
               ESC
               SAIR DA APRESENTAÇÃO
            ============================================== */

            if(event.key === "Escape"){

                event.preventDefault();

                fecharModoApresentacao();

                return;

            }


            /*
             * Durante o automático:
             *
             * ESC continua funcionando.
             *
             * As setas não alteram as telas.
             */

            if(automatico){

                return;

            }


            /* ==============================================
               SETA DIREITA
            ============================================== */

            if(
                event.key ===
                "ArrowRight"
            ){

                event.preventDefault();

                proximaTela();

                return;

            }


            /* ==============================================
               SETA ESQUERDA
            ============================================== */

            if(
                event.key ===
                "ArrowLeft"
            ){

                event.preventDefault();

                telaAnterior();

                return;

            }


            /* ==============================================
               SETA PARA BAIXO
               MOSTRAR / OCULTAR BARRA
            ============================================== */

            if(
                event.key ===
                "ArrowDown"
            ){

                event.preventDefault();

                alternarBarra();

                return;

            }


            /* ==============================================
               SETA PARA CIMA
               MOSTRAR / OCULTAR BARRA
            ============================================== */

            if(
                event.key ===
                "ArrowUp"
            ){

                event.preventDefault();

                alternarBarra();

                return;

            }

        }
    );


    /* ======================================================
       FULLSCREENCHANGE

       Se o navegador sair do fullscreen pelo ESC,
       o modo apresentação também é encerrado.
    ====================================================== */

    document.addEventListener(
        "fullscreenchange",
        function(){

            if(
                estaEmApresentacao() &&
                !document.fullscreenElement
            ){

                cancelarTimer();


                automatico = false;

                barraOculta = false;


                document.body.classList.remove(
                    "modo-apresentacao",
                    "modo-apresentacao-automatico",
                    "barra-apresentacao-oculta"
                );


                if(barra){

                    barra.classList.remove(
                        "oculta"
                    );


                    barra.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }


                reajustarPainel();

            }

        }
    );


    /* ======================================================
       FUNÇÕES GLOBAIS
    ====================================================== */

    window.abrirModoApresentacao =
        abrirModoApresentacao;


    window.fecharModoApresentacao =
        fecharModoApresentacao;


    /* ======================================================
       API DO MODO APRESENTAÇÃO

       Também será utilizada posteriormente
       pelo Descarte para saber se está sendo
       visualizado em apresentação.
    ====================================================== */

    window.apresentacaoSGQ = {

        estaAtiva:
            estaEmApresentacao,

        proxima:
            proximaTela,

        anterior:
            telaAnterior,

        alternarBarra:
            alternarBarra,

        iniciarAutomatico:
            iniciarAutomatico,

        pararAutomatico:
            pararAutomatico,

        fechar:
            fecharModoApresentacao,

        getTelaAtual:
            function(){

                return telasApresentacao[
                    indiceAtual
                ];

            },

        getIndiceAtual:
            function(){

                return indiceAtual;

            },

        getTotalTelas:
            function(){

                return telasApresentacao.length;

            }

    };


})();
