// 竞赛列表页面功能
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('competitions.html')) {
        initCompetitionsPage();
    }
    
    if (window.location.pathname.includes('competition-detail.html')) {
        initCompetitionDetailPage();
    }
    
    if (window.location.pathname.includes('my-registrations.html')) {
        initMyRegistrationsPage();
    }
});

// 初始化竞赛列表页面
function initCompetitionsPage() {
    // 显示所有竞赛
    displayAllCompetitions();
    
    // 搜索功能
    document.getElementById('search-input').addEventListener('input', filterCompetitions);
    document.getElementById('search-btn').addEventListener('click', filterCompetitions);
    
    // 筛选功能
    document.getElementById('category-filter').addEventListener('change', filterCompetitions);
    document.getElementById('status-filter').addEventListener('change', filterCompetitions);
    document.getElementById('difficulty-filter').addEventListener('change', filterCompetitions);
    
    // 重置筛选
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// 显示所有竞赛
function displayAllCompetitions(competitions = null) {
    const competitionList = document.getElementById('competition-list');
    const noResultsElement = document.getElementById('no-results');
    const comps = competitions || getCompetitions();
    
    if (comps.length === 0) {
        competitionList.innerHTML = '';
        noResultsElement.classList.remove('d-none');
        return;
    }
    
    noResultsElement.classList.add('d-none');
    competitionList.innerHTML = '';
    
    comps.forEach(comp => {
        const categoryClass = `badge-${comp.category}`;
        const categoryText = getCategoryText(comp.category);
        const difficultyClass = `badge-${comp.difficulty}`;
        const difficultyText = getDifficultyText(comp.difficulty);
        const isFull = comp.participants >= comp.maxParticipants;
        const statusText = getStatusText(comp.status);
        const statusClass = getStatusClass(comp.status);
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card competition-card h-100 fade-in">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${comp.name}</h5>
                        <span class="badge ${categoryClass}">${categoryText}</span>
                    </div>
                    <p class="card-text text-muted">${comp.description.substring(0, 100)}...</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between text-sm text-muted mb-2">
                            <span><i class="fas fa-calendar me-1"></i>${formatDate(comp.date)}</span>
                            <span class="badge ${difficultyClass}">${difficultyText}</span>
                        </div>
                        <div class="mb-2">
                            <span><i class="fas fa-map-marker-alt me-1"></i>${comp.location}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted">${comp.participants}/${comp.maxParticipants} 人报名</span>
                            <div>
                                <a href="competition-detail.html?id=${comp.id}" class="btn btn-sm btn-outline-primary me-1">详情</a>
                                ${isFull || comp.status === 'finished' ? 
                                    '<button class="btn btn-sm btn-secondary" disabled>已满</button>' : 
                                    '<a href="competition-detail.html?id=' + comp.id + '" class="btn btn-sm btn-primary">报名</a>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        competitionList.appendChild(col);
    });
}

// 过滤竞赛
function filterCompetitions() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const difficultyFilter = document.getElementById('difficulty-filter').value;
    
    const competitions = getCompetitions();
    const filteredCompetitions = competitions.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm) || 
                             comp.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || comp.category === categoryFilter;
        const matchesStatus = !statusFilter || comp.status === statusFilter;
        const matchesDifficulty = !difficultyFilter || comp.difficulty === difficultyFilter;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
    });
    
    displayAllCompetitions(filteredCompetitions);
}

// 重置筛选
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('difficulty-filter').value = '';
    displayAllCompetitions();
}

// 初始化竞赛详情页面
function initCompetitionDetailPage() {
    // 从URL获取竞赛ID
    const urlParams = new URLSearchParams(window.location.search);
    const compId = parseInt(urlParams.get('id'));
    
    if (!compId) {
        window.location.href = 'competitions.html';
        return;
    }
    
    // 显示竞赛详情
    displayCompetitionDetail(compId);
}

