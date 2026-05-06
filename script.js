/**
 * Diagnóstico Empresarial 2026
 */

// --- 1. CONFIGURATION & DATA ---

const questionsData = [
    { category: 'Clareza Estratégica', text: 'De 0 a 10, quanto você sente que tem clareza da direção do seu negócio (metas, prioridades e próximos passos)?' },
    { category: 'Canais de Venda', text: 'De 0 a 10, quanto sua empresa possui canais de venda estruturados e ativos (indicação, redes sociais, equipe comercial, parcerias, etc.)?' },
    { category: 'Geração de Vendas', text: 'De 0 a 10, quanto você acredita que seu negócio tem uma estratégia consistente para gerar novas vendas?' },
    { category: 'Venda de Valor', text: 'De 0 a 10, quanto seu time está preparado para vender valor, sem depender de desconto ou preço baixo?' },
    { category: 'Lucratividade', text: 'De 0 a 10, quanto você está satisfeito com a lucratividade real da sua empresa?' },
    { category: 'Liderança', text: 'De 0 a 10, quanto sua empresa possui lideranças preparadas para tomar decisão e sustentar o crescimento?' },
    { category: 'Comprometimento da Equipe', text: 'De 0 a 10, quanto sua equipe está engajada, comprometida e alinhada com resultados?' },
    { category: 'Independência do Dono', text: 'De 0 a 10, quanto o seu negócio funciona sem depender diretamente de você no dia a dia? (quanto maior a nota, menor a dependência)' },
    { category: 'Organização e Gestão', text: 'De 0 a 10, quanto sua empresa possui processos, gestão e organização estruturados?' },
    { category: 'Capacidade de Crescimento', text: 'De 0 a 10, quanto você sente que sua empresa está preparada para crescer de forma estruturada em 2026?' }
];

const categories = questionsData.map(q => q.category);

// --- 2. STATE MANAGEMENT ---

let currentQuestionIndex = 0;
let userAnswers = new Array(questionsData.length).fill(5);
let leadData = null;
let radarChartInstance = null;

// --- 3. DOM ELEMENTS ---

const screens = {
    welcome: document.getElementById('screen-welcome'),
    quiz: document.getElementById('screen-quiz'),
    lead: document.getElementById('screen-lead'),
    result: document.getElementById('screen-result')
};

const questionText = document.getElementById('question-text');
const categoryBadge = document.getElementById('category-badge');
const progressFill = document.getElementById('progress-fill');
const progressCount = document.getElementById('progress-count');
const totalCount = document.getElementById('total-count');
const slider = document.getElementById('answer-slider');
const sliderValue = document.getElementById('slider-value');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const questionCard = document.getElementById('question-card');

const btnStart = document.getElementById('btn-start');
const leadForm = document.getElementById('lead-form');
const btnRestart = document.getElementById('btn-restart');

const scoresList = document.getElementById('scores-list');
const analysisList = document.getElementById('analysis-list');
const ctxRadar = document.getElementById('radarChart');
const btnDownloadPdf = document.getElementById('btn-download-pdf');

// --- 4. INITIALIZATION ---

function init() {
    totalCount.textContent = questionsData.length;

    btnStart.addEventListener('click', startQuiz);
    btnNext.addEventListener('click', handleNext);
    btnPrev.addEventListener('click', handlePrev);

    slider.addEventListener('input', (e) => {
        const val = e.target.value;
        sliderValue.textContent = val;
        userAnswers[currentQuestionIndex] = parseInt(val, 10);
        updateSliderVisuals(val);
    });

    leadForm.addEventListener('submit', handleLeadSubmit);
    btnRestart.addEventListener('click', restartDiagnosis);
    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', handleDownloadPdf);
    }
}

// --- 5. SCREEN TRANSITIONS ---

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    setTimeout(() => {
        screens[screenName].classList.add('active');
    }, 10);
    window.scrollTo(0, 0);
}

// --- 6. QUIZ LOGIC ---

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(questionsData.length).fill(5);
    renderQuestion();
    showScreen('quiz');
}

