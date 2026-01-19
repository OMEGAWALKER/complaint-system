const navItems = document.querySelectorAll('nav li');
const views = document.querySelectorAll('.view');
const currentDateEl = document.getElementById('currentDate');
const complaintForm = document.getElementById('complaintForm');
const recentTableBody = document.getElementById('recent-table-body');
const complaintsGrid = document.getElementById('complaintsGrid');
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const resolvedCountEl = document.getElementById('resolved-count');
const searchInput = document.getElementById('searchInput');
const settingsForm = document.getElementById('settingsForm');
const usernameInput = document.getElementById('username');
const displayUsername = document.getElementById('displayUsername');

document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    loadComplaints();
    setupNavigation();
    setupSearch();
    loadUsername();
    setupSettings();
});

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;

            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active-view'));

            item.classList.add('active');
            document.getElementById(tabName).classList.add('active-view');
        });
    });
}

complaintForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const category = document.getElementById('category').value;
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('description').value;

    const newComplaint = {
        id: 'CMS-' + Math.floor(Math.random() * 10000),
        subject,
        category,
        priority,
        description,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
    };

    saveComplaint(newComplaint);

    complaintForm.reset();
    document.querySelector('[data-tab=dashboard]').click();

});

function getComplaints() {
    return JSON.parse(localStorage.getItem('cms_complaints')) || [];
}

function saveComplaint(complaint) {
    const complaints = getComplaints();
    complaints.unshift(complaint);
    localStorage.setItem('cms_complaints', JSON.stringify(complaints));
    loadComplaints();
}

function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
        return;
    }

    const complaints = getComplaints();
    const filtered = complaints.filter(c => c.id !== id);
    localStorage.setItem('cms_complaints', JSON.stringify(filtered));
    loadComplaints();
}

function updateComplaintStatus(id) {
    const complaints = getComplaints();
    const complaint = complaints.find(c => c.id === id);

    if (complaint) {
        complaint.status = complaint.status === 'Pending' ? 'Resolved' : 'Pending';
        localStorage.setItem('cms_complaints', JSON.stringify(complaints));
        loadComplaints();
    }
}

function loadComplaints() {
    const complaints = getComplaints();

    updateStats(complaints);
    renderRecentTable(complaints);
    renderHistoryGrid(complaints);
}

function updateStats(complaints) {
    totalCountEl.textContent = complaints.length;
    pendingCountEl.textContent = complaints.filter(c => c.status === 'Pending').length;
    resolvedCountEl.textContent = complaints.filter(c => c.status === 'Resolved').length;
}

function renderRecentTable(complaints) {
    recentTableBody.innerHTML = '';
    const recent = complaints.slice(0, 5);

    if (recent.length === 0) {
        recentTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No complaints found.</td></tr>';
        return;
    }

    recent.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.id}</td>
            <td>${c.subject}</td>
            <td>${c.category}</td>
            <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
            <td>${c.date}</td>
        `;
        recentTableBody.appendChild(row);
    });
}

function renderHistoryGrid(complaints) {
    complaintsGrid.innerHTML = '';

    if (complaints.length === 0) {
        complaintsGrid.innerHTML = '<p class="empty-state" style="grid-column: 1/-1; text-align: center;">No history available.</p>';
        return;
    }

    complaints.forEach(c => {
        const card = createComplaintCard(c);
        complaintsGrid.appendChild(card);
    });
}

function createComplaintCard(c) {
    const div = document.createElement('div');
    div.className = 'complaint-card';
    div.innerHTML = `
        <div class="card-header">
            <span class="card-id">${c.id}</span>
            <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
        </div>
        <div>
            <h3 class="card-title">${c.subject}</h3>
            <span class="card-category">${c.category} • ${c.priority}</span>
        </div>
        <p class="card-desc">${c.description}</p>
        <div class="card-footer">
            <span>${c.date}</span>
        </div>
    `;
    return div;
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const complaints = getComplaints();

        const filtered = complaints.filter(c =>
            c.subject.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term)
        );

        renderHistoryGrid(filtered);
    });
}

function getUsername() {
    return localStorage.getItem('cms_username') || 'Danny';
}

function saveUsername(name) {
    localStorage.setItem('cms_username', name);
    displayUsername.textContent = name;
}

function loadUsername() {
    const savedName = getUsername();
    displayUsername.textContent = savedName;
    usernameInput.value = savedName;
}

function setupSettings() {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = usernameInput.value.trim();

        if (newUsername) {
            saveUsername(newUsername);
            alert('Username updated successfully!');
        }
    });
}
