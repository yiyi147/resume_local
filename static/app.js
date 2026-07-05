const API = '/api';
let currentResume = null;
let currentSection = 'basics';
let importData = null;
let draggedSection = null;
let collapsedItems = {};
let previewZoom = 1;

const defaultResumeData = {
    basics: { 
        name: '', email: '', phone: '', location: '', summary: '', photo: '', photo_shape: 'circle',
        field_config: {
            phone: { label: '电话', icon: 'phone', row: 1, order: 1 },
            email: { label: '邮箱', icon: 'mail', row: 1, order: 2 },
            location: { label: '所在地', icon: 'map-pin', row: 2, order: 3 },
            website: { label: '个人网站', icon: 'globe', row: 2, order: 4 },
        },
        custom_fields: []
    },
    education: [],
    work: [],
    projects: [],
    skills: [],
    awards: [],
    custom: []
};

const sectionLabels = {
    basics: '基本信息', education: '教育背景', work: '工作经历',
    projects: '项目经历', skills: '专业技能', awards: '荣誉奖项'
};

const defaultSectionOrder = ['basics', 'education', 'work', 'projects', 'skills', 'awards'];

const svgIcons = {
    'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'globe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'briefcase': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'graduation-cap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5"/></svg>',
    'rocket': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.92a5.2 5.2 0 0 0-2.09-1.07z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 5.5-2.5 8.5 0 0-1.5 2-2 3.5-1 1.5-3 2-3 2z"/><path d="M9 12H4s.55-.47 1.5-1c.77-.54 1.86-.77 2.5-.77h1"/><path d="M14 9v4.5s1.5.5 2.5.5"/></svg>',
    'zap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'trophy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    'dollar-sign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'target': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    'lightbulb': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.7A7 7 0 0 0 12 2z"/></svg>',
    'wrench': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.79 7.79l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.79-7.79l-3.76 3.76z"/></svg>',
    'bar-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'palette': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.985-.385-1.525-.197-.542-.366-1.185-.366-1.775 0-1.364 1.105-2.471 2.471-2.471.634 0 1.167.221 1.623.549.487.332.856.875.856 1.461 0 .957-.394 1.775-.944 2.324-.587.587-1.339.887-2.25.887-2.226 0-4-1.556-4-3.472 0-1.916 1.774-3.472 4-3.472.839 0 1.637.367 2.157.876C16.776 10.37 16 11.648 16 13.066c0 1.153.659 2.163 1.602 2.802.256.172.545.314.854.426.223.082.458.144.7.183.484.08.985.124 1.499.124C18.294 21.63 22 17.923 22 13.308 22 7.692 17.517 2 12 2z"/></svg>',
    'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    'languages': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2v3"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/></svg>',
    'school': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5"/></svg>',
    'award': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    'calendar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'tag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
};

function getSvgIcon(name) { return svgIcons[name] || svgIcons['file-text']; }

function getSectionOrder() { return currentResume?.data?.sectionOrder || [...defaultSectionOrder]; }
function setSectionOrder(order) { if (!currentResume.data) currentResume.data = {}; currentResume.data.sectionOrder = order; }

async function api(method, path, data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(`${API}${path}`, opts);
    return res.json();
}

function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); }

async function showResumeList() {
    showView('resume-list-view');
    const resumes = await api('GET', '/resumes');
    const list = document.getElementById('resume-list');
    if (!resumes.length) { list.innerHTML = '<div class="empty-state"><p>还没有简历</p><p>点击"新建简历"开始</p></div>'; return; }
    list.innerHTML = resumes.map(r => `<div class="resume-card" onclick="openResume(${r.id})"><h3>${r.title}</h3><p>模板: ${r.template} | ${new Date(r.updated_at).toLocaleDateString()}</p><div class="card-actions"><button onclick="event.stopPropagation();deleteResume(${r.id})" class="btn btn-danger btn-sm">删除</button></div></div>`).join('');
}