function renderQuestion() {
    const q = questionsData[currentQuestionIndex];

    questionCard.classList.remove('fade-in');
    void questionCard.offsetWidth;
    questionCard.classList.add('fade-in');

    questionText.textContent = q.text;
    categoryBadge.textContent = q.category;
    progressCount.textContent = currentQuestionIndex + 1;

    const percentage = ((currentQuestionIndex) / questionsData.length) * 100;
    progressFill.style.width = `${Math.max(4, percentage)}%`;

    const savedVal = userAnswers[currentQuestionIndex];
    slider.value = savedVal;
    sliderValue.textContent = savedVal;
    updateSliderVisuals(savedVal);

    btnPrev.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';

    if (currentQuestionIndex === questionsData.length - 1) {
        btnNext.textContent = 'Concluir Diagnóstico';
    } else {
        btnNext.textContent = 'Próxima Pergunta';
    }
}

function updateSliderVisuals(val) {
    const percent = (val / 10) * 100;
    slider.style.background = `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${percent}%, #E2E8F0 ${percent}%, #E2E8F0 100%)`;
}

function handleNext() {
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        progressFill.style.width = '100%';
        setTimeout(() => {
            showScreen('lead');
        }, 400);
    }
}

function handlePrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// --- 7. LEAD CAPTURE ---

function handleLeadSubmit(e) {
    e.preventDefault();

    leadData = {
        name: document.getElementById('lead-name').value,
        company: document.getElementById('lead-company').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        revenue: document.getElementById('lead-revenue').value,
        goal: document.getElementById('lead-goal').value,
        date: new Date().toISOString()
    };

    generateResults();
    sendReportEmail();
}

// --- 8. CALCULATIONS & RESULTS ---

function calculateTotal() {
    return userAnswers.reduce((sum, val) => sum + val, 0);
}

function calculateScores() {
    const scores = {};
    questionsData.forEach((q, idx) => {
        scores[q.category] = userAnswers[idx];
    });
    scores['Total'] = calculateTotal();
    return scores;
}

function getOverallStatus(total) {
    if (total <= 40) return { id: 'pressure',      text: 'Negócio Sob Pressão',        labelClass: 'status-critical',   indicatorClass: 'indicator-critical' };
    if (total <= 70) return { id: 'disorganized',  text: 'Crescimento Desorganizado',   labelClass: 'status-developing', indicatorClass: 'indicator-developing' };
    if (total <= 85) return { id: 'consolidating', text: 'Negócio em Consolidação',     labelClass: 'status-developing', indicatorClass: 'indicator-developing' };
    return              { id: 'scaling',       text: 'Pronto para Escalar',         labelClass: 'status-strong',     indicatorClass: 'indicator-strong' };
}

const analysisDict = {
    pressure: {
        description: 'Seu negócio está operando no limite. Existem muitos problemas e urgências para resolver, vendas inconsistentes e baixa lucratividade.',
        signs: ['Excesso de problemas e urgências', 'Equipe não sustenta o crescimento', 'Vendas inconsistentes', 'Baixa lucratividade'],
        conclusion: 'Alto risco de estagnação ou queda. Esses são exatamente os pontos que, quando ajustados, fazem empresas aumentarem faturamento, lucro e organização.'
    },
    disorganized: {
        description: 'Você já construiu uma base, mas ainda existem pontos que estão limitando um crescimento mais consistente e lucrativo.',
        signs: ['Canais de venda pouco estruturados', 'Dependência do dono', 'Equipe ainda não preparada', 'Crescimento com muito esforço'],
        conclusion: 'Cresce, mas não escala. Esses são exatamente os pontos que, quando ajustados, fazem empresas aumentarem faturamento, lucro e organização.'
    },
    consolidating: {
        description: 'Você já construiu uma base sólida. Existe gestão, canais de venda funcionando e equipe em evolução.',
        signs: ['Já existe gestão', 'Canais de venda funcionando', 'Equipe em evolução', 'Ainda existem gargalos em liderança e escala'],
        conclusion: 'Você está próximo de um novo nível. Com os ajustes certos, pode acelerar o crescimento de forma estruturada.'
    },
    scaling: {
        description: 'Seu negócio tem estrutura para crescer forte, com múltiplos canais de venda ativos e liderança funcionando.',
        signs: ['Múltiplos canais de venda ativos', 'Liderança funcionando', 'Operação menos dependente do dono', 'Base estruturada para expansão'],
        conclusion: 'Agora o jogo é crescimento estratégico. O próximo passo é acelerar com inteligência.'
    }
};

function generateResults() {
    showScreen('result');
    const scores = calculateScores();

    renderRadarChart(scores);
    renderScoresList(scores);
    renderTextualAnalysis(scores);
    renderGeneralScore(scores);
    renderCTA(scores);
}

