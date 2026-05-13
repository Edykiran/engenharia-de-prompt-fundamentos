// ==================== STATE MANAGEMENT ====================

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.settings = this.loadSettings();
        this.currentDate = new Date();
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }

    loadSettings() {
        const saved = localStorage.getItem('settings');
        return saved ? JSON.parse(saved) : this.defaultSettings();
    }

    defaultSettings() {
        return {
            notify15min: true,
            notify1hour: true,
            notifySound: true,
            workStart: '08:00',
            workEnd: '18:00'
        };
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    addTask(taskData) {
        const task = {
            id: Date.now(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    getTasksForDate(date) {
        return this.tasks.filter(task => {
            const taskDate = new Date(task.date).toDateString();
            return taskDate === date.toDateString();
        });
    }

    getTasksForWeek(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        
        return this.tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= startDate && taskDate < endDate;
        });
    }

    getTodaysTasks() {
        return this.getTasksForDate(new Date());
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    updateTask(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
        }
    }

    clearAllTasks() {
        if (confirm('Tem certeza que deseja limpar todas as tarefas? Esta ação é irreversível.')) {
            this.tasks = [];
            this.saveTasks();
            return true;
        }
        return false;
    }
}

const taskManager = new TaskManager();

// ==================== UI MANAGEMENT ====================

class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.renderDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.closest('.nav-btn')));
        });

        // Form
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleAddTask(e));
        document.getElementById('task-recurring').addEventListener('change', (e) => {
            document.getElementById('recurring-options').classList.toggle('hidden', !e.target.checked);
        });

        // Schedule Navigation
        document.getElementById('prev-week').addEventListener('click', () => this.previousWeek());
        document.getElementById('next-week').addEventListener('click', () => this.nextWeek());

        // Settings
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clear-btn').addEventListener('click', () => {
            if (taskManager.clearAllTasks()) {
                this.renderDashboard();
                this.showNotification('Todas as tarefas foram removidas', 'success');
            }
        });

        // Apply settings
        ['notify-15min', 'notify-1hour', 'notify-sound', 'work-start', 'work-end'].forEach(id => {
            const element = document.getElementById(id);
            if (element.type === 'checkbox') {
                element.addEventListener('change', (e) => {
                    const key = id.replace('-', '');
                    taskManager.settings[key] = e.target.checked;
                    taskManager.saveSettings();
                });
            } else {
                element.addEventListener('change', (e) => {
                    const key = id.replace('-', '');
                    taskManager.settings[key] = e.target.value;
                    taskManager.saveSettings();
                });
            }
        });
    }

    switchSection(btn) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const sectionId = btn.getAttribute('data-section');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        document.getElementById('section-title').textContent = btn.textContent.trim();
        this.currentSection = sectionId;

        if (sectionId === 'schedule') this.renderSchedule();
        if (sectionId === 'analytics') this.renderAnalytics();
    }

    updateDateTime() {
        const now = new Date();
        document.getElementById('current-date').textContent = this.formatDate(now);
        document.getElementById('current-time').textContent = this.formatTime(now);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            weekday: 'short',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    handleAddTask(e) {
        e.preventDefault();

        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            date: document.getElementById('task-date').value,
            time: document.getElementById('task-time').value,
            duration: parseInt(document.getElementById('task-duration').value),
            priority: document.getElementById('task-priority').value,
            category: document.getElementById('task-category').value,
            recurring: document.getElementById('task-recurring').checked,
            recurringType: document.getElementById('task-recurring').checked ? 
                           document.getElementById('recurring-type').value : null
        };

        taskManager.addTask(taskData);
        e.target.reset();
        document.getElementById('recurring-options').classList.add('hidden');
        
        this.showNotification('Tarefa adicionada com sucesso!', 'success');
        this.renderDashboard();
    }

    renderDashboard() {
        const today = new Date();
        const todaysTasks = taskManager.getTodaysTasks();
        const completedTasks = taskManager.getCompletedTasks();
        const pendingTasks = taskManager.getPendingTasks();
        const productivity = taskManager.tasks.length > 0 
            ? Math.round((completedTasks.length / taskManager.tasks.length) * 100)
            : 0;

        document.getElementById('tasks-today').textContent = todaysTasks.length;
        document.getElementById('completed-tasks').textContent = completedTasks.length;
        document.getElementById('pending-tasks').textContent = pendingTasks.length;
        document.getElementById('productivity').textContent = productivity + '%';

        const upcomingContainer = document.getElementById('upcoming-tasks');
        const allTasks = [...taskManager.tasks]
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 5);

        if (allTasks.length === 0) {
            upcomingContainer.innerHTML = '<p class="empty-state">Nenhuma tarefa agendada. Comece adicionando uma!</p>';
        } else {
            upcomingContainer.innerHTML = allTasks.map(task => this.createTaskElement(task)).join('');
        }
    }

    createTaskElement(task) {
        const taskDate = new Date(`${task.date}T${task.time}`);
        const isCompleted = task.completed ? 'completed' : '';
        const priorityClass = `priority-${task.priority}`;
        
        return `
            <div class="task-item ${priorityClass}" data-task-id="${task.id}">
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">
                        ${this.formatDate(taskDate)} às ${task.time}
                        ${task.category ? `• ${task.category}` : ''}
                    </div>
                </div>
                <button class="task-status" onclick="toggleTask(${task.id})">${task.completed ? '✓ Concluída' : '⏳ Pendente'}</button>
            </div>
        `;
    }

    renderSchedule() {
        const startDate = new Date(this.currentDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        document.getElementById('week-display').textContent = 
            `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;

        const weekTasks = taskManager.getTasksForWeek(startDate);
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        
        let gridHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(currentDay.getDate() + i);
            const dayTasks = weekTasks.filter(task => 
                new Date(task.date).toDateString() === currentDay.toDateString()
            ).sort((a, b) => a.time.localeCompare(b.time));

            gridHTML += `
                <div class="day-column">
                    <div class="day-header">${days[i]}<br>${currentDay.getDate()}</div>
                    <div class="day-tasks">
                        ${dayTasks.length === 0 ? 
                            '<p style="text-align: center; opacity: 0.5; font-size: 12px;">Sem tarefas</p>' :
                            dayTasks.map(task => `
                                <div class="time-slot priority-${task.priority}">
                                    <strong>${task.time}</strong><br>
                                    ${task.title}<br>
                                    <small>${task.duration}min</small>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;
        }

        document.getElementById('schedule-grid').innerHTML = gridHTML;
    }

    previousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.renderSchedule();
    }

    nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.renderSchedule();
    }

    renderAnalytics() {
        const tasks = taskManager.tasks;
        const completed = taskManager.getCompletedTasks();

        // Category Distribution
        const categoryData = {};
        tasks.forEach(task => {
            categoryData[task.category || 'Sem categoria'] = (categoryData[task.category || 'Sem categoria'] || 0) + 1;
        });

        // Priority Distribution
        const priorityData = { alta: 0, média: 0, baixa: 0 };
        tasks.forEach(task => {
            priorityData[task.priority]++;
        });

        // Hours Used
        const totalHours = tasks.reduce((sum, task) => sum + (task.duration / 60), 0).toFixed(1);

        document.getElementById('category-chart').innerHTML = this.createChart(categoryData);
        document.getElementById('priority-chart').innerHTML = this.createChart(priorityData);
        document.getElementById('completion-chart').innerHTML = `
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 48px; color: var(--primary-color); font-weight: bold;">
                    ${completed.length}/${tasks.length}
                </div>
                <div style="margin-top: 10px; color: var(--text-light);">Tarefas Concluídas</div>
            </div>
        `;
        document.getElementById('hours-chart').innerHTML = `
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 48px; color: var(--primary-color); font-weight: bold;">
                    ${totalHours}h
                </div>
                <div style="margin-top: 10px; color: var(--text-light);">Horas Totais</div>
            </div>
        `;

        // Weekly Report
        const report = document.getElementById('weekly-report');
        report.innerHTML = `
            <div class="report-item">
                <span>Total de Tarefas</span>
                <strong>${tasks.length}</strong>
            </div>
            <div class="report-item">
                <span>Concluídas</span>
                <strong>${completed.length}</strong>
            </div>
            <div class="report-item">
                <span>Pendentes</span>
                <strong>${taskManager.getPendingTasks().length}</strong>
            </div>
            <div class="report-item">
                <span>Taxa de Conclusão</span>
                <strong>${tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%</strong>
            </div>
            <div class="report-item">
                <span>Tempo Total</span>
                <strong>${totalHours} horas</strong>
            </div>
        `;
    }

    createChart(data) {
        const entries = Object.entries(data);
        const max = Math.max(...entries.map(e => e[1]));

        return entries.map(([label, value]) => {
            const percentage = max > 0 ? (value / max) * 100 : 0;
            return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px;">${label}</span>
                        <span style="font-weight: bold; color: var(--primary-color);">${value}</span>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--primary-color), var(--accent)); height: 100%; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    exportData() {
        const dataToExport = {
            tasks: taskManager.tasks,
            settings: taskManager.settings,
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `agenda-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Dados exportados com sucesso!', 'success');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                taskManager.tasks = data.tasks || [];
                taskManager.settings = data.settings || taskManager.defaultSettings();
                taskManager.saveTasks();
                taskManager.saveSettings();
                
                this.showNotification('Dados importados com sucesso!', 'success');
                this.renderDashboard();
            } catch (error) {
                this.showNotification('Erro ao importar arquivo!', 'error');
            }
        };
        reader.readAsText(file);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ==================== GLOBAL FUNCTIONS ====================

const uiManager = new UIManager();

function toggleTask(id) {
    const task = taskManager.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        taskManager.saveTasks();
        uiManager.renderDashboard();
    }
}

// ==================== ANIMATIONS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-date').value = today;
    
    // Load settings into UI
    const settings = taskManager.settings;
    if (document.getElementById('notify-15min')) {
        document.getElementById('notify-15min').checked = settings.notify15min !== false;
        document.getElementById('notify-1hour').checked = settings.notify1hour !== false;
        document.getElementById('notify-sound').checked = settings.notifySound !== false;
        document.getElementById('work-start').value = settings.workStart || '08:00';
        document.getElementById('work-end').value = settings.workEnd || '18:00';
    }
});

console.log('%c🎯 AgendaAI - Agente Inteligente de Organização', 'color: #d4af37; font-size: 16px; font-weight: bold;');
console.log('%cBem-vindo ao seu organizador inteligente de horários!', 'color: #d4af37; font-style: italic;');