async function createNewResume() {
    const title = prompt('请输入简历标题:', '我的简历');
    if (!title) return;
    const res = await api('POST', '/resumes', { title, data: JSON.parse(JSON.stringify(defaultResumeData)), template: 'modern' });
    openResume(res.id);
}

async function openResume(id) {
    currentResume = await api('GET', `/resumes/${id}`);
    if (!currentResume.data.sectionOrder) currentResume.data.sectionOrder = [...defaultSectionOrder];
    if (!currentResume.data.basics) currentResume.data.basics = defaultResumeData.basics;
    if (!currentResume.data.basics.field_config) currentResume.data.basics.field_config = JSON.parse(JSON.stringify(defaultResumeData.basics.field_config));
    if (!currentResume.data.basics.custom_fields) currentResume.data.basics.custom_fields = [];
    if (!currentResume.data.custom) currentResume.data.custom = [];
    collapsedItems = {};
    document.getElementById('editor-title').textContent = currentResume.title;
    document.getElementById('template-select').value = currentResume.template || 'modern';
    showView('editor-view');
    renderSectionNav();
    showSection(currentSection);
    refreshPreview();
}

async function deleteResume(id) {
    if (!confirm('确定删除？')) return;
    await api('DELETE', `/resumes/${id}`);
    showResumeList();
}

function renderSectionNav() {
    const nav = document.getElementById('section-nav');
    const order = getSectionOrder();
    const customs = currentResume?.data?.custom || [];
    
    let html = order.map(s => {
        let label = sectionLabels[s] || s;
        if (s.startsWith('custom_')) {
            const idx = parseInt(s.replace('custom_', ''));
            label = customs[idx]?.title || '自定义';
        }
        return `<button onclick="if(!draggedSection)showSection('${s}')" class="section-btn ${s === currentSection ? 'active' : ''}" data-section="${s}" draggable="true" ondragstart="onDragStart(event,'${s}')" ondragover="onDragOver(event)" ondrop="onDrop(event,'${s}')" ondragend="onDragEnd(event)">${label}</button>`;
    }).join('');
    
    customs.forEach((sec, i) => {
        if (!order.includes('custom_' + i)) {
            html += `<button onclick="if(!draggedSection)showSection('custom_${i}')" class="section-btn ${currentSection === 'custom_'+i ? 'active' : ''}" data-section="custom_${i}" draggable="true" ondragstart="onDragStart(event,'custom_${i}')" ondragover="onDragOver(event)" ondrop="onDrop(event,'custom_${i}')" ondragend="onDragEnd(event)">${sec.title || '自定义'}</button>`;
        }
    });
    html += `<button onclick="showAddCustomModal()" class="section-btn add-section-btn">+ 添加模块</button>`;
    nav.innerHTML = html;
}

