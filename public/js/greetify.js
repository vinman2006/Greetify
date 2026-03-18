// Greetify Data Engine v1.3
const API_URL = '/api/contacts';

// ── Data Fetch ─────────────────────────────────────────
async function loadContacts() {
    const counterEl = document.getElementById('node-counter');
    const typewriterEl = document.getElementById('typewriter-nav');
    if (typewriterEl) typewriterEl.textContent = 'SYNCING ATLAS...';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${response.status}`);
        }

        const contacts = await response.json();

        console.log('─────────────────────────────────────────');
        console.log(`[Registry] LOAD SUCCESS: ${contacts.length} records`);
        contacts.slice(0, 3).forEach((c, i) => console.log(`  ${i+1}. ${c.name}`));
        console.log('─────────────────────────────────────────');

        if (counterEl) counterEl.textContent = `${contacts.length} CONTACTS SYNCHRONIZED`;
        if (typewriterEl) typewriterEl.textContent = 'REGISTRY LIVE';

        window.contacts = contacts;
        processRegistry(contacts);

    } catch (error) {
        console.error('[Registry] SYNC ERROR:', error.message);
        if (counterEl) counterEl.textContent = 'SYNC ERROR';
        if (typewriterEl) typewriterEl.textContent = 'OFFLINE';
        showRegistryError(error.message);
    }
}

// ── Category Engine ────────────────────────────────────
function processRegistry(contacts) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const m = today.getMonth(), d = today.getDate(), y = today.getFullYear();

    const data = { today: [], upcoming7: [], upcoming30: [], missed: [], allUpcoming: [] };

    contacts.forEach(c => {
        const bDate = new Date(c.dob);
        const bMonth = bDate.getMonth();
        const bDay   = bDate.getDate();
        const thisYearBday = new Date(y, bMonth, bDay);

        const isToday = (m === bMonth && d === bDay);

        if (isToday) {
            data.today.push(c);
        } else {
            const diffDays = Math.ceil((thisYearBday - today) / 86400000);

            if (diffDays > 0 && diffDays <= 7) {
                data.upcoming7.push(c);
                data.allUpcoming.push({ ...c, diffDays });
            } else if (diffDays > 0 && diffDays <= 30) {
                data.upcoming30.push(c);
                data.allUpcoming.push({ ...c, diffDays });
            } else if (diffDays < 0 && !c.wished) {
                data.missed.push(c);
            }
        }
    });

    // Sort upcoming to find the absolute nearest
    data.allUpcoming.sort((a, b) => a.diffDays - b.diffDays);

    // ── Populate Stats Bar
    setEl('stat-total', contacts.length);
    setEl('stat-today', data.today.length);
    setEl('stat-upcoming', data.upcoming7.length);
    setEl('stat-missed', data.missed.length);

    // ── Populate Section Counters
    setEl('count-today', data.today.length);
    setEl('count-7d', data.upcoming7.length);
    setEl('count-30d', data.upcoming30.length);
    setEl('count-missed', data.missed.length);

    // ── Render
    renderToday(data.today, data.allUpcoming, data.upcoming7);
    renderList('upcoming-7d', data.upcoming7);
    renderList('upcoming-30d', data.upcoming30);
    renderList('missed-list', data.missed);
}

// ── Today Renderer ─────────────────────────────────────
function renderToday(list, allUpcoming, week7) {
    const container = document.getElementById('today-content');
    const emptyState = document.getElementById('today-empty');
    if (!container) return;

    // Clear old cards
    Array.from(container.children).forEach(c => { if (c.id !== 'today-empty') c.remove(); });

    if (list.length > 0) {
        if (emptyState) emptyState.style.display = 'none';
        const grid = document.createElement('div');
        grid.className = 'today-grid';
        list.forEach((item, idx) => {
            const card = createCard(item);
            grid.appendChild(card);
            if (typeof animateCardEntrance === 'function') animateCardEntrance(card, idx);
        });
        container.appendChild(grid);
    } else {
        if (emptyState) {
            emptyState.style.display = 'block';
            buildSmartEmptyState(allUpcoming, week7.length);
        }
    }
}

// ── Smart Empty State ──────────────────────────────────
function buildSmartEmptyState(allUpcoming, weekCount) {
    const nextPreviewEl = document.getElementById('next-birthday-preview');
    const weekSummaryEl = document.getElementById('week-summary-block');

    if (nextPreviewEl) {
        if (allUpcoming.length > 0) {
            const next = allUpcoming[0];
            const dateStr = formatDate(next.dob);
            nextPreviewEl.innerHTML = `
                <div class="next-birthday-preview">
                    <div style="text-align:left;">
                        <div class="next-label">NEXT BIRTHDAY</div>
                        <div class="next-name">${next.name}</div>
                        <div class="next-date">${dateStr} · ${next.diffDays} day${next.diffDays !== 1 ? 's' : ''} away</div>
                    </div>
                </div>
            `;
        } else {
            nextPreviewEl.innerHTML = '';
        }
    }

    if (weekSummaryEl && weekCount > 0) {
        weekSummaryEl.innerHTML = `
            <div class="week-stat">
                <div class="week-stat-num">${weekCount}</div>
                <div class="week-stat-label">THIS WEEK</div>
            </div>
        `;
    }
}

// ── Generic List Renderer ──────────────────────────────
function renderList(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<div class="mono" style="opacity:0.25; font-size:0.65rem; padding:16px 0;">NO RECORDS IN THIS WINDOW</div>`;
        return;
    }

    list.forEach((item, idx) => {
        const card = createCard(item);
        container.appendChild(card);
        if (typeof animateCardEntrance === 'function') animateCardEntrance(card, idx);
    });
}

