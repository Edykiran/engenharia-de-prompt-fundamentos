// ========== CLASSE TAREFA ==========
class Tarefa {
    constructor(id, descricao, hora, prioridade, concluida = false) {
        this.id = id;
        this.descricao = descricao;
        this.hora = hora;
        this.prioridade = prioridade;
        this.concluida = concluida;
        this.dataCriacao = new Date();
    }
}

// ========== CLASSE AGENDA ==========
class AgendaInteligente {
    constructor() {
        this.tarefas = [];
        this.filtroAtual = 'todas';
        this.editandoId = null;
        this.carregarDoLocalStorage();
        this.inicializar();
    }

    inicializar() {
        this.criarEventListeners();
        this.atualizarTela();
        this.atualizarRelogio();
        this.atualizarDataHora();
        setInterval(() => this.atualizarRelogio(), 1000);
        setInterval(() => this.atualizarProximasTarefas(), 60000);
    }

    criarEventListeners() {
        // Input
        document.getElementById('btn-adicionar').addEventListener('click', () => this.adicionarTarefa());
        document.getElementById('input-tarefa').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.adicionarTarefa();
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.aplicarFiltro(e.target.dataset.filter));
        });

        // Footer
        document.getElementById('btn-limpar-concluidas').addEventListener('click', () => this.limparConcluidas());
        document.getElementById('btn-exportar').addEventListener('click', () => this.exportarTarefas());

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.fecharModal());
        document.getElementById('btn-salvar-edicao').addEventListener('click', () => this.salvarEdicao());
        window.addEventListener('click', (e) => {
            if (e.target.id === 'modal-edicao') this.fecharModal();
        });
    }

    adicionarTarefa() {
        const descricao = document.getElementById('input-tarefa').value.trim();
        const hora = document.getElementById('input-hora').value;
        const prioridade = document.getElementById('input-prioridade').value;

        if (!descricao) {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        const id = Date.now();
        const tarefa = new Tarefa(id, descricao, hora, prioridade);
        this.tarefas.push(tarefa);

        // Limpar inputs
        document.getElementById('input-tarefa').value = '';
        document.getElementById('input-hora').value = '';
        document.getElementById('input-prioridade').value = 'média';

        this.salvarNoLocalStorage();
        this.atualizarTela();
        this.mostrarNotificacao('Tarefa adicionada com sucesso! ✅');
    }

    deletarTarefa(id) {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            this.tarefas = this.tarefas.filter(t => t.id !== id);
            this.salvarNoLocalStorage();
            this.atualizarTela();
            this.mostrarNotificacao('Tarefa deletada! 🗑️');
        }
    }

    togglConcluida(id) {
        const tarefa = this.tarefas.find(t => t.id === id);
        if (tarefa) {
            tarefa.concluida = !tarefa.concluida;
            this.salvarNoLocalStorage();
            this.atualizarTela();
        }
    }

    abrirModalEdicao(id) {
        const tarefa = this.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        this.editandoId = id;
        document.getElementById('modal-tarefa').value = tarefa.descricao;
        document.getElementById('modal-hora').value = tarefa.hora;
        document.getElementById('modal-prioridade').value = tarefa.prioridade;
        document.getElementById('modal-edicao').style.display = 'block';
    }

    fecharModal() {
        document.getElementById('modal-edicao').style.display = 'none';
        this.editandoId = null;
    }

    salvarEdicao() {
        if (!this.editandoId) return;

        const tarefa = this.tarefas.find(t => t.id === this.editandoId);
        if (!tarefa) return;

        tarefa.descricao = document.getElementById('modal-tarefa').value.trim();
        tarefa.hora = document.getElementById('modal-hora').value;
        tarefa.prioridade = document.getElementById('modal-prioridade').value;

        this.salvarNoLocalStorage();
        this.atualizarTela();
        this.fecharModal();
        this.mostrarNotificacao('Tarefa atualizada! ✏️');
    }

    aplicarFiltro(filtro) {
        this.filtroAtual = filtro;

        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filtro) {
                btn.classList.add('active');
            }
        });

        this.atualizarTela();
    }

    obterTarefasFiltradas() {
        let tarefas = [...this.tarefas];

        switch (this.filtroAtual) {
            case 'alta':
                return tarefas.filter(t => t.prioridade === 'alta');
            case 'média':
                return tarefas.filter(t => t.prioridade === 'média');
            case 'baixa':
                return tarefas.filter(t => t.prioridade === 'baixa');
            case 'concluida':
                return tarefas.filter(t => t.concluida);
            default:
                return tarefas;
        }
    }

    limparConcluidas() {
        const concluidas = this.tarefas.filter(t => t.concluida).length;
        if (concluidas === 0) {
            alert('Nenhuma tarefa concluída para limpar.');
            return;
        }

        if (confirm(`Tem certeza que deseja remover ${concluidas} tarefa(s) concluída(s)?`)) {
            this.tarefas = this.tarefas.filter(t => !t.concluida);
            this.salvarNoLocalStorage();
            this.atualizarTela();
            this.mostrarNotificacao('Tarefas concluídas removidas! 🧹');
        }
    }

    exportarTarefas() {
        if (this.tarefas.length === 0) {
            alert('Nenhuma tarefa para exportar.');
            return;
        }

        const dataExportacao = new Date().toLocaleString('pt-BR');
        let conteudo = `AGENDA INTELIGENTE - EXPORTAÇÃO\n`;
        conteudo += `Data: ${dataExportacao}\n`;
        conteudo += `================================\n\n`;

        const tarefasOrdenadas = [...this.tarefas].sort((a, b) => {
            const prioridadeOrdem = { 'alta': 1, 'média': 2, 'baixa': 3 };
            if (prioridadeOrdem[a.prioridade] !== prioridadeOrdem[b.prioridade]) {
                return prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade];
            }
            return (a.hora || '23:59').localeCompare(b.hora || '23:59');
        });

        tarefasOrdenadas.forEach((t, i) => {
            const status = t.concluida ? '✅' : '⏳';
            const hora = t.hora || 'Sem horário';
            const prioridade = t.prioridade.toUpperCase();
            conteudo += `${i + 1}. ${status} ${t.descricao}\n`;
            conteudo += `   ⏰ Horário: ${hora} | 🚩 Prioridade: ${prioridade}\n\n`;
        });

        conteudo += `\nRESUMO:\n`;
        conteudo += `- Total de tarefas: ${this.tarefas.length}\n`;
        conteudo += `- Concluídas: ${this.tarefas.filter(t => t.concluida).length}\n`;
        conteudo += `- Pendentes: ${this.tarefas.filter(t => !t.concluida).length}\n`;

        const blob = new Blob([conteudo], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.mostrarNotificacao('Tarefas exportadas! 📥');
    }

    atualizarTela() {
        this.atualizarProximasTarefas();
        this.atualizarListaTarefas();
        this.atualizarEstatisticas();
    }

    atualizarProximasTarefas() {
        const container = document.getElementById('tarefas-proximas');
        const agora = new Date();
        const horaAtual = this.formatarHora(agora);

        let proximasTarefas = this.tarefas
            .filter(t => !t.concluida && t.hora)
            .sort((a, b) => a.hora.localeCompare(b.hora));

        if (proximasTarefas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Nenhuma tarefa próxima! 🎉</p>';
            return;
        }

        container.innerHTML = proximasTarefas.slice(0, 3).map(t => this.criarCardTarefa(t)).join('');
    }

    atualizarListaTarefas() {
        const container = document.getElementById('tarefas-lista');
        const tarefasFiltradas = this.obterTarefasFiltradas();

        if (tarefasFiltradas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Nenhuma tarefa encontrada! 😊</p>';
            return;
        }

        // Ordenar: não concluídas primeiro, depois por hora
        const ordenadas = tarefasFiltradas.sort((a, b) => {
            if (a.concluida !== b.concluida) {
                return a.concluida ? 1 : -1;
            }
            const horaA = a.hora || '23:59';
            const horaB = b.hora || '23:59';
            return horaA.localeCompare(horaB);
        });

        container.innerHTML = ordenadas.map(t => this.criarCardTarefa(t)).join('');
    }

    criarCardTarefa(tarefa) {
        const horaFormatada = tarefa.hora ? `⏰ ${tarefa.hora}` : '⏰ Sem horário';
        const prioridadeEmoji = {
            'alta': '🔴',
            'média': '🟡',
            'baixa': '🟢'
        }[tarefa.prioridade];

        return `
            <div class="task-card ${tarefa.prioridade} ${tarefa.concluida ? 'concluida' : ''}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${tarefa.concluida ? 'checked' : ''}
                        onchange="agenda.togglConcluida(${tarefa.id})"
                    >
                    <div class="task-info">
                        <div class="task-texto">${this.escaparHTML(tarefa.descricao)}</div>
                        <div class="task-meta">
                            <span class="task-hora">${horaFormatada}</span>
                            <span class="prioridade-badge">${prioridadeEmoji} ${tarefa.prioridade.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-acao btn-editar" onclick="agenda.abrirModalEdicao(${tarefa.id})">✏️ Editar</button>
                    <button class="btn-acao btn-deletar" onclick="agenda.deletarTarefa(${tarefa.id})">🗑️ Deletar</button>
                </div>
            </div>
        `;
    }

    atualizarEstatisticas() {
        const total = this.tarefas.length;
        const concluidas = this.tarefas.filter(t => t.concluida).length;
        const pendentes = total - concluidas;
        const alta = this.tarefas.filter(t => t.prioridade === 'alta').length;

        document.getElementById('total-tarefas').textContent = total;
        document.getElementById('total-concluidas').textContent = concluidas;
        document.getElementById('total-pendentes').textContent = pendentes;
        document.getElementById('total-alta').textContent = alta;
    }

    atualizarRelogio() {
        const agora = new Date();
        document.getElementById('hora-atual').textContent = agora.toLocaleTimeString('pt-BR');
    }

    atualizarDataHora() {
        const agora = new Date();
        const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('data-atual').textContent = agora.toLocaleDateString('pt-BR', opcoes);
    }

    formatarHora(data) {
        return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
    }

    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    mostrarNotificacao(mensagem) {
        // Criar elemento de notificação
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
            color: #1a1a1a;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 700;
            z-index: 2000;
            animation: slideInDown 0.3s ease;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
        `;
        notif.textContent = mensagem;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    salvarNoLocalStorage() {
        const dados = this.tarefas.map(t => ({
            id: t.id,
            descricao: t.descricao,
            hora: t.hora,
            prioridade: t.prioridade,
            concluida: t.concluida
        }));
        localStorage.setItem('agenda-tarefas', JSON.stringify(dados));
    }

    carregarDoLocalStorage() {
        const dados = localStorage.getItem('agenda-tarefas');
        if (dados) {
            try {
                const tarefasSalvas = JSON.parse(dados);
                this.tarefas = tarefasSalvas.map(t => 
                    new Tarefa(t.id, t.descricao, t.hora, t.prioridade, t.concluida)
                );
            } catch (e) {
                console.error('Erro ao carregar tarefas:', e);
                this.tarefas = [];
            }
        }
    }
}

// ========== INICIALIZAÇÃO ==========
let agenda;
document.addEventListener('DOMContentLoaded', () => {
    agenda = new AgendaInteligente();
});

// ========== ANIMAÇÕES CSS DINÂMICAS ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            transform: translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideOutUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