function showSection(s) { currentSection = s; document.querySelectorAll('.section-btn').forEach(b => b.classList.toggle('active', b.dataset.section === s)); renderEditor(); }
function onDragStart(e, s) { draggedSection = s; e.dataTransfer.effectAllowed = 'move'; e.target.classList.add('dragging'); }
function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function onDrop(e, target) {
    e.preventDefault();
    if (draggedSection === target) return;
    
    const isDragCustom = draggedSection.startsWith('custom_');
    const isTargetCustom = target.startsWith('custom_');
    
    if (isDragCustom && isTargetCustom) {
        const customs = currentResume.data.custom || [];
        const fi = parseInt(draggedSection.replace('custom_', ''));
        const ti = parseInt(target.replace('custom_', ''));
        if (isNaN(fi) || isNaN(ti) || fi < 0 || ti < 0) return;
        const item = customs.splice(fi, 1)[0];
        customs.splice(ti, 0, item);
        if (currentSection === draggedSection) currentSection = 'custom_' + ti;
        renderSectionNav(); refreshPreview(); autoSave();
    } else if (!isDragCustom && !isTargetCustom) {
        const order = getSectionOrder(), fi = order.indexOf(draggedSection), ti = order.indexOf(target);
        if (fi === -1 || ti === -1) return;
        order.splice(fi, 1); order.splice(ti, 0, draggedSection);
        setSectionOrder(order); renderSectionNav(); refreshPreview(); autoSave();
    } else if (isDragCustom && !isTargetCustom) {
        // Move custom before standard section - just reorder sectionOrder
        const order = getSectionOrder();
        const ti = order.indexOf(target);
        if (ti === -1) return;
        // Add custom to sectionOrder if not already there
        if (!order.includes(draggedSection)) {
            order.splice(ti, 0, draggedSection);
        } else {
            const fi = order.indexOf(draggedSection);
            order.splice(fi, 1);
            order.splice(ti > fi ? ti - 1 : ti, 0, draggedSection);
        }
        setSectionOrder(order); renderSectionNav(); refreshPreview(); autoSave();
    } else if (!isDragCustom && isTargetCustom) {
        const order = getSectionOrder();
        const fi = order.indexOf(draggedSection);
        if (fi === -1) return;
        order.splice(fi, 1);
        const ti = order.indexOf(target);
        if (ti !== -1) order.splice(ti, 0, draggedSection);
        else order.push(draggedSection);
        setSectionOrder(order); renderSectionNav(); refreshPreview(); autoSave();
    }
}
function onDragEnd(e) { e.target.classList.remove('dragging'); draggedSection = null; }

function renderEditor() {
    const c = document.getElementById('editor-content'), d = currentResume?.data || defaultResumeData;
    if (currentSection === 'basics') c.innerHTML = renderBasics(d.basics || {});
    else if (currentSection === 'education') c.innerHTML = renderList('education', d.education || [], renderEducationItem);
    else if (currentSection === 'work') c.innerHTML = renderList('work', d.work || [], renderWorkItem);
    else if (currentSection === 'projects') c.innerHTML = renderList('projects', d.projects || [], renderProjectItem);
    else if (currentSection === 'skills') c.innerHTML = renderSkills(d.skills || []);
    else if (currentSection === 'awards') c.innerHTML = renderList('awards', d.awards || [], renderAwardItem);
    else if (currentSection === 'custom') c.innerHTML = renderCustomSections();
    else if (currentSection.startsWith('custom_')) {
        const idx = parseInt(currentSection.replace('custom_', ''));
        c.innerHTML = renderCustomSection(d.custom?.[idx] || { title: '新模块', items: [] });
    }
}

