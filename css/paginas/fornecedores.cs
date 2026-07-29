/* ==========================================================
   PÁGINA — FORNECEDORES
========================================================== */


/* ==========================================================
   INDICADORES
========================================================== */

.fornecedores-indicadores{
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:8px;
    margin-bottom:8px;
}

.fornecedores-indicadores > .card{
    width:100%;
    min-width:0;
}


/* ==========================================================
   ÁREA PRINCIPAL
========================================================== */

.fornecedores-grid{
    display:grid;
    grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr);
    gap:8px;
    align-items:stretch;
    margin-bottom:8px;
}

.fornecedores-grid > .panel{
    width:100%;
    min-width:0;
}


/* ==========================================================
   GRÁFICOS
========================================================== */

.fornecedores-chart-box{
    position:relative;
    width:100%;
    min-width:0;
    height:320px;
}

.fornecedores-chart-box canvas{
    width:100% !important;
    height:100% !important;
    max-width:100%;
}


/* ==========================================================
   RANKING
========================================================== */

.fornecedores-ranking{
    display:flex;
    flex-direction:column;
    gap:8px;
}

.fornecedor-item{
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    align-items:center;
    gap:10px;

    padding:10px;

    border:1px solid var(--line2);
    border-radius:8px;

    background:var(--card2);
}

.fornecedor-item-nome{
    font-size:12px;
    font-weight:700;

    color:var(--text);

    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.fornecedor-item-score{
    font-size:14px;
    font-weight:900;

    color:var(--primary-dark);
}


/* ==========================================================
   BARRA DE PROGRESSO
========================================================== */

.fornecedor-barra{
    width:100%;
    height:8px;

    margin-top:6px;

    border-radius:999px;
    overflow:hidden;

    background:var(--line2);
}

.fornecedor-barra span{
    display:block;
    height:100%;

    border-radius:999px;

    background:var(--primary);
}


/* ==========================================================
   TABELA
========================================================== */

.fornecedores-tabela{
    width:100%;
}

.fornecedores-tabela .table-wrap{
    width:100%;
}

.fornecedores-tabela .table-scroll{
    max-height:360px;
    overflow:auto;
}

.fornecedores-tabela table{
    width:100%;
    min-width:760px;
}


/* ==========================================================
   FILTROS
========================================================== */

.fornecedores-filtros{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    margin-bottom:8px;
}

.fornecedores-filtros input,
.fornecedores-filtros select{

    min-height:38px;

    padding:8px 10px;

    border:1px solid var(--line);
    border-radius:8px;

    background:#fff;

    color:var(--text);

    outline:none;
}

.fornecedores-filtros input{

    flex:1;
    min-width:220px;
}

.fornecedores-filtros input:focus,
.fornecedores-filtros select:focus{

    border-color:var(--primary);

    box-shadow:0 0 0 2px rgba(29,78,255,.10);
}


/* ==========================================================
   NOTEBOOK
========================================================== */

@media(max-width:1200px){

    .fornecedores-indicadores{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .fornecedores-grid{
        grid-template-columns:1fr;
    }
}


/* ==========================================================
   TABLET
========================================================== */

@media(max-width:800px){

    .fornecedores-chart-box{
        height:280px;
    }

    .fornecedores-indicadores{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }
}


/* ==========================================================
   CELULAR
========================================================== */

@media(max-width:520px){

    .fornecedores-indicadores{
        grid-template-columns:1fr;
    }

    .fornecedores-chart-box{
        height:240px;
    }

    .fornecedores-filtros{
        flex-direction:column;
    }

    .fornecedores-filtros input,
    .fornecedores-filtros select{
        width:100%;
        min-width:0;
    }

    .fornecedores-tabela .table-scroll{
        max-height:300px;
    }
}
