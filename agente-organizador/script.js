// ==================== STATE MANAGEMENT ====================

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.settings = this.loadSettings();
        this.currentFilter = 'all';
        this.focusTimer = 25 * 60;
        this.focusRunning = false;
    }

    loadTasks() {
        const saved = localStorage.getItem('agendai_tasks');
        return saved ? JSON.parse(saved) : [];
    }

    loadSettings() {
        const saved = localStorage.getItem('agendai_settings');
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
        localStorage.setItem('agendai_tasks', JSON.stringify(this.tasks));
    }

    saveSettings() {
        localStorage.setItem('agendai_settings', JSON.stringify(this.settings));
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

    getTodaysTasks() {
        const today = new Date().toDateString();
        return this.tasks.filter(task => new Date(task.date).toDateString() === today);
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    getFilteredTasks() {
        switch(this.currentFilter) {
            case 'pending': return this.getPendingTasks();
            case 'completed': return this.getCompletedTasks();
            default: return this.tasks;
        }
    }

    clearAllTasks() {
        if (confirm('Tem certeza que deseja deletar TODAS as tarefas? Isso é irreversível!')) {
            this.tasks = [];
            this.saveTasks();
            return true;
        }
        return false;
    }
}

const taskManager = new TaskManager();

// ==================== UI MANAGER ====================

class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.loadSettings();
        this.render();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Settings button
        document.querySelector('.settings-btn').addEventListener('click', () => {
            this.switchSection('settings');
        });

        // Quick add button
        document.getElementById('quick-add').addEventListener('click', () => this.openModal());

        // Task form
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleAddTask(e));

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                taskManager.currentFilter = e.target.getAttribute('data-filter');
                this.renderTasks();
            });
        });

        // Add task buttons
        document.getElementById('add-first-task')?.addEventListener('click', () => this.openModal());
        document.getElementById('add-task-btn')?.addEventListener('click', () => this.openModal());

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());

        // Focus controls
        document.getElementById('focus-start').addEventListener('click', () => this.toggleFocusTimer());
        document.getElementById('focus-reset').addEventListener('click', () => this.resetFocusTimer());
        document.getElementById('focus-tasks').addEventListener('click', () => this.selectFocusTask());

        // Settings
        ['notify-15min', 'notify-1hour', 'notify-sound', 'work-start', 'work-end'].forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('change', (e) => this.updateSettings(id, e.target));
        });

        // Data management
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clear-btn').addEventListener('click', () => {
            if (taskManager.clearAllTasks()) {
                this.render();
                this.showNotification('Todas as tarefas foram deletadas', 'success');
            }
        });

        // Modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        this.currentSection = sectionId;

        if (sectionId === 'schedule') this.renderSchedule();
        if (sectionId === 'insights') this.renderInsights();
    }

    updateDateTime() {
        const now = new Date();
        document.getElementById('current-day').textContent = now.getDate();
        
        const month = now.toLocaleString('pt-BR', { month: 'short' });
        document.getElementById('current-month').textContent = month;
        document.getElementById('current-year').textContent = now.getFullYear();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('current-time').textContent = `${hours}:${minutes}`;
    }

    handleAddTask(e) {
        e.preventDefault();

        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            date: document.getElementById('task-date').value,
            time: document.getElementById('task-time').value,
            priority: document.getElementById('task-priority').value,
            category: document.getElementById('task-category').value
        };

        taskManager.addTask(taskData);
        e.target.reset();
        this.closeModal();
        this.showNotification('Tarefa adicionada com sucesso! 🎉', 'success');
        this.render();
    }

    render() {
        this.renderDashboard();
        this.renderTasks();
        this.renderCalendar();
        this.renderWeekView();
    }

    renderDashboard() {
        const today = taskManager.getTodaysTasks();
        const completed = taskManager.getCompletedTasks();
        const pending = taskManager.getPendingTasks();
        const productivity = taskManager.tasks.length > 0 
            ? Math.round((completed.length / taskManager.tasks.length) * 100)
            : 0;

        document.getElementById('today-count').textContent = today.length;
        document.getElementById('completed-count').textContent = completed.length;
        document.getElementById('pending-count').textContent = pending.length;
        document.getElementById('productivity-score').textContent = productivity + '%';

        // Upcoming tasks
        const upcoming = [...taskManager.tasks]
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 5);

        const upcomingContainer = document.getElementById('upcoming-tasks');
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>Nenhuma tarefa agendada</p>
                    <button class="cta-btn" onclick="openModal()">Adicionar Tarefa</button>
                </div>
            `;
        } else {
            upcomingContainer.innerHTML = upcoming.map(task => this.createTaskPreview(task)).join('');
        }
    }

    createTaskPreview(task) {
        const time = task.time;
        return `
            <div class="featured-task">
                <div class="featured-task-time">${time}</div>
                <div class="featured-task-content">
                    <div class="featured-task-title">${task.title}</div>
                    <div class="featured-task-subtitle">${task.category || 'Sem categoria'}</div>
                </div>
            </div>
        `;
    }

    renderTasks() {
        const filtered = taskManager.getFilteredTasks()
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        const container = document.getElementById('tasks-list');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">✨</span>
                    <p>Nenhuma tarefa ${taskManager.currentFilter !== 'all' ? 'nesta categoria' : 'ainda'}</p>
                    <button class="cta-btn" onclick="openModal()">Criar Tarefa</button>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(task => `
                <div class="task-item">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})">
                    <div class="task-info" style="flex: 1;">
                        <div class="task-title" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            ${task.title}
                        </div>
                        <div class="task-meta">
                            ${task.date} às ${task.time}
                            ${task.category ? `• ${task.category}` : ''}
                        </div>
                    </div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            `).join('');
        }
    }

    renderCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        document.getElementById('month-year').textContent = 
            new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        let html = '';
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

        // Week header
        dayNames.forEach(day => {
            html += `<div style="text-align: center; font-weight: 600; color: var(--primary); padding: 8px;">${day}</div>`;
        });

        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += `<div class="calendar-day other-month"></div>`;
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>
            `;
        }

        document.getElementById('calendar-grid').innerHTML = html;
    }

    renderWeekView() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        let html = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dayTasks = taskManager.tasks.filter(t => 
                new Date(t.date).toDateString() === date.toDateString()
            );

            html += `
                <div class="week-day">
                    <div class="week-day-name">${dayNames[date.getDay()]}</div>
                    <div class="week-day-date">${date.getDate()}</div>
                    <div class="week-day-tasks">
                        ${dayTasks.length} tarefa${dayTasks.length !== 1 ? 's' : ''}
                    </div>
                </div>
            `;
        }

        document.getElementById('week-view').innerHTML = html;
    }

    renderSchedule() {
        this.renderCalendar();
        this.renderWeekView();
    }

    previousMonth() {
        const today = new Date();
        today.setMonth(today.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        this.renderCalendar();
    }

    renderInsights() {
        const tasks = taskManager.tasks;
        const completed = taskManager.getCompletedTasks();

        // Categories
        const categories = {};
        tasks.forEach(t => {
            const cat = t.category || 'Sem categoria';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        // Priorities
        const priorities = { alta: 0, média: 0, baixa: 0 };
        tasks.forEach(t => {
            priorities[t.priority]++;
        });

        // Stats
        const rate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

        document.getElementById('stat-total').textContent = tasks.length;
        document.getElementById('stat-completed').textContent = completed.length;
        document.getElementById('stat-rate').textContent = rate + '%';

        // Render charts
        document.getElementById('category-chart').innerHTML = this.createSimpleChart(categories);
        document.getElementById('priority-chart').innerHTML = this.createSimpleChart(priorities);
        
        const completionPercent = rate;
        document.getElementById('completion-chart').innerHTML = `
            <div style="width: 100%; text-align: center;">
                <div style="font-size: 48px; font-weight: 700; color: var(--primary);">${completionPercent}%</div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">Taxa de Conclusão</div>
            </div>
        `;
    }

    createSimpleChart(data) {
        const entries = Object.entries(data).filter(([, v]) => v > 0);
        if (entries.length === 0) {
            return '<div style="color: var(--text-tertiary);">Sem dados</div>';
        }

        const max = Math.max(...entries.map(([, v]) => v));
        return entries.map(([label, value]) => {
            const percent = (value / max) * 100;
            return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px;">${label}</span>
                        <strong style="color: var(--primary);">${value}</strong>
                    </div>
                    <div style="background: rgba(212, 175, 55, 0.1); height: 6px; border-radius: 3px;">
                        <div style="background: linear-gradient(90deg, var(--primary), var(--primary-light)); height: 100%; width: ${percent}%; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleFocusTimer() {
        taskManager.focusRunning = !taskManager.focusRunning;
        const btn = document.getElementById('focus-start');
        btn.textContent = taskManager.focusRunning ? '⏸ Pausar' : '▶ Iniciar';
        btn.classList.toggle('playing');

        if (taskManager.focusRunning) {
            this.runFocusTimer();
        }
    }

    runFocusTimer() {
        if (!taskManager.focusRunning) return;

        taskManager.focusTimer--;
        const mins = Math.floor(taskManager.focusTimer / 60);
        const secs = taskManager.focusTimer % 60;
        document.getElementById('focus-timer').textContent = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (taskManager.focusTimer <= 0) {
            this.resetFocusTimer();
            this.showNotification('Tempo de foco concluído! 🎉', 'success');
        } else {
            setTimeout(() => this.runFocusTimer(), 1000);
        }
    }

    resetFocusTimer() {
        taskManager.focusRunning = false;
        taskManager.focusTimer = 25 * 60;
        document.getElementById('focus-timer').textContent = '25:00';
        document.getElementById('focus-start').textContent = '▶ Iniciar';
        document.getElementById('focus-start').classList.remove('playing');
    }

    selectFocusTask() {
        const tasks = taskManager.getPendingTasks();
        if (tasks.length === 0) {
            this.showNotification('Nenhuma tarefa pendente', 'warning');
            return;
        }

        const taskList = tasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
        const choice = prompt(`Escolha uma tarefa (1-${tasks.length}):\n${taskList}`);
        
        if (choice && choice >= 1 && choice <= tasks.length) {
            const selected = tasks[parseInt(choice) - 1];
            document.getElementById('focus-task').textContent = `📌 ${selected.title}`;
        }
    }

    loadSettings() {
        const settings = taskManager.settings;
        document.getElementById('notify-15min').checked = settings.notify15min !== false;
        document.getElementById('notify-1hour').checked = settings.notify1hour !== false;
        document.getElementById('notify-sound').checked = settings.notifySound !== false;
        document.getElementById('work-start').value = settings.workStart || '08:00';
        document.getElementById('work-end').value = settings.workEnd || '18:00';
    }

    updateSettings(id, element) {
        const key = id.replace('-', '');
        if (element.type === 'checkbox') {
            taskManager.settings[key] = element.checked;
        } else {
            taskManager.settings[key] = element.value;
        }
        taskManager.saveSettings();
    }

    exportData() {
        const data = {
            tasks: taskManager.tasks,
            settings: taskManager.settings,
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `agendai-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Dados exportados com sucesso! 📥', 'success');
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
                
                this.loadSettings();
                this.render();
                this.showNotification('Dados importados com sucesso! 📤', 'success');
            } catch (error) {
                this.showNotification('Erro ao importar arquivo!', 'danger');
            }
        };
        reader.readAsText(file);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ==================== MODAL FUNCTIONS ====================

function openModal() {
    const modal = document.getElementById('add-task-modal');
    modal.classList.add('active');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-date').value = today;
    document.getElementById('task-time').value = '09:00';
}

function closeModal() {
    const modal = document.getElementById('add-task-modal');
    modal.classList.remove('active');
    document.getElementById('task-form').reset();
}

// ==================== GLOBAL FUNCTIONS ====================

function toggleTask(id) {
    taskManager.toggleTask(id);
    uiManager.render();
}

// ==================== INIT ====================

const uiManager = new UIManager();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Set initial date in form
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-date').value = today;
});

console.log('%c🎯 AgendAI v2.0 - Modern Scheduler', 'color: #d4af37; font-size: 16px; font-weight: bold;');
console.log('%cDesignado para ser rápido, bonito e intuitivo!', 'color: #d4af37; font-style: italic;');