function renderBasics(basics) {
    const ps = basics.photo_shape || 'circle';
    const cfg = basics.field_config || {};
    const fields = Object.entries(cfg).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
    const rows = {}; fields.forEach(([k, v]) => { const r = v.row || 1; if (!rows[r]) rows[r] = []; rows[r].push({ key: k, ...v }); });

    let fieldsHTML = '';
    Object.keys(rows).sort((a, b) => a - b).forEach(row => {
        fieldsHTML += `<div class="basics-field-row">`;
        rows[row].forEach(f => {
            fieldsHTML += `<div class="basics-field-item" draggable="true" ondragstart="onFieldDragStart(event,'${f.key}')" ondragover="onFieldDragOver(event)" ondrop="onFieldDrop(event,'${f.key}')" ondragend="onFieldDragEnd(event)">
                <div class="field-icon-btn" onclick="toggleFieldIconPicker('${f.key}')">${getSvgIcon(f.icon)}</div>
                <div class="field-icon-picker" id="icon-picker-${f.key}" style="display:none">${Object.keys(svgIcons).map(k=>`<span class="icon-opt ${k===f.icon?'selected':''}" onclick="setFieldIcon('${f.key}','${k}')">${getSvgIcon(k)}</span>`).join('')}</div>
                <span class="field-label">${f.label}</span>
                <input value="${basics[f.key]||''}" onchange="updateField('${f.key}',this.value)" placeholder="${f.label}" class="field-input">
                <div class="row-selector">${[1,2,3,4].map(r => `<button class="row-btn ${r===f.row?'active':''}" onclick="setFieldRow('${f.key}',${r})">${r}</button>`).join('')}</div>
            </div>`;
        });
        fieldsHTML += '</div>';
    });

    const customFields = (basics.custom_fields || []).map((f, i) => `<div class="basics-field-item custom-field" draggable="true" ondragstart="onFieldDragStart(event,'custom_${i}')" ondragover="onFieldDragOver(event)" ondrop="onFieldDrop(event,'custom_${i}')" ondragend="onFieldDragEnd(event)">
        <div class="field-icon-btn" onclick="toggleFieldIconPicker('custom_${i}')">${getSvgIcon(f.icon)}</div>
        <div class="field-icon-picker" id="icon-picker-custom_${i}" style="display:none">${Object.keys(svgIcons).map(k=>`<span class="icon-opt ${k===f.icon?'selected':''}" onclick="setCustomFieldIcon(${i},'${k}')">${getSvgIcon(k)}</span>`).join('')}</div>
        <span class="field-label custom">自定义</span>
        <input value="${f.value||''}" onchange="updateCustomField(${i},'value',this.value)" placeholder="附加内容" class="field-input">
        <button class="field-delete-btn" onclick="removeCustomField(${i})">✕</button>
    </div>`).join('');

    return `<div class="basics-section">
        <div class="basics-header-row"><label class="section-label">头像</label><div class="photo-upload">
            ${basics.photo?`<img src="${basics.photo}" alt="" class="photo-thumb photo-${ps}">`:''}
            <input type="file" id="photo-input" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">
            <button onclick="document.getElementById('photo-input').click()" class="btn btn-outline btn-sm">上传</button>
            ${basics.photo?'<button onclick="removePhoto()" class="btn btn-ghost btn-sm">移除</button>':''}
            <select onchange="updateData('basics.photo_shape',this.value);renderEditor()" class="small-select"><option value="circle" ${ps==='circle'?'selected':''}>圆形</option><option value="square" ${ps==='square'?'selected':''}>方形</option><option value="rounded" ${ps==='rounded'?'selected':''}>圆角</option></select>
        </div></div>
        <div class="basics-header-row"><label class="section-label">姓名</label><input value="${basics.name||''}" onchange="updateData('basics.name',this.value)" class="field-input-full" placeholder="请输入姓名"></div>
        <div class="fields-container"><div class="fields-header"><span class="section-label">信息字段</span><span class="field-hint">拖拽排序 · 数字改行</span></div>${fieldsHTML}</div>
        <div class="fields-container"><div class="fields-header"><span class="section-label">自定义字段</span><button onclick="addCustomField()" class="btn btn-outline btn-sm">+ 添加</button></div>
        ${customFields.length?`<div class="basics-field-row">${customFields}</div>`:'<p class="empty-hint">点击添加自定义字段</p>'}</div>
        <div class="summary-section"><label class="section-label">个人简介</label><div class="rich-editor"><div class="editor-toolbar">
            <button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button><button onclick="execRichCmd('underline')"><u>U</u></button>
            <span class="toolbar-sep"></span><button onclick="execRichCmd('justifyLeft')">≡</button><button onclick="execRichCmd('justifyCenter')">≡</button><button onclick="execRichCmd('justifyRight')">≡</button>
        </div><div class="rich-content" contenteditable="true" oninput="updateData('basics.summary',this.innerHTML)">${basics.summary||''}</div></div></div>
    </div>`;
}