// ── Card Factory ───────────────────────────────────────
function createCard(c) {
    const card = document.createElement('div');
    const isTeacher = c.type === 'teacher';
    card.className = `card ${isTeacher ? 'teacher' : 'student'}`;

    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
            <div style="flex:1; min-width:0;">
                <span class="card-badge mono">${c.type.toUpperCase()}</span>
                <h2 style="margin-top:8px; overflow:hidden; text-overflow:ellipsis;">${c.name}</h2>
                <div class="dob mono">${formatDate(c.dob)}</div>
            </div>
            <button class="btn-wish" onclick="openWhatsApp('${c.phone}', '${c.name}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.12-1.605c1.8 1.016 3.827 1.461 5.91 1.461h.005c6.637 0 12.032-5.396 12.035-12.03a11.81 11.81 0 00-3.616-8.528z"/>
                </svg>
                Wish
            </button>
        </div>
        <div class="card-footer">
            <div class="mono" style="font-size:0.55rem; opacity:0.3;">#${c._id.slice(-6)}</div>
            <div class="status-chip ${c.wished ? 'active' : ''}" onclick="toggleWished('${c._id}')">
                ${c.wished ? '✓ WISHED' : 'MARK WISHED'}
            </div>
        </div>
    `;
    return card;
}

// ── Helpers ────────────────────────────────────────────
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openWhatsApp(phone, name) {
    const msg = encodeURIComponent(`Hey ${name}, wishing you a very Happy Birthday! 🎂🎉`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
}

function toggleWished(id) {
    const contacts = window.contacts || [];
    const contact = contacts.find(c => c._id === id);
    if (contact) {
        contact.wished = !contact.wished;
        processRegistry(contacts);
    }
}

function showRegistryError(msg) {
    const tc = document.getElementById('today-content');
    if (tc) tc.innerHTML = `
        <div class="empty-module" style="border-color:rgba(204,88,51,0.3);">
            <div class="empty-icon">⚠️</div>
            <div class="empty-headline" style="color:var(--clay);">REGISTRY ERROR</div>
            <div style="color:rgba(255,255,255,0.35); font-size:0.8rem; margin-top:6px;">${msg}</div>
        </div>`;
}

document.addEventListener('DOMContentLoaded', loadContacts);
