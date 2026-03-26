// 主应用逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户角色
    initUserRole();
    
    // 更新竞赛状态
    updateCompetitionStatuses();
    
    // 角色切换
    const switchRoleElement = document.getElementById('switch-role');
    if (switchRoleElement) {
        switchRoleElement.addEventListener('click', function(e) {
            e.preventDefault();
            toggleUserRole();
        });
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // 初始化首页数据
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initHomePage();
    }
});

// 初始化首页
function initHomePage() {
    // 显示热门竞赛
    displayPopularCompetitions();
    
    // 显示统计信息
    displayStats();
}

// 显示热门竞赛
function displayPopularCompetitions() {
    const popularCompetitionsElement = document.getElementById('popular-competitions');
    if (!popularCompetitionsElement) return;
    
    const competitions = getCompetitions()
        .filter(comp => comp.status === 'upcoming' || comp.status === 'ongoing')
        .slice(0, 3); // 只显示前3个
    
    if (competitions.length === 0) {
        popularCompetitionsElement.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-muted">暂无热门竞赛</p>
            </div>
        `;
        return;
    }
    
    popularCompetitionsElement.innerHTML = '';
    
    competitions.forEach(comp => {
        const categoryClass = `badge-${comp.category}`;
        const categoryText = getCategoryText(comp.category);
        const difficultyClass = `badge-${comp.difficulty}`;
        const difficultyText = getDifficultyText(comp.difficulty);
        const isFull = comp.participants >= comp.maxParticipants;
        
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="card competition-card h-100 fade-in">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${comp.name}</h5>
                        <span class="badge ${categoryClass}">${categoryText}</span>
                    </div>
                    <p class="card-text text-muted">${comp.description.substring(0, 80)}...</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between text-sm text-muted mb-2">
                            <span><i class="fas fa-calendar me-1"></i>${formatDate(comp.date)}</span>
                            <span class="badge ${difficultyClass}">${difficultyText}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted">${comp.participants}/${comp.maxParticipants} 人报名</span>
                            <a href="competition-detail.html?id=${comp.id}" class="btn btn-sm btn-primary">查看详情</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        popularCompetitionsElement.appendChild(col);
    });
}

// 显示统计信息
function displayStats() {
    const competitions = getCompetitions();
    
    // 计算统计数据
    const totalCompetitions = competitions.length;
    const totalParticipants = competitions.reduce((sum, comp) => sum + comp.participants, 0);
    const activeCompetitions = competitions.filter(comp => comp.status === 'ongoing').length;
    const upcomingCompetitions = competitions.filter(comp => comp.status === 'upcoming').length;
    
    // 更新DOM元素
    const totalCompetitionsElement = document.getElementById('total-competitions');
    const totalParticipantsElement = document.getElementById('total-participants');
    const activeCompetitionsElement = document.getElementById('active-competitions');
    const upcomingCompetitionsElement = document.getElementById('upcoming-competitions');
    
    if (totalCompetitionsElement) totalCompetitionsElement.textContent = totalCompetitions;
    if (totalParticipantsElement) totalParticipantsElement.textContent = totalParticipants;
    if (activeCompetitionsElement) activeCompetitionsElement.textContent = activeCompetitions;
    if (upcomingCompetitionsElement) upcomingCompetitionsElement.textContent = upcomingCompetitions;
}