let fieldDragKey = null;
function onFieldDragStart(e,k){fieldDragKey=k;e.dataTransfer.effectAllowed='move';e.target.classList.add('dragging');}
function onFieldDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}
function onFieldDrop(e,k){
    e.preventDefault();
    if(!fieldDragKey||fieldDragKey===k||fieldDragKey.startsWith('custom_')||k.startsWith('custom_'))return;
    const cfg=currentResume.data.basics.field_config,fo=cfg[fieldDragKey].order,to=cfg[k].order;
    Object.values(cfg).forEach(f=>{if(fo<to){if(f.order>fo&&f.order<=to)f.order--;}else{if(f.order>=fo&&f.order<to)f.order++;}});
    cfg[fieldDragKey].order=to;renderEditor();autoSave();
}
function onFieldDragEnd(e){e.target.classList.remove('dragging');fieldDragKey=null;}
function setFieldIcon(k,icon){currentResume.data.basics.field_config[k].icon=icon;document.querySelectorAll('.field-icon-picker').forEach(p=>p.style.display='none');renderEditor();autoSave();}
function toggleFieldIconPicker(k){const p=document.getElementById('icon-picker-'+k);if(p)p.style.display=p.style.display==='none'?'grid':'none';}
function setFieldRow(k,r){currentResume.data.basics.field_config[k].row=r;renderEditor();autoSave();}
function updateField(k,v){currentResume.data.basics[k]=v;autoSave();}
function addCustomField(){currentResume.data.basics.custom_fields.push({label:'自定义',value:'',icon:'tag',row:1,order:100});renderEditor();autoSave();}
function removeCustomField(i){currentResume.data.basics.custom_fields.splice(i,1);renderEditor();autoSave();}
function updateCustomField(i,f,v){currentResume.data.basics.custom_fields[i][f]=v;autoSave();}
function setCustomFieldIcon(i,icon){currentResume.data.basics.custom_fields[i].icon=icon;document.querySelectorAll('.field-icon-picker').forEach(p=>p.style.display='none');renderEditor();autoSave();}

function renderList(section,items,renderItem){
    return `<div class="list-header"><span class="section-label">${sectionLabels[section]||section}</span><span class="item-count">${items.length} 条</span></div>
    ${items.map((item,i)=>`<div class="item-card"><div class="item-header-bar" onclick="toggleItem('${section}',${i})"><span class="item-title">${getItemTitle(section,item)}</span><div class="item-actions"><button class="item-delete-btn" onclick="event.stopPropagation();removeItem('${section}',${i})">✕</button><span class="collapse-icon ${collapsedItems[section+'_'+i]?'':'rotated'}">▼</span></div></div><div class="item-content ${collapsedItems[section+'_'+i]?'collapsed':''}">${renderItem(section,item,i)}</div></div>`).join('')}
    <button class="add-btn" onclick="addItem('${section}')">+ 添加</button>`;
}
function getItemTitle(s,item){if(s==='education')return item.school||'新教育经历';if(s==='work')return item.company||'新工作经历';if(s==='projects')return item.name||'新项目';if(s==='awards')return item.title||'新奖项';return '新条目';}
function toggleItem(s,i){const k=s+'_'+i;collapsedItems[k]=!collapsedItems[k];renderEditor();}

function renderEducationItem(s,item,i){return `<div class="form-row"><div class="form-group"><label>学校</label><input value="${item.school||''}" onchange="updateItem('${s}',${i},'school',this.value)"></div><div class="form-group"><label>时间</label><input value="${item.date||''}" onchange="updateItem('${s}',${i},'date',this.value)"></div></div><div class="form-row"><div class="form-group"><label>学位</label><input value="${item.degree||''}" onchange="updateItem('${s}',${i},'degree',this.value)"></div><div class="form-group"><label>专业</label><input value="${item.major||''}" onchange="updateItem('${s}',${i},'major',this.value)"></div></div><div class="form-group"><label>描述</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button><span class="toolbar-sep"></span><button onclick="execRichCmd('justifyLeft')">≡</button><button onclick="execRichCmd('justifyCenter')">≡</button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'description',this.innerHTML)">${item.description||''}</div></div></div>`;}

