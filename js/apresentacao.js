/* ==========================================================
   MODO APRESENTAÇÃO
   PAINEL DE PROCESSOS SGQ
========================================================== */

(function(){

    "use strict";


    /* ======================================================
       CONFIGURAÇÃO DAS TELAS
    ====================================================== */

    const telasApresentacao = [

        {
            id:"importacao",
            titulo:"Importação"
        },

        {
            id:"esfig",
            titulo:"ESFIG"
        },

        {
            id:"descarte",
            titulo:"Descarte"
        },

        {
            id:"amostra",
            titulo:"Amostras"
        },

        {
            id:"retrabalho",
            titulo:"Retrabalho"
        },

        {
            id:"fornecedores",
            titulo:"Fornecedores"
        },

        {
            id:"informativo",
            titulo:"Informativo"
        }

    ];


    /* ======================================================
       ESTADO
    ====================================================== */

    let indiceAtual = 0;

    let automatico = false;

    let timerAutomatico = null;


    /* ======================================================
       ELEMENTOS
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

    const btnSair =
        document.getElementById(
            "apresSair"
        );

    const selectTempo =
        document.getElementById(
            "apresTempo"
        );

    const contador =
        document.getElementById(
            "apresContador"
        );

    const nomeTela =
        document.getElementById(
            "apresNome"
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
       LOCALIZAR BOTÃO ORIGINAL DA ABA
    ====================================================== */

    function localizarBotaoOriginal(id){

        return document.querySelector(
            `#menuLateral button[onclick*="abrirAba('${id}'"]`
        );

    }


    /* ======================================================
       ABRIR UMA TELA
    ====================================================== */

    function mostrarTela(indice){

        if(
            indice < 0 ||
            indice >= telasApresentacao.length
        ){

            return;

        }


        indiceAtual = indice;


        const tela =
            telasApresentacao[indiceAtual];


        const botaoOriginal =
            localizarBotaoOriginal(
                tela.id
            );


        /*
         * Utilizamos a MESMA função do painel.
         * Não recriamos nenhuma aba.
         */

        if(
            typeof window.abrirAba === "function"
        ){

            window.abrirAba(
                tela.id,
                botaoOriginal
            );

        }


        atualizarControles();


        /*
         * Chart.js precisa perceber
         * o novo tamanho disponível.
         */

        setTimeout(function(){

            window.dispatchEvent(
                new Event("resize")
            );

        },150);

    }


    /* ======================================================
       ATUALIZAR CONTROLES
    ====================================================== */

    function atualizarControles(){

        const tela =
            telasApresentacao[indiceAtual];


        if(contador){

            contador.textContent =
                `${indiceAtual + 1} / ${telasApresentacao.length}`;

        }


        if(nomeTela){

            nomeTela.textContent =
                tela.titulo;

        }


        document
            .querySelectorAll(
                "[data-apres-aba]"
            )
            .forEach(function(botao){

                botao.classList.toggle(
                    "ativo",
                    botao.dataset.apresAba ===
                        tela.id
                );

            });

    }


    /* ======================================================
       PRÓXIMA TELA
    ====================================================== */

    function proximaTela(){

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
       PARAR AUTOMÁTICO
    ====================================================== */

    function pararAutomatico(){

        automatico = false;


        if(timerAutomatico){

            clearInterval(
                timerAutomatico
            );

            timerAutomatico = null;

        }


        if(btnPlay){

            btnPlay.textContent =
                "▶ Automático";

        }

    }


    /* ======================================================
       INICIAR AUTOMÁTICO
    ====================================================== */

    function iniciarAutomatico(){

        pararAutomatico();


        automatico = true;


        const tempo =
            Number(
                selectTempo?.value ||
                20000
            );


        timerAutomatico =
            setInterval(
                proximaTela,
                tempo
            );


        if(btnPlay){

            btnPlay.textContent =
                "⏸ Pausar";

        }

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
       ENTRAR NO MODO APRESENTAÇÃO
    ====================================================== */

    async function abrirModoApresentacao(){

        document.body.classList.add(
            "modo-apresentacao"
        );


        if(barra){

            barra.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        /*
         * Tenta entrar em tela cheia.
         * Se o navegador bloquear,
         * o modo apresentação continua funcionando.
         */

        try{

            if(
                !document.fullscreenElement &&
                document.documentElement.requestFullscreen
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
         * Descobre qual aba está ativa.
         */

        const botaoAtivo =
            document.querySelector(
                "#menuLateral button.active"
            );


        if(botaoAtivo){

            const onclick =
                botaoAtivo.getAttribute(
                    "onclick"
                ) || "";


            const encontrada =
                telasApresentacao.findIndex(
                    function(tela){

                        return onclick.includes(
                            `'${tela.id}'`
                        );

                    }
                );


            if(encontrada >= 0){

                indiceAtual =
                    encontrada;

            }

        }


        atualizarControles();


        setTimeout(function(){

            window.dispatchEvent(
                new Event("resize")
            );

        },200);

    }


    /* ======================================================
       SAIR DO MODO APRESENTAÇÃO
    ====================================================== */

    async function fecharModoApresentacao(){

        pararAutomatico();


        document.body.classList.remove(
            "modo-apresentacao"
        );


        if(barra){

            barra.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        try{

            if(
                document.fullscreenElement &&
                document.exitFullscreen
            ){

                await document.exitFullscreen();

            }

        }catch(erro){

            console.warn(
                "Não foi possível sair da tela cheia:",
                erro
            );

        }


        setTimeout(function(){

            window.dispatchEvent(
                new Event("resize")
            );

        },200);

    }


    /* ======================================================
       CLIQUES DAS ABAS INFERIORES
    ====================================================== */

    document
        .querySelectorAll(
            "[data-apres-aba]"
        )
        .forEach(function(botao){

            botao.addEventListener(
                "click",
                function(){

                    const id =
                        this.dataset.apresAba;


                    const indice =
                        telasApresentacao.findIndex(
                            function(tela){

                                return tela.id === id;

                            }
                        );


                    if(indice >= 0){

                        mostrarTela(
                            indice
                        );

                    }

                }
            );

        });


    /* ======================================================
       EVENTOS
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


    btnSair?.addEventListener(
        "click",
        fecharModoApresentacao
    );


    selectTempo?.addEventListener(
        "change",
        function(){

            if(automatico){

                iniciarAutomatico();

            }

        }
    );


    /* ======================================================
       TECLADO
    ====================================================== */

    document.addEventListener(
        "keydown",
        function(event){

            if(
                !estaEmApresentacao()
            ){

                return;

            }


            if(
                event.key ===
                "ArrowRight"
            ){

                proximaTela();

            }


            if(
                event.key ===
                "ArrowLeft"
            ){

                telaAnterior();

            }


            if(
                event.key ===
                "Escape"
            ){

                fecharModoApresentacao();

            }


            if(
                event.key === " " ||
                event.code === "Space"
            ){

                event.preventDefault();

                alternarAutomatico();

            }

        }
    );


    /* ======================================================
       SE O USUÁRIO SAIR DO FULLSCREEN PELO NAVEGADOR
    ====================================================== */

    document.addEventListener(
        "fullscreenchange",
        function(){

            if(
                estaEmApresentacao() &&
                !document.fullscreenElement
            ){

                pararAutomatico();

                document.body.classList.remove(
                    "modo-apresentacao"
                );

            }

        }
    );


    /* ======================================================
       DISPONIBILIZAR FUNÇÃO GLOBAL
    ====================================================== */

    window.abrirModoApresentacao =
        abrirModoApresentacao;


    window.fecharModoApresentacao =
        fecharModoApresentacao;

})();
