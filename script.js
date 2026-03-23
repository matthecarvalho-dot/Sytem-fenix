// Sistema de gerenciamento de clientes
let clients = [];
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// Carregar dados do localStorage
function loadData() {
    const stored = localStorage.getItem('clients');
    if (stored) {
        clients = JSON.parse(stored);
    } else {
        // Dados de exemplo
        clients = [
            {
                id: '1',
                name: 'João Silva',
                status: 'ativo',
                totalValue: 1500.00,
                paidValue: 1500.00,
                hasFolder: 'sim',
                paymentStatus: 'pago',
                observations: 'Cliente preferencial, sempre paga em dia',
                lastAccessed: new Date().toLocaleString(),
                lastUser: 'admin',
                createdAt: '2024-01-01',
                phone: '(11) 99999-9999',
                email: 'joao@email.com'
            },
            {
                id: '2',
                name: 'Maria Santos',
                status: 'pendente',
                totalValue: 2500.00,
                paidValue: 1000.00,
                hasFolder: 'nao',
                paymentStatus: 'parcial',
                observations: 'Aguardando documentação para finalizar',
                lastAccessed: new Date().toLocaleString(),
                lastUser: 'admin',
                createdAt: '2024-01-10',
                phone: '(11) 98888-8888',
                email: 'maria@email.com'
            },
            {
                id: '3',
                name: 'Carlos Oliveira',
                status: 'inativo',
                totalValue: 800.00,
                paidValue: 0,
                hasFolder: 'nao',
                paymentStatus: 'pendente',
                observations: 'Cliente com débito, entrar em contato',
                lastAccessed: new Date().toLocaleString(),
                lastUser: 'admin',
                createdAt: '2024-01-15',
                phone: '(11) 97777-7777',
                email: 'carlos@email.com'
            }
        ];
        saveData();
    }
    
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        document.getElementById('userName').innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name || currentUser.username}`;
    } else {
        window.location.href = 'login.html';
    }
    
    displayClients();
    updateStats();
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário de cadastro
    document.getElementById('clientForm').addEventListener('submit', addClient);
    
    // Botões de ação
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Busca e filtros
    document.getElementById('searchInput').addEventListener('input', () => displayClients());
    document.getElementById('filterStatus').addEventListener('change', () => displayClients());
    document.getElementById('filterPayment').addEventListener('change', () => displayClients());
    
    // Modal de edição
    document.getElementById('editForm').addEventListener('submit', updateClient);
    document.querySelector('.close').onclick = () => closeModal('editModal');
    
    // Modal de visualização
    document.querySelector('.close-view').onclick = () => closeModal('viewModal');
    
    // Fechar modal ao clicar fora
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Adicionar cliente
function addClient(e) {
    e.preventDefault();
    
    const newClient = {
        id: Date.now().toString(),
        name: document.getElementById('clientName').value,
        status: document.getElementById('clientStatus').value,
        totalValue: parseFloat(document.getElementById('totalValue').value),
        paidValue: parseFloat(document.getElementById('paidValue').value),
        hasFolder: document.getElementById('hasFolder').value,
        paymentStatus: document.getElementById('paymentStatus').value,
        observations: document.getElementById('observations').value,
        lastAccessed: new Date().toLocaleString(),
        lastUser: currentUser ? currentUser.username : 'Sistema',
        createdAt: new Date().toISOString(),
        phone: document.getElementById('clientPhone')?.value || '',
        email: document.getElementById('clientEmail')?.value || ''
    };
    
    clients.unshift(newClient);
    saveData();
    
    document.getElementById('clientForm').reset();
    displayClients();
    updateStats();
    showToast('Cliente adicionado com sucesso!', 'success');
}

// Exibir clientes
function displayClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    const filterPayment = document.getElementById('filterPayment').value;
    
    let filtered = clients;
    
    if (searchTerm) {
        filtered = filtered.filter(client => 
            client.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterStatus !== 'todos') {
        filtered = filtered.filter(client => client.status === filterStatus);
    }
    
    if (filterPayment !== 'todos') {
        filtered = filtered.filter(client => client.paymentStatus === filterPayment);
    }
    
    const clientsList = document.getElementById('clientsList');
    
    if (filtered.length === 0) {
        clientsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-search" style="font-size: 48px;"></i>
                <p>Nenhum cliente encontrado</p>
            </div>
        `;
        return;
    }
    
    clientsList.innerHTML = filtered.map(client => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-name">
                    <i class="fas fa-user"></i> ${escapeHtml(client.name)}
                </div>
                <div class="client-status status-${client.status}">
                    ${client.status.toUpperCase()}
                </div>
            </div>
            <div class="client-details">
                <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Total: R$ ${client.totalValue.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-money-bill"></i>
                    <span>Pago: R$ ${client.paidValue.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-folder"></i>
                    <span>Pasta: ${client.hasFolder === 'sim' ? '✓ Feita' : '✗ Não feita'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-credit-card"></i>
                    <span>Pagamento: ${getPaymentStatusText(client.paymentStatus)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Último acesso: ${client.lastAccessed || 'Nunca'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span>Último usuário: ${client.lastUser || 'Nenhum'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Cadastro: ${formatDate(client.createdAt)}</span>
                </div>
            </div>
            ${client.observations ? `
                <div class="detail-item">
                    <i class="fas fa-comment"></i>
                    <span>Obs: ${escapeHtml(client.observations)}</span>
                </div>
            ` : ''}
            <div class="client-actions">
                <button class="btn-view" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
                <button class="btn-edit" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteClient('${client.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
                <button class="btn-history" onclick="updateLastAccess('${client.id}')">
                    <i class="fas fa-history"></i> Registrar Acesso
                </button>
            </div>
        </div>
    `).join('');
}

// Visualizar cliente
window.viewClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (client) {
        const viewDetails = document.getElementById('viewDetails');
        viewDetails.innerHTML = `
            <div class="view-details">
                <div class="view-detail-row">
                    <div class="view-detail-label">Nome:</div>
                    <div class="view-detail-value">${escapeHtml(client.name)}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Status:</div>
                    <div class="view-detail-value">
                        <span class="client-status status-${client.status}">${client.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Valor Total:</div>
                    <div class="view-detail-value">R$ ${client.totalValue.toFixed(2)}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Valor Pago:</div>
                    <div class="view-detail-value">R$ ${client.paidValue.toFixed(2)}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Saldo Devedor:</div>
                    <div class="view-detail-value">R$ ${(client.totalValue - client.paidValue).toFixed(2)}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Pasta Feita:</div>
                    <div class="view-detail-value">${client.hasFolder === 'sim' ? 'Sim ✓' : 'Não ✗'}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Situação Pagamento:</div>
                    <div class="view-detail-value">${getPaymentStatusText(client.paymentStatus)}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Observações:</div>
                    <div class="view-detail-value">${escapeHtml(client.observations) || 'Nenhuma observação'}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Último Acesso:</div>
                    <div class="view-detail-value">${client.lastAccessed || 'Nunca'}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Último Usuário:</div>
                    <div class="view-detail-value">${client.lastUser || 'Nenhum'}</div>
                </div>
                <div class="view-detail-row">
                    <div class="view-detail-label">Data Cadastro:</div>
                    <div class="view-detail-value">${formatDate(client.createdAt)}</div>
                </div>
            </div>
        `;
        document.getElementById('viewModal').style.display = 'block';
    }
};

// Editar cliente
window.editClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (client) {
        document.getElementById('editClientId').value = id;
        document.getElementById('editName').value = client.name;
        document.getElementById('editStatus').value = client.status;
        document.getElementById('editTotalValue').value = client.totalValue;
        document.getElementById('editPaidValue').value = client.paidValue;
        document.getElementById('editHasFolder').value = client.hasFolder;
        document.getElementById('editPaymentStatus').value = client.paymentStatus;
        document.getElementById('editObservations').value = client.observations || '';
        
        document.getElementById('editModal').style.display = 'block';
    }
};

// Atualizar cliente
function updateClient(e) {
    e.preventDefault();
    
    const id = document.getElementById('editClientId').value;
    const index = clients.findIndex(c => c.id === id);
    
    if (index !== -1) {
        clients[index] = {
            ...clients[index],
            name: document.getElementById('editName').value,
            status: document.getElementById('editStatus').value,
            totalValue: parseFloat(document.getElementById('editTotalValue').value),
            paidValue: parseFloat(document.getElementById('editPaidValue').value),
            hasFolder: document.getElementById('editHasFolder').value,
            paymentStatus: document.getElementById('editPaymentStatus').value,
            observations: document.getElementById('editObservations').value,
            lastUser: currentUser ? currentUser.username : 'Sistema',
            lastAccessed: new Date().toLocaleString()
        };
        
        saveData();
        closeModal('editModal');
        displayClients();
        updateStats();
        showToast('Cliente atualizado com sucesso!', 'success');
    }
}

// Excluir cliente
window.deleteClient = (id) => {
    if (confirm('⚠️ Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        clients = clients.filter(c => c.id !== id);
        saveData();
        displayClients();
        updateStats();
        showToast('Cliente excluído com sucesso!', 'warning');
    }
};

// Registrar último acesso
window.updateLastAccess = (id) => {
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
        clients[index].lastAccessed = new Date().toLocaleString();
        clients[index].lastUser = currentUser ? currentUser.username : 'Sistema';
        saveData();
        displayClients();
        showToast('Acesso registrado com sucesso!', 'success');
    }
};

// Atualizar estatísticas
function updateStats() {
    const total = clients.length;
    const paid = clients.filter(c => c.paymentStatus === 'pago').length;
    const pending = clients.filter(c => c.paymentStatus === 'pendente').length;
    const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);
    const totalPaid = clients.reduce((sum, c) => sum + c.paidValue, 0);
    
    document.getElementById('totalClients').textContent = total;
    document.getElementById('paidClients').textContent = paid;
    document.getElementById('pendingClients').textContent = pending;
    document.getElementById('totalValue').textContent = `R$ ${totalValue.toFixed(2)}`;
}

// Exportar dados
function exportData() {
    const dataStr = JSON.stringify(clients, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `clientes_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Dados exportados com sucesso!', 'success');
}

// Importar dados
function importData(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    clients = importedData;
                    saveData();
                    displayClients();
                    updateStats();
                    showToast('Dados importados com sucesso!', 'success');
                } else {
                    showToast('Arquivo inválido', 'error');
                }
            } catch (error) {
                showToast('Erro ao importar arquivo', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Limpar todos os dados
function clearAllData() {
    if (confirm('⚠️ ATENÇÃO! Isso irá apagar TODOS os clientes. Tem certeza?')) {
        if (confirm('Última chance! Tem certeza absoluta?')) {
            clients = [];
            saveData();
            displayClients();
            updateStats();
            showToast('Todos os dados foram removidos!', 'warning');
        }
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Fechar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Mostrar toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Funções utilitárias
function getPaymentStatusText(status) {
    const statusMap = {
        'pago': '✅ Pago',
        'parcial': '🟡 Parcial',
        'pendente': '⏳ Pendente'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para calcular percentual pago
function getPaymentPercentage(client) {
    if (client.totalValue === 0) return 0;
    return (client.paidValue / client.totalValue * 100).toFixed(1);
}

// Função para gerar relatório
function generateReport() {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'ativo').length;
    const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);
    const totalPaid = clients.reduce((sum, c) => sum + c.paidValue, 0);
    
    const report = {
        generatedAt: new Date().toISOString(),
        generatedBy: currentUser?.username || 'Sistema',
        summary: {
            totalClients,
            activeClients,
            inactiveClients: clients.filter(c => c.status === 'inativo').length,
            pendingClients: clients.filter(c => c.status === 'pendente').length,
            totalValue,
            totalPaid,
            totalDebt: totalValue - totalPaid
        },
        clients: clients
    };
    
    return report;
}

// Exportar relatório em PDF (simulado)
function exportReport() {
    const report = generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `relatorio_${new Date().toISOString().slice(0,10)}.json`);
    linkElement.click();
    
    showToast('Relatório gerado com sucesso!', 'success');
}