function renderCTA(scores) {
    const total = scores['Total'];
    const status = getOverallStatus(total);

    const waMessage = encodeURIComponent(
        `Olá! Acabei de fazer o Diagnóstico Empresarial 2026 pela Resulta Mais. Meu resultado foi ${total}/100 — ${status.text}. Quero entender como evoluir meu negócio.`
    );
    const waLink = `https://wa.me/55996502738?text=${waMessage}`;

    const ctaEl = document.getElementById('cta-section');
    if (!ctaEl) return;

    ctaEl.innerHTML = `
        <div class="card" style="margin-top: 2rem; text-align: center; padding: 2rem; border: 1px solid var(--color-secondary);">
            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Se você quiser entender como evoluir para o próximo nível, solicite uma análise estratégica com nossa equipe.</p>
            <a href="${waLink}" target="_blank" class="btn btn-primary btn-large cta-pulse" style="display:inline-flex; align-items:center; gap: 0.6rem; text-decoration:none;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Quero evoluir meu negócio
            </a>
        </div>
    `;
}

function renderGeneralScore(scores) {
    const total = scores['Total'];
    const status = getOverallStatus(total);

    const valueEl = document.getElementById('general-score-value');
    const badgeEl = document.getElementById('general-status-badge');

    if (valueEl && badgeEl) {
        valueEl.textContent = `${total}/100`;
        badgeEl.textContent = status.text;
        badgeEl.className = `score-badge ${status.labelClass}`;
    }
}

function renderScoresList(scores) {
    scoresList.innerHTML = '';

    questionsData.forEach(q => {
        const score = scores[q.category];
        const item = document.createElement('div');
        item.className = 'score-item';
        item.innerHTML = `
            <span class="score-label">${q.category}</span>
            <span class="score-value">${score}</span>
        `;
        scoresList.appendChild(item);
    });
}

