/* ==========================================================
   MODO APRESENTAÇÃO
   PAINEL DE PROCESSOS SGQ
========================================================== */

(function(){

    "use strict";


    /* ======================================================
       ROTEIRO DA APRESENTAÇÃO

       Cada item representa UMA TELA da apresentação.

       O tempo automático será aplicado individualmente
       a cada uma dessas telas.
    ====================================================== */

    const telasApresentacao = [


        /* ==================================================
           IMPORTAÇÃO
        ================================================== */

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


        /* ==================================================
           ESFIG
        ================================================== */

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


        /* ==================================================
           DESCARTE
        ================================================== */

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


        /* ==================================================
           AMOSTRAS
           Possui somente uma tela.
        ================================================== */

        {
            painel:"amostra",
            subaba:null,

            titulo:"Amostras",
            subtitulo:"Painel de Amostras"
        },


        /* ==================================================
           RETRABALHO
        ================================================== */

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


        /* ==================================================
           FORNECEDORES
        ================================================== */

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
       VERIFICAR SE ESTÁ EM APRESENTAÇÃO
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
       DESCOBRIR PAINEL PRINCIPAL ATUAL
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
       AGUARDAR RENDERIZAÇÃO

       abrirAba() pode carregar dados antes de renderizar.
       Por isso não devemos tentar trocar a subaba
       imediatamente.
    ====================================================== */

    function esperarElemento(
        seletor,
        limite = 2500
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

            const botao =
                tela.subaba === "fluxo"
                    ? await esperarElemento(
                        "#botaoImportacaoFluxo"
                    )
                    : await esperarElemento(
                        "#botaoImportacaoResumo"
                    );


            if(
                typeof window
                    .abrirAbaInternaImportacao ===
                    "function"
            ){

                window
                    .abrirAbaInternaImportacao(
                        tela.subaba,
                        botao
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
             * Compatibilidade:
             * caso o arquivo use outra função,
             * tentamos os botões da própria página.
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
       REDIMENSIONAR GRÁFICOS
    ====================================================== */

    function reajustarPainel(){

        setTimeout(
            function(){

                window.dispatchEvent(
                    new Event("resize")
                );


                if(
                    typeof window.graficoAtual !==
                        "undefined" &&
                    window.graficoAtual &&
                    typeof window.graficoAtual.resize ===
                        "function"
                ){

                    window.graficoAtual.resize();

                }

            },
            120
        );

    }


    /* ======================================================
       ATUALIZAR BARRA
    ====================================================== */

    function atualizarControles(){

        const tela =
            telasApresentacao[
                indiceAtual
            ];


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
       MOSTRAR UMA TELA
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
             * Se já estamos no mesmo painel,
             * não renderizamos tudo novamente.
             *
             * Apenas mudamos a subaba.
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

    function proximaTela(){

        if(trocandoTela){

            return;

        }


        const novoIndice =
            (
                indiceAtual + 1
            ) %
            telasApresentacao.length;


        mostrarTela(
            novoIndice
        );

    }


    /* ======================================================
       TELA ANTERIOR
    ====================================================== */

    function telaAnterior(){

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


        mostrarTela(
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


    function alternarBarra(){

        if(!estaEmApresentacao()){

            return;

        }


        /*
         * Durante o automático,
         * a barra permanece escondida.
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
       PROGRAMAR PRÓXIMA TELA AUTOMÁTICA
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
            Number(
                selectTempo?.value ||
                20000
            );


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


                    programarProximaTela();

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
         * No automático a barra desaparece.
         */

        definirBarraOculta(
            true
        );


        atualizarControles();


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
         * Ao pausar voltamos ao modo manual
         * e mostramos novamente os controles.
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

       Tenta iniciar a apresentação no painel
       que o usuário já está visualizando.
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


        indiceAtual =
            descobrirIndiceInicial();


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
           TELA CHEIA
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

            console.warn(
                "Tela cheia não foi ativada:",
                erro
            );

        }


        /*
         * Garante que a primeira tela do roteiro
         * esteja corretamente posicionada.
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

    btnAnterior?.addEventListener(
        "click",
        telaAnterior
    );


    btnProximo?.addEventListener(
        "click",
        proximaTela
    );


    btnPlay?.addEventListener(
        "click",
        alternarAutomatico
    );


    btnOcultar?.addEventListener(
        "click",
        alternarBarra
    );


    btnFechar?.addEventListener(
        "click",
        fecharModoApresentacao
    );


    /* ======================================================
       ALTERAÇÃO DO TEMPO
    ====================================================== */

    selectTempo?.addEventListener(
        "change",
        function(){

            /*
             * Se alterar o tempo enquanto
             * estiver automático, reiniciamos
             * a contagem a partir da tela atual.
             */

            if(automatico){

                programarProximaTela();

            }

        }
    );


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
               SAIR
            ============================================== */

            if(event.key === "Escape"){

                event.preventDefault();

                fecharModoApresentacao();

                return;

            }


            /*
             * Durante o automático,
             * deixamos somente ESC funcionar.
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
               MOSTRAR / OCULTAR CONTROLES
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
               TAMBÉM MOSTRA / OCULTA
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

       IMPORTANTE:
       ESC normalmente faz o navegador sair do fullscreen.
       Quando isso acontecer, encerramos também o
       modo apresentação.
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
       DISPONIBILIZAR FUNÇÕES GLOBALMENTE
    ====================================================== */

    window.abrirModoApresentacao =
        abrirModoApresentacao;


    window.fecharModoApresentacao =
        fecharModoApresentacao;


    /* ======================================================
       FUNÇÕES AUXILIARES DISPONÍVEIS

       Úteis para integração futura dos painéis.
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

        fechar:
            fecharModoApresentacao

    };


})();