function renderWorkItem(s,item,i){return `<div class="form-row"><div class="form-group"><label>公司</label><input value="${item.company||''}" onchange="updateItem('${s}',${i},'company',this.value)"></div><div class="form-group"><label>时间</label><input value="${item.date||''}" onchange="updateItem('${s}',${i},'date',this.value)"></div></div><div class="form-group"><label>职位</label><input value="${item.position||''}" onchange="updateItem('${s}',${i},'position',this.value)"></div><div class="form-group"><label>描述</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button><span class="toolbar-sep"></span><button onclick="execRichCmd('justifyLeft')">≡</button><button onclick="execRichCmd('justifyCenter')">≡</button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'description',this.innerHTML)">${item.description||''}</div></div></div><div class="form-group"><label>工作亮点</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'highlights',this.innerHTML.split(/<br>/).map(h=>h.replace(/<[^>]*>/g,'').trim()).filter(Boolean))">${(item.highlights||[]).join('\n')}</div></div></div>`;}

function renderProjectItem(s,item,i){return `<div class="form-row"><div class="form-group"><label>项目名</label><input value="${item.name||''}" onchange="updateItem('${s}',${i},'name',this.value)"></div><div class="form-group"><label>时间</label><input value="${item.date||''}" onchange="updateItem('${s}',${i},'date',this.value)"></div></div><div class="form-group"><label>描述</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button><span class="toolbar-sep"></span><button onclick="execRichCmd('justifyLeft')">≡</button><button onclick="execRichCmd('justifyCenter')">≡</button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'description',this.innerHTML)">${item.description||''}</div></div></div><div class="form-group"><label>项目亮点</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'highlights',this.innerHTML.split(/<br>/).map(h=>h.replace(/<[^>]*>/g,'').trim()).filter(Boolean))">${(item.highlights||[]).join('\n')}</div></div></div>`;}

function renderSkills(skills){return `<div class="form-group"><label>专业技能</label><div class="skills-input">${skills.map((s,i)=>`<span class="skill-tag">${typeof s==='string'?s:s.name}<span class="remove" onclick="removeSkill(${i})">×</span></span>`).join('')}<input id="skill-input" placeholder="输入技能后回车" onkeydown="if(event.key==='Enter'){addSkill(this.value);this.value='';}"></div></div>`;}

function renderAwardItem(s,item,i){return `<div class="form-row"><div class="form-group"><label>奖项</label><input value="${item.title||''}" onchange="updateItem('${s}',${i},'title',this.value)"></div><div class="form-group"><label>时间</label><input value="${item.date||''}" onchange="updateItem('${s}',${i},'date',this.value)"></div></div><div class="form-group"><label>描述</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button></div><div class="rich-content" contenteditable="true" oninput="updateItem('${s}',${i},'description',this.innerHTML)">${item.description||''}</div></div></div>`;}

function renderCustomSections(){const d=currentResume?.data||defaultResumeData;const c=d.custom||[];return `<div class="list-header"><span class="section-label">自定义模块</span><span class="item-count">${c.length} 个</span></div>${c.length?'':'<p class="empty-hint">点击导航栏中的"+ 添加模块"按钮创建自定义模块</p>'}${c.map((sec,i)=>`<div class="item-card"><div class="item-header-bar" onclick="showSection('custom_${i}')"><span class="item-title">${sec.title}</span><div class="item-actions"><button class="item-delete-btn" onclick="event.stopPropagation();removeCustomSection(${i})">✕</button><span class="collapse-icon">▶</span></div></div></div>`).join('')}`;}

function renderCustomSection(sec){const items=sec.items||[];return `<div class="custom-edit-header"><button onclick="showSection('custom')" class="btn btn-ghost btn-sm">← 返回</button><input value="${sec.title||''}" onchange="updateCustomTitle(this.value)" placeholder="模块标题" class="field-input-full"></div>${items.map((item,i)=>`<div class="item-card"><div class="item-header-bar" onclick="toggleItem('custom_${currentSection.replace('custom_','')}',${i})"><span class="item-title">${item.title||'新条目'}</span><div class="item-actions"><button class="item-delete-btn" onclick="event.stopPropagation();removeCustomItem(${i})">✕</button><span class="collapse-icon ${collapsedItems['custom_'+currentSection.replace('custom_','')+'_'+i]?'':'rotated'}">▼</span></div></div><div class="item-content ${collapsedItems['custom_'+currentSection.replace('custom_','')+'_'+i]?'collapsed':''}"><div class="form-group"><label>标题</label><input value="${item.title||''}" onchange="updateCustomItem(${i},'title',this.value)"></div><div class="form-group"><label>内容</label><div class="rich-editor"><div class="editor-toolbar"><button onclick="execRichCmd('bold')"><b>B</b></button><button onclick="execRichCmd('italic')"><i>I</i></button><span class="toolbar-sep"></span><button onclick="execRichCmd('justifyLeft')">≡</button><button onclick="execRichCmd('justifyCenter')">≡</button></div><div class="rich-content" contenteditable="true" oninput="updateCustomItem(${i},'content',this.innerHTML)">${item.content||''}</div></div></div></div>`).join('')}<button class="add-btn" onclick="addCustomItem()">+ 添加条目</button>`;}

function updateData(p,v){const k=p.split('.');let o=currentResume.data;for(let i=0;i<k.length-1;i++)o=o[k[i]]||{};o[k[k.length-1]]=v;}
function updateItem(s,i,f,v){if(!currentResume.data[s])currentResume.data[s]=[];currentResume.data[s][i][f]=v;autoSave();}
function addItem(s){if(!currentResume.data[s])currentResume.data[s]=[];const d={education:{school:'',degree:'',major:'',date:'',description:''},work:{company:'',position:'',date:'',description:'',highlights:[]},projects:{name:'',date:'',description:'',highlights:[]},awards:{title:'',date:'',description:''}};currentResume.data[s].push(d[s]||{});renderEditor();autoSave();}
function removeItem(s,i){currentResume.data[s].splice(i,1);renderEditor();autoSave();}
function addSkill(skill){if(!skill.trim())return;if(!currentResume.data.skills)currentResume.data.skills=[];currentResume.data.skills.push(skill.trim());renderEditor();autoSave();}
function removeSkill(i){currentResume.data.skills.splice(i,1);renderEditor();autoSave();}
function execRichCmd(c,v){document.execCommand(c,false,v||null);}

function showAddCustomModal(){document.getElementById('custom-modal').style.display='flex';document.getElementById('custom-title').value='';}
function closeCustomModal(){document.getElementById('custom-modal').style.display='none';}
function confirmAddCustom(){const title=document.getElementById('custom-title').value.trim();if(!title){alert('请输入模块标题');return;}if(!currentResume.data.custom)currentResume.data.custom=[];currentResume.data.custom.push({title,items:[]});closeCustomModal();renderSectionNav();showSection('custom_'+(currentResume.data.custom.length-1));autoSave();}

function addCustomItem(){const idx=parseInt(currentSection.replace('custom_',''));if(!currentResume.data.custom?.[idx])return;if(!currentResume.data.custom[idx].items)currentResume.data.custom[idx].items=[];currentResume.data.custom[idx].items.push({title:'',content:''});renderEditor();autoSave();}
function removeCustomItem(ii){const idx=parseInt(currentSection.replace('custom_',''));if(currentResume.data.custom?.[idx]?.items){currentResume.data.custom[idx].items.splice(ii,1);renderEditor();autoSave();}}
function updateCustomItem(ii,f,v){const idx=parseInt(currentSection.replace('custom_',''));if(currentResume.data.custom?.[idx]?.items?.[ii]){currentResume.data.custom[idx].items[ii][f]=v;autoSave();}}
function removeCustomSection(i){if(!confirm('确定删除？'))return;currentResume.data.custom.splice(i,1);showSection('custom');autoSave();}
function updateCustomTitle(v){const idx=parseInt(currentSection.replace('custom_',''));if(currentResume.data.custom?.[idx])currentResume.data.custom[idx].title=v;autoSave();}
function updateCustomIcon(v){const idx=parseInt(currentSection.replace('custom_',''));if(currentResume.data.custom?.[idx])currentResume.data.custom[idx].icon=v;autoSave();}

async function handlePhotoUpload(e){const f=e.target.files[0];if(!f)return;const fd=new FormData();fd.append('file',f);try{const r=await fetch(`${API}/upload/photo`,{method:'POST',body:fd});const d=await r.json();if(d.url){updateData('basics.photo',d.url);renderEditor();refreshPreview();}}catch(e){alert('上传失败');}}
function removePhoto(){updateData('basics.photo','');renderEditor();refreshPreview();}

let autoSaveTimer=null;function autoSave(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(async()=>{if(!currentResume)return;await api('PUT',`/resumes/${currentResume.id}`,{data:currentResume.data});refreshPreview();},800);}

async function saveResume(){if(!currentResume)return;await api('PUT',`/resumes/${currentResume.id}`,{data:currentResume.data});refreshPreview();}

async function refreshPreview(){if(!currentResume)return;const r=await api('GET',`/resumes/${currentResume.id}/preview`);const f=document.getElementById('preview-iframe');if(f){f.srcdoc='';setTimeout(()=>{f.srcdoc=r.html;},10);}}

function setPreviewZoom(z){previewZoom=Math.max(0.3,Math.min(2,z));document.getElementById('preview-iframe').style.transform=`scale(${previewZoom})`;document.getElementById('preview-iframe').style.transformOrigin='top left';document.getElementById('zoom-level').textContent=Math.round(previewZoom*100)+'%';}

async function changeTemplate(t){if(!currentResume)return;currentResume.template=t;await api('PUT',`/resumes/${currentResume.id}`,{template:t});refreshPreview();}
async function exportPDF(){if(!currentResume)return;window.open(`${API}/resumes/${currentResume.id}/export/pdf`,'_blank');}
async function exportWord(){if(!currentResume)return;window.open(`${API}/resumes/${currentResume.id}/export/word`,'_blank');}

function showImportModal(){document.getElementById('import-modal').style.display='flex';document.getElementById('import-preview').style.display='none';document.getElementById('upload-area').style.display='block';}
function closeImportModal(){document.getElementById('import-modal').style.display='none';importData=null;}
async function handleFileSelect(e){const f=e.target.files[0];if(!f)return;const fd=new FormData();fd.append('file',f);const ep=f.name.endsWith('.pdf')?'/import/pdf':'/import/word';try{const r=await fetch(`${API}${ep}`,{method:'POST',body:fd});const d=await r.json();if(d.data){importData=d.data;importData.sectionOrder=[...defaultSectionOrder];document.getElementById('upload-area').style.display='none';document.getElementById('import-preview').style.display='block';let h='<div class="import-item"><span class="import-label">文件名</span><span class="import-value">'+d.filename+'</span></div>';if(d.data.basics?.name)h+='<div class="import-item"><span class="import-label">姓名</span><span class="import-value">'+d.data.basics.name+'</span></div>';if(d.data.basics?.email)h+='<div class="import-item"><span class="import-label">邮箱</span><span class="import-value">'+d.data.basics.email+'</span></div>';if(d.data.education?.length)h+='<div class="import-item"><span class="import-label">教育经历</span><span class="import-value">'+d.data.education.length+' 条</span></div>';if(d.data.work?.length)h+='<div class="import-item"><span class="import-label">工作经历</span><span class="import-value">'+d.data.work.length+' 条</span></div>';if(d.data.skills?.length)h+='<div class="import-item"><span class="import-label">技能</span><span class="import-value">'+d.data.skills.length+' 项</span></div>';document.getElementById('import-data').innerHTML=h;}else{alert('解析失败: '+(d.detail||'未知错误'));}}catch(e){alert('上传失败');}}
async function confirmImport(){if(!importData)return;const t=prompt('请输入简历标题:','导入的简历');if(!t)return;const r=await api('POST','/resumes',{title:t,data:importData,template:'modern'});closeImportModal();openResume(r.id);}

document.addEventListener('DOMContentLoaded',showResumeList);