function renderTextualAnalysis(scores) {
    analysisList.innerHTML = '';

    const total = scores['Total'];
    const status = getOverallStatus(total);
    const data = analysisDict[status.id];

    // Identifica os 3 pontos mais fracos
    const weakest = questionsData
        .map(q => ({ category: q.category, score: scores[q.category] }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(x => x.category);

    const personalizedMessages = {
        pressure: `Seu diagnóstico mostra que <strong>${weakest.join(', ')}</strong> são os pontos críticos que estão travando seu crescimento agora. Com ${total}/100, o risco de estagnação é real — mas tem solução.`,
        disorganized: `Os principais gargalos identificados foram <strong>${weakest.join(', ')}</strong>. Com ${total}/100, você já tem uma base — agora precisa de estrutura para escalar de verdade.`,
        consolidating: `Os pontos que ainda podem ser desbloqueados para o próximo nível são <strong>${weakest.join(', ')}</strong>. Ajustando esses pilares, a escala vem com muito menos esforço.`,
        scaling: `Para crescer com inteligência em 2026, os pontos de atenção são <strong>${weakest.join(', ')}</strong>. Uma estratégia bem direcionada aqui acelera os resultados.`
    };

    const signsHtml = data.signs.map(s => `<li>${s}</li>`).join('');

    const item = document.createElement('div');
    item.className = 'analysis-item';
    item.innerHTML = `
        <div class="analysis-title">
            <span class="indicator ${status.indicatorClass}"></span>
            ${status.text}
        </div>
        <div class="analysis-desc">${data.description}</div>
        <ul style="color: var(--color-text-muted); font-size: 0.9rem; margin: 0.5rem 0 0.5rem 1.2rem; padding: 0;">
            ${signsHtml}
        </ul>
        <div class="analysis-desc" style="margin-top: 0.5rem; font-style: italic;">${data.conclusion}</div>
        <div class="analysis-desc" style="margin-top: 1rem; padding: 0.75rem 1rem; border-left: 3px solid var(--color-secondary); background: rgba(200,168,105,0.06);">
            ${personalizedMessages[status.id]}
        </div>
    `;
    analysisList.appendChild(item);
}

function renderRadarChart(scores) {
    const dataValues = questionsData.map(q => scores[q.category]);

    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    const shortLabels = ['Clareza', 'Canais', 'Vendas', 'Valor', 'Lucro', 'Liderança', 'Equipe', 'Independência', 'Gestão', 'Crescimento'];

    radarChartInstance = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: shortLabels,
            datasets: [{
                label: 'Sua Pontuação',
                data: dataValues,
                backgroundColor: 'rgba(200, 168, 105, 0.2)',
                borderColor: '#C8A869',
                pointBackgroundColor: '#0A0A0A',
                pointBorderColor: '#C8A869',
                pointHoverBackgroundColor: '#C8A869',
                pointHoverBorderColor: '#fff',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: {
                        font: { family: "'Inter', sans-serif", size: 11, weight: '600' },
                        color: '#E5E5E5'
                    },
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2, display: false }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

async function sendReportEmail() {
    const scores = calculateScores();
    const total = scores['Total'];
    const status = getOverallStatus(total);
    const analysisData = analysisDict[status.id];

    try {
        const response = await fetch('/api/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadData,
                scores,
                analysis: {
                    total,
                    status: status.text,
                    description: analysisData.description,
                    signs: analysisData.signs,
                    conclusion: analysisData.conclusion
                }
            })
        });

        if (response.ok) {
            showEmailNotification('Diagnóstico recebido com sucesso!', 'success');
        } else {
            showEmailNotification('Erro ao registrar diagnóstico.', 'error');
        }
    } catch (err) {
        showEmailNotification('Erro ao registrar diagnóstico.', 'error');
    }
}

function restartDiagnosis() {
    leadForm.reset();
    currentQuestionIndex = 0;
    userAnswers = new Array(questionsData.length).fill(5);
    leadData = null;
    showScreen('welcome');
}

async function handleDownloadPdf() {
    const originalText = btnDownloadPdf.textContent;
    btnDownloadPdf.textContent = 'Gerando PDF...';
    btnDownloadPdf.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pw = doc.internal.pageSize.getWidth();
        const ph = doc.internal.pageSize.getHeight();
        const mx = 50;
        const maxW = pw - mx * 2;
        let y = 0;

        const scores = calculateScores();
        const total = scores['Total'];
        const overallStatus = getOverallStatus(total);
        const analysisData = analysisDict[overallStatus.id];

        const gold = [197, 168, 109];
        const darkBg = [10, 10, 10];
        const white = [255, 255, 255];
        const gray = [142, 142, 142];

        function addPage() {
            doc.addPage();
            y = 0;
            drawPageBg();
        }

        function drawPageBg() {
            doc.setFillColor(...darkBg);
            doc.rect(0, 0, pw, ph, 'F');
        }

        function checkPageBreak(needed) {
            if (y + needed > ph - 60) {
                addPage();
                y = 50;
            }
        }

        function drawGoldLine(yPos) {
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.5);
            doc.line(mx, yPos, pw - mx, yPos);
        }

        // PAGE 1: COVER
        drawPageBg();
        doc.setFillColor(...gold);
        doc.rect(0, 0, pw, 6, 'F');

        y = 80;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(32);
        doc.text('RESULTA MAIS', mx, y);

        y += 24;
        doc.setFontSize(10);
        doc.setTextColor(...gray);
        doc.text('ACELERAÇÃO EMPRESARIAL  •  ESTRATÉGIA  •  SUCESSO', mx, y);

        y += 60;
        drawGoldLine(y);

        y += 50;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...white);
        doc.setFontSize(28);
        doc.text('Diagnóstico Empresarial 2026', mx, y);

        y += 30;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(...gray);
        doc.text('O quanto seu negócio está preparado para crescer?', mx, y);

        // Lead data box
        y += 60;
        doc.setFillColor(20, 20, 20);
        doc.roundedRect(mx, y, maxW, 160, 8, 8, 'F');

        y += 30;
        doc.setFontSize(10);
        doc.setTextColor(...gold);
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DO PARTICIPANTE', mx + 20, y);

        y += 22;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...white);
        doc.setFontSize(11);
        [
            `Nome: ${leadData?.name || '-'}`,
            `Empresa: ${leadData?.company || '-'}`,
            `Email: ${leadData?.email || '-'}`,
            `Telefone: ${leadData?.phone || '-'}`,
            `Faturamento Mensal: ${leadData?.revenue || '-'}`,
            `Objetivo para 2026: ${leadData?.goal || '-'}`
        ]
            .forEach(item => { doc.text(item, mx + 20, y); y += 18; });

        // Total score
        y += 30;
        doc.setFillColor(20, 20, 20);
        doc.roundedRect(mx, y, maxW, 80, 8, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(36);
        doc.text(`${total}/100`, mx + 20, y + 50);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...gray);
        doc.text(overallStatus.text, mx + 130, y + 50);

        y += 110;
        doc.setFontSize(10);
        doc.setTextColor(...gray);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, mx, y);

        drawGoldLine(ph - 60);
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text('Relatório gerado por Resulta Mais — Todos os direitos reservados.', mx, ph - 40);

        // PAGE 2: RADAR CHART
        addPage();
        doc.setFillColor(...gold);
        doc.rect(0, 0, pw, 6, 'F');

        y = 50;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(20);
        doc.text('RADAR ESTRATÉGICO', mx, y);

        y += 12;
        drawGoldLine(y);
        y += 30;

        if (radarChartInstance) {
            const chartImg = radarChartInstance.toBase64Image('image/jpeg', 0.5);
            const chartSize = 300;
            const chartX = (pw - chartSize) / 2;
            doc.addImage(chartImg, 'JPEG', chartX, y, chartSize, chartSize);
            y += chartSize + 30;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(16);
        doc.text('PONTUAÇÕES POR ÁREA', mx, y);
        y += 25;

        questionsData.forEach(q => {
            checkPageBreak(50);
            const score = scores[q.category];

            doc.setFillColor(20, 20, 20);
            doc.roundedRect(mx, y, maxW, 40, 6, 6, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...white);
            doc.setFontSize(11);
            doc.text(q.category, mx + 15, y + 16);

            doc.setTextColor(...gold);
            doc.setFontSize(16);
            doc.text(score.toString(), pw - mx - 55, y + 18);

            doc.setFillColor(30, 30, 30);
            doc.roundedRect(mx + 15, y + 24, maxW - 90, 7, 3, 3, 'F');

            doc.setFillColor(...gold);
            doc.roundedRect(mx + 15, y + 24, Math.max(4, (score / 10) * (maxW - 90)), 7, 3, 3, 'F');

            y += 50;
        });

        drawGoldLine(ph - 60);
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text('Relatório gerado por Resulta Mais — Todos os direitos reservados.', mx, ph - 40);

        // PAGE 3: FINAL ANALYSIS
        addPage();
        doc.setFillColor(...gold);
        doc.rect(0, 0, pw, 6, 'F');

        y = 50;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(20);
        doc.text('DIAGNÓSTICO FINAL', mx, y);

        y += 12;
        drawGoldLine(y);
        y += 30;

        doc.setFillColor(20, 20, 20);
        doc.roundedRect(mx, y, maxW, 70, 8, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(32);
        doc.text(`${total}/100`, mx + 20, y + 45);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...gray);
        doc.text(overallStatus.text, mx + 130, y + 42);

        y += 90;

        doc.splitTextToSize(analysisData.description, maxW).forEach(line => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...white);
            doc.setFontSize(12);
            doc.text(line, mx, y);
            y += 18;
        });

        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(13);
        doc.text('Principais sinais:', mx, y);
        y += 18;

        analysisData.signs.forEach(sign => {
            checkPageBreak(20);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...gray);
            doc.setFontSize(11);
            doc.text(`• ${sign}`, mx + 10, y);
            y += 18;
        });

        y += 10;
        doc.splitTextToSize(analysisData.conclusion, maxW).forEach(line => {
            checkPageBreak(18);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...gray);
            doc.setFontSize(11);
            doc.text(line, mx, y);
            y += 18;
        });

        checkPageBreak(120);
        y += 20;
        drawGoldLine(y);
        y += 40;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...gold);
        doc.setFontSize(16);
        doc.text('Quer evoluir seu negócio para o próximo nível?', mx, y);

        y += 25;
        doc.splitTextToSize('A Resulta Mais oferece aceleração empresarial personalizada para levar sua empresa ao próximo nível. Entre em contato conosco para uma consultoria estratégica exclusiva.', maxW)
            .forEach(line => {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...gray);
                doc.setFontSize(11);
                doc.text(line, mx, y);
                y += 16;
            });

        drawGoldLine(ph - 60);
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text('Relatório gerado por Resulta Mais — Todos os direitos reservados.', mx, ph - 40);

        // SAVE
        const fileName = `Diagnostico_2026_${leadData?.company || 'Empresa'}.pdf`;
        doc.save(fileName);


    } catch (err) {
        console.error(err);
        alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
        btnDownloadPdf.textContent = originalText;
        btnDownloadPdf.disabled = false;
    }
}

function showEmailNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    if (type === 'success') notification.style.backgroundColor = '#10B981';
    else if (type === 'warning') notification.style.backgroundColor = '#F59E0B';
    else notification.style.backgroundColor = '#EF4444';

    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