// 显示竞赛详情
function displayCompetitionDetail(compId) {
    const competitions = getCompetitions();
    const comp = competitions.find(c => c.id === compId);
    
    if (!comp) {
        window.location.href = 'competitions.html';
        return;
    }
    
    // 更新页面标题
    document.title = `${comp.name} - 校园竞赛管理平台`;
    
    // 更新页面内容
    const detailContainer = document.getElementById('competition-detail-container');
    if (!detailContainer) return;
    
    const categoryText = getCategoryText(comp.category);
    const difficultyText = getDifficultyText(comp.difficulty);
    const statusText = getStatusText(comp.status);
    const statusClass = getStatusClass(comp.status);
    const isFull = comp.participants >= comp.maxParticipants;
    const canRegister = !isFull && comp.status !== 'finished';
    const myRegistrations = getMyRegistrations();
    const alreadyRegistered = myRegistrations.some(reg => reg.compId === compId);
    
    detailContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">${comp.name}</h1>
            <a href="competitions.html" class="btn btn-outline-primary">
                <i class="fas fa-arrow-left me-2"></i>返回列表
            </a>
        </div>
        
        <div class="row">
            <div class="col-lg-8">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">竞赛详情</h5>
                    </div>
                    <div class="card-body">
                        <p>${comp.description}</p>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">参与要求</h5>
                    </div>
                    <div class="card-body">
                        <ul>
                            ${comp.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">奖项设置</h5>
                    </div>
                    <div class="card-body">
                        <ul>
                            ${comp.awards.map(award => `<li>${award}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card mb-4">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">竞赛信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <strong>类别：</strong>
                            <span class="badge badge-${comp.category}">${categoryText}</span>
                        </div>
                        <div class="mb-3">
                            <strong>难度：</strong>
                            <span class="badge badge-${comp.difficulty}">${difficultyText}</span>
                        </div>
                        <div class="mb-3">
                            <strong>状态：</strong>
                            <span class="badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="mb-3">
                            <strong>时间：</strong>
                            <p class="mb-0">${formatDate(comp.date)}</p>
                        </div>
                        <div class="mb-3">
                            <strong>地点：</strong>
                            <p class="mb-0">${comp.location}</p>
                        </div>
                        <div class="mb-3">
                            <strong>报名方式：</strong>
                            <p class="mb-0">${comp.registrationMethod}</p>
                        </div>
                        <div class="mb-3">
                            <strong>报名情况：</strong>
                            <p class="mb-0">${comp.participants}/${comp.maxParticipants} 人</p>
                            <div class="progress mt-1">
                                <div class="progress-bar" style="width: ${(comp.participants / comp.maxParticipants) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body text-center">
                        ${alreadyRegistered ? 
                            `<button class="btn btn-success btn-lg w-100 mb-2" disabled>
                                <i class="fas fa-check me-2"></i>已报名
                            </button>
                            <p class="text-muted small">您已成功报名此竞赛</p>` :
                            canRegister ? 
                            `<button class="btn btn-primary btn-lg w-100 mb-2" id="register-btn">
                                <i class="fas fa-edit me-2"></i>立即报名
                            </button>
                            <p class="text-muted small">点击上方按钮报名参加此竞赛</p>` :
                            `<button class="btn btn-secondary btn-lg w-100 mb-2" disabled>
                                ${isFull ? '报名已满' : '报名已结束'}
                            </button>
                            <p class="text-muted small">当前无法报名此竞赛</p>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加报名事件监听
    if (canRegister && !alreadyRegistered) {
        document.getElementById('register-btn').addEventListener('click', function() {
            const registrationModal = new bootstrap.Modal(document.getElementById('registrationModal'));
            registrationModal.show();
        });
    }
    
    // 报名表单提交
    document.getElementById('submit-registration').addEventListener('click', function() {
        registerForCompetition(compId);
    });
}

// 报名竞赛
function registerForCompetition(compId) {
    const competitions = getCompetitions();
    const compIndex = competitions.findIndex(c => c.id === compId);
    
    if (compIndex === -1) return;
    
    if (competitions[compIndex].participants >= competitions[compIndex].maxParticipants) {
        showAlert('该竞赛报名人数已满，无法报名！', 'warning');
        return;
    }
    
    // 检查是否已报名
    const myRegistrations = getMyRegistrations();
    if (myRegistrations.some(reg => reg.compId === compId)) {
        showAlert('您已经报名了该竞赛！', 'warning');
        return;
    }
    
    // 获取表单数据
    const studentName = document.getElementById('student-name').value;
    const studentId = document.getElementById('student-id').value;
    const college = document.getElementById('college').value;
    const major = document.getElementById('major').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const experience = document.getElementById('experience').value;
    
    if (!studentName || !studentId || !college || !major || !phone || !email) {
        showAlert('请填写所有必填字段！', 'warning');
        return;
    }
    
    // 更新报名人数
    competitions[compIndex].participants++;
    saveCompetitions(competitions);
    
    // 添加到我的报名
    const newRegistration = {
        id: Date.now(),
        compId: compId,
        compName: competitions[compIndex].name,
        registerTime: new Date().toISOString(),
        status: '已报名',
        studentInfo: {
            name: studentName,
            studentId: studentId,
            college: college,
            major: major,
            phone: phone,
            email: email,
            experience: experience
        }
    };
    
    myRegistrations.push(newRegistration);
    saveMyRegistrations(myRegistrations);
    
    // 添加到所有报名人员数据
    const allParticipants = getAllParticipants();
    allParticipants.push({
        ...newRegistration.studentInfo,
        registrationId: newRegistration.id,
        compId: compId,
        compName: competitions[compIndex].name,
        registerTime: newRegistration.registerTime
    });
    saveAllParticipants(allParticipants);
    
    // 关闭模态框
    const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
    registrationModal.hide();
    
    showAlert(`成功报名「${competitions[compIndex].name}」！`, 'success');
    
    // 刷新页面以更新状态
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// 初始化我的报名页面
function initMyRegistrationsPage() {
    displayMyRegistrations();
}

// 显示我的报名记录
function displayMyRegistrations() {
    const registrationTable = document.getElementById('registration-table');
    const noRegistrationsElement = document.getElementById('no-registrations');
    if (!registrationTable) return;
    
    const registrations = getMyRegistrations();
    
    if (registrations.length === 0) {
        registrationTable.innerHTML = '';
        noRegistrationsElement.classList.remove('d-none');
        return;
    }
    
    noRegistrationsElement.classList.add('d-none');
    registrationTable.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${reg.compName}</td>
            <td>${formatDate(reg.registerTime)}</td>
            <td><span class="badge bg-success">${reg.status}</span></td>
            <td>
                <a href="competition-detail.html?id=${reg.compId}" class="btn btn-sm btn-outline-primary me-1">查看</a>
                <button class="btn btn-sm btn-outline-danger cancel-registration" data-id="${reg.id}">取消报名</button>
            </td>
        `;
        registrationTable.appendChild(row);
    });
    
    // 添加取消报名事件监听
    document.querySelectorAll('.cancel-registration').forEach(btn => {
        btn.addEventListener('click', function() {
            cancelRegistration(parseInt(this.getAttribute('data-id')));
        });
    });
}

// 取消报名
function cancelRegistration(regId) {
    if (!confirm('确定要取消报名吗？此操作不可撤销！')) {
        return;
    }
    
    const myRegistrations = getMyRegistrations();
    const regIndex = myRegistrations.findIndex(reg => reg.id === regId);
    
    if (regIndex === -1) return;
    
    const registration = myRegistrations[regIndex];
    
    // 更新竞赛报名人数
    const competitions = getCompetitions();
    const compIndex = competitions.findIndex(c => c.id === registration.compId);
    
    if (compIndex !== -1) {
        competitions[compIndex].participants--;
        saveCompetitions(competitions);
    }
    
    // 从所有报名人员数据中移除
    const allParticipants = getAllParticipants();
    const participantIndex = allParticipants.findIndex(p => p.registrationId === regId);
    if (participantIndex !== -1) {
        allParticipants.splice(participantIndex, 1);
        saveAllParticipants(allParticipants);
    }
    
    // 移除报名记录
    myRegistrations.splice(regIndex, 1);
    saveMyRegistrations(myRegistrations);
    
    // 更新显示
    displayMyRegistrations();
    
    showAlert(`已取消「${registration.compName}」的报名！`, 'info');
}