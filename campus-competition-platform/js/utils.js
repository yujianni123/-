// 工具函数库

// 获取竞赛数据
function getCompetitions() {
    const competitions = localStorage.getItem('competitions');
    return competitions ? JSON.parse(competitions) : [
        {
            id: 1,
            name: "数学建模竞赛",
            category: "academic",
            difficulty: "medium",
            date: "2023-11-15T09:00",
            location: "理学楼报告厅",
            description: "全国大学生数学建模竞赛校内选拔赛，旨在培养学生的创新意识和运用数学方法和计算机技术解决实际问题的能力。",
            requirements: ["在校本科生", "团队参赛（3人）", "具备数学建模基础"],
            awards: ["一等奖：奖金3000元", "二等奖：奖金2000元", "三等奖：奖金1000元"],
            participants: 24,
            maxParticipants: 30,
            status: "ongoing",
            registrationMethod: "在线报名"
        },
        {
            id: 2,
            name: "程序设计大赛",
            category: "tech",
            difficulty: "hard",
            date: "2023-11-20T14:00",
            location: "计算机学院实验室",
            description: "年度程序设计大赛，考察算法设计、编程能力和团队协作。",
            requirements: ["熟悉至少一种编程语言", "个人或团队参赛（最多3人）"],
            awards: ["特等奖：奖金5000元", "一等奖：奖金3000元", "二等奖：奖金1500元"],
            participants: 18,
            maxParticipants: 40,
            status: "upcoming",
            registrationMethod: "在线报名"
        },
        {
            id: 3,
            name: "校园篮球联赛",
            category: "sports",
            difficulty: "medium",
            date: "2023-11-25T16:00",
            location: "体育馆篮球场",
            description: "校园篮球联赛，各学院代表队参赛，争夺年度冠军。",
            requirements: ["各学院代表队", "身体健康", "购买意外保险"],
            awards: ["冠军：奖杯+奖金2000元", "亚军：奖金1500元", "季军：奖金1000元"],
            participants: 8,
            maxParticipants: 16,
            status: "upcoming",
            registrationMethod: "在线报名"
        },
        {
            id: 4,
            name: "校园歌手大赛",
            category: "arts",
            difficulty: "easy",
            date: "2023-12-05T19:00",
            location: "学生活动中心",
            description: "年度校园歌手大赛，展示学生音乐才华，丰富校园文化生活。",
            requirements: ["在校学生", "自备伴奏", "遵守比赛规则"],
            awards: ["冠军：奖金2000元+演出机会", "亚军：奖金1000元", "季军：奖金500元"],
            participants: 32,
            maxParticipants: 50,
            status: "upcoming",
            registrationMethod: "在线报名"
        },
        {
            id: 5,
            name: "英语演讲比赛",
            category: "academic",
            difficulty: "medium",
            date: "2023-10-20T14:00",
            location: "外语学院报告厅",
            description: "年度英语演讲比赛，提升学生英语口语表达能力和跨文化交流能力。",
            requirements: ["在校学生", "英语水平良好", "自备演讲稿"],
            awards: ["一等奖：奖金2000元", "二等奖：奖金1000元", "三等奖：奖金500元"],
            participants: 45,
            maxParticipants: 50,
            status: "finished",
            registrationMethod: "在线报名"
        }
    ];
}

// 保存竞赛数据
function saveCompetitions(competitions) {
    localStorage.setItem('competitions', JSON.stringify(competitions));
}

// 获取类别文本
function getCategoryText(category) {
    const categories = {
        'academic': '学科竞赛',
        'tech': '科技创新',
        'sports': '体育竞赛',
        'arts': '文化艺术'
    };
    return categories[category] || '其他';
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficulties = {
        'easy': '初级',
        'medium': '中级',
        'hard': '高级'
    };
    return difficulties[difficulty] || '未知';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 检查是否为管理员
function isAdmin() {
    return localStorage.getItem('userRole') === 'admin';
}

// 显示提示消息
function showAlert(message, type = 'info') {
    // 创建提示元素
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 添加到页面顶部
    const container = document.querySelector('.container');
    if (container) {
        container.prepend(alertElement);
    }
    
    // 3秒后自动消失
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, 3000);
}

// 获取我的报名记录
function getMyRegistrations() {
    const registrations = localStorage.getItem('myRegistrations');
    return registrations ? JSON.parse(registrations) : [];
}

// 保存我的报名记录
function saveMyRegistrations(registrations) {
    localStorage.setItem('myRegistrations', JSON.stringify(registrations));
}

// 获取所有报名人员数据
function getAllParticipants() {
    const participants = localStorage.getItem('allParticipants');
    return participants ? JSON.parse(participants) : [];
}

// 保存所有报名人员数据
function saveAllParticipants(participants) {
    localStorage.setItem('allParticipants', JSON.stringify(participants));
}

// 初始化用户角色
function initUserRole() {
    if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', 'student');
    }
    
    const usernameElement = document.getElementById('username');
    const switchRoleElement = document.getElementById('switch-role');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    
    if (isAdmin()) {
        document.body.classList.add('admin');
        if (usernameElement) usernameElement.textContent = '管理员';
        if (switchRoleElement) switchRoleElement.textContent = '切换为学生';
    } else {
        document.body.classList.remove('admin');
        if (usernameElement) usernameElement.textContent = '学生用户';
        if (switchRoleElement) switchRoleElement.textContent = '切换为管理员';
    }
}

// 切换用户角色
function toggleUserRole() {
    const currentRole = localStorage.getItem('userRole') || 'student';
    const newRole = currentRole === 'student' ? 'admin' : 'student';
    
    localStorage.setItem('userRole', newRole);
    initUserRole();
    
    // 显示提示
    showAlert(`已切换为${newRole === 'admin' ? '管理员' : '学生'}角色`, 'success');
    
    // 刷新页面以更新UI
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// 退出登录
function logout() {
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'upcoming': '即将开始',
        'ongoing': '进行中',
        'finished': '已结束'
    };
    return statusMap[status] || '未知';
}

// 获取状态类名
function getStatusClass(status) {
    const classMap = {
        'upcoming': 'bg-warning',
        'ongoing': 'bg-success',
        'finished': 'bg-secondary'
    };
    return classMap[status] || 'bg-secondary';
}

// 检查竞赛状态
function checkCompetitionStatus(competition) {
    const now = new Date();
    const compDate = new Date(competition.date);
    
    if (compDate < now) {
        return 'finished';
    } else if (compDate > now && (compDate - now) / (1000 * 60 * 60 * 24) <= 7) {
        return 'ongoing';
    } else {
        return 'upcoming';
    }
}

// 更新所有竞赛状态
function updateCompetitionStatuses() {
    const competitions = getCompetitions();
    competitions.forEach(comp => {
        comp.status = checkCompetitionStatus(comp);
    });
    saveCompetitions(competitions);
}