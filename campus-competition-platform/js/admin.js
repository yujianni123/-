// 管理员功能
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        // 检查管理员权限
        if (!isAdmin()) {
            window.location.href = 'index.html';
            return;
        }
        
        initAdminPage();
    }
});

// 初始化管理员页面
function initAdminPage() {
    // 添加竞赛表单提交
    document.getElementById('add-competition-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewCompetition();
    });
    
    // 初始化各个标签页
    initAddCompetitionTab();
    initManageCompetitionsTab();
    initStatisticsTab();
    initParticipantsTab();
    
    // 数据导出功能
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('print-data').addEventListener('click', printData);
}

// 初始化添加竞赛标签页
function initAddCompetitionTab() {
    // 表单已在HTML中定义，无需额外初始化
}

// 添加新竞赛
function addNewCompetition() {
    const name = document.getElementById('comp-name').value;
    const category = document.getElementById('comp-category').value;
    const difficulty = document.getElementById('comp-difficulty').value;
    const date = document.getElementById('comp-date').value;
    const location = document.getElementById('comp-location').value;
    const maxParticipants = parseInt(document.getElementById('comp-max-participants').value);
    const description = document.getElementById('comp-description').value;
    const requirements = document.getElementById('comp-requirements').value.split('\n').filter(req => req.trim() !== '');
    const awards = document.getElementById('comp-awards').value.split('\n').filter(award => award.trim() !== '');
    
    if (!name || !category || !difficulty || !date || !location || !maxParticipants || !description || requirements.length === 0 || awards.length === 0) {
        showAlert('请填写所有必填字段！', 'warning');
        return;
    }
    
    const competitions = getCompetitions();
    const newId = competitions.length > 0 ? Math.max(...competitions.map(c => c.id)) + 1 : 1;
    
    const newCompetition = {
        id: newId,
        name: name,
        category: category,
        difficulty: difficulty,
        date: date,
        location: location,
        description: description,
        requirements: requirements,
        awards: awards,
        participants: 0,
        maxParticipants: maxParticipants,
        status: checkCompetitionStatus({ date: date }),
        registrationMethod: "在线报名"
    };
    
    competitions.push(newCompetition);
    saveCompetitions(competitions);
    
    // 重置表单
    document.getElementById('add-competition-form').reset();
    
    // 更新显示
    displayAdminCompetitionTable();
    updateRegistrationChart();
    updateAdminStats();
    updateCompetitionFilter();
    
    showAlert(`成功发布竞赛「${name}」！`, 'success');
}

// 初始化管理竞赛标签页
function initManageCompetitionsTab() {
    displayAdminCompetitionTable();
}

// 显示管理员竞赛表格
function displayAdminCompetitionTable() {
    const tableBody = document.getElementById('admin-competition-table');
    const competitions = getCompetitions();
    
    if (competitions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">暂无竞赛数据</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    competitions.forEach(comp => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${comp.name}</td>
            <td>${getCategoryText(comp.category)}</td>
            <td>${formatDate(comp.date)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                        <div class="progress-bar" style="width: ${(comp.participants / comp.maxParticipants) * 100}%"></div>
                    </div>
                    <span>${comp.participants}/${comp.maxParticipants}</span>
                </div>
            </td>
            <td><span class="badge ${getStatusClass(comp.status)}">${getStatusText(comp.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning btn-edit" data-id="${comp.id}">编辑</button>
                    <button class="btn btn-sm btn-info btn-view" data-id="${comp.id}">查看报名</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${comp.id}">删除</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 添加事件监听
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editCompetition(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            viewParticipants(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCompetition(parseInt(this.getAttribute('data-id')));
        });
    });
}

// 编辑竞赛
function editCompetition(compId) {
    const competitions = getCompetitions();
    const comp = competitions.find(c => c.id === compId);
    
    if (!comp) return;
    
    // 填充表单数据
    document.getElementById('edit-comp-id').value = comp.id;
    document.getElementById('edit-comp-name').value = comp.name;
    document.getElementById('edit-comp-category').value = comp.category;
    document.getElementById('edit-comp-difficulty').value = comp.difficulty;
    document.getElementById('edit-comp-date').value = comp.date.replace(' ', 'T');
    document.getElementById('edit-comp-location').value = comp.location;
    document.getElementById('edit-comp-max-participants').value = comp.maxParticipants;
    document.getElementById('edit-comp-description').value = comp.description;
    document.getElementById('edit-comp-requirements').value = comp.requirements.join('\n');
    document.getElementById('edit-comp-awards').value = comp.awards.join('\n');
    
    // 显示模态框
    const editModal = new bootstrap.Modal(document.getElementById('editCompetitionModal'));
    editModal.show();
    
    // 保存更改
    document.getElementById('save-competition-changes').onclick = function() {
        saveCompetitionChanges(compId);
    };
}

// 保存竞赛更改
function saveCompetitionChanges(compId) {
    const competitions = getCompetitions();
    const compIndex = competitions.findIndex(c => c.id === compId);
    
    if (compIndex === -1) return;
    
    // 获取表单数据
    competitions[compIndex].name = document.getElementById('edit-comp-name').value;
    competitions[compIndex].category = document.getElementById('edit-comp-category').value;
    competitions[compIndex].difficulty = document.getElementById('edit-comp-difficulty').value;
    competitions[compIndex].date = document.getElementById('edit-comp-date').value;
    competitions[compIndex].location = document.getElementById('edit-comp-location').value;
    competitions[compIndex].maxParticipants = parseInt(document.getElementById('edit-comp-max-participants').value);
    competitions[compIndex].description = document.getElementById('edit-comp-description').value;
    competitions[compIndex].requirements = document.getElementById('edit-comp-requirements').value.split('\n').filter(req => req.trim() !== '');
    competitions[compIndex].awards = document.getElementById('edit-comp-awards').value.split('\n').filter(award => award.trim() !== '');
    competitions[compIndex].status = checkCompetitionStatus(competitions[compIndex]);
    
    // 确保报名人数不超过最大人数
    if (competitions[compIndex].participants > competitions[compIndex].maxParticipants) {
        competitions[compIndex].participants = competitions[compIndex].maxParticipants;
    }
    
    saveCompetitions(competitions);
    
    // 关闭模态框
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editCompetitionModal'));
    editModal.hide();
    
    // 更新显示
    displayAdminCompetitionTable();
    updateRegistrationChart();
    updateAdminStats();
    
    showAlert('竞赛信息已更新！', 'success');
}

// 查看报名人员
function viewParticipants(compId) {
    // 切换到报名管理标签页
    const participantsTab = new bootstrap.Tab(document.querySelector('a[href="#participants"]'));
    participantsTab.show();
    
    // 设置筛选器
    document.getElementById('participant-competition-filter').value = compId;
    
    // 显示报名人员
    displayParticipants(compId);
}

// 删除竞赛
function deleteCompetition(compId) {
    if (!confirm('确定要删除这个竞赛吗？此操作将删除所有相关报名数据，且不可撤销！')) {
        return;
    }
    
    const competitions = getCompetitions();
    const compIndex = competitions.findIndex(c => c.id === compId);
    
    if (compIndex === -1) return;
    
    const compName = competitions[compIndex].name;
    
    // 从竞赛列表中移除
    competitions.splice(compIndex, 1);
    saveCompetitions(competitions);
    
    // 从所有报名人员数据中移除相关报名
    const allParticipants = getAllParticipants();
    const updatedParticipants = allParticipants.filter(p => p.compId !== compId);
    saveAllParticipants(updatedParticipants);
    
    // 从我的报名中移除相关报名
    const myRegistrations = getMyRegistrations();
    const updatedRegistrations = myRegistrations.filter(reg => reg.compId !== compId);
    saveMyRegistrations(updatedRegistrations);
    
    // 更新显示
    displayAdminCompetitionTable();
    updateRegistrationChart();
    updateAdminStats();
    updateCompetitionFilter();
    
    showAlert(`已删除竞赛「${compName}」！`, 'info');
}

// 初始化统计标签页
function initStatisticsTab() {
    updateRegistrationChart();
    updateAdminStats();
}

// 更新报名统计图表
function updateRegistrationChart() {
    const ctx = document.getElementById('registration-chart');
    if (!ctx) return;
    
    const competitions = getCompetitions();
    const labels = competitions.map(comp => comp.name);
    const data = competitions.map(comp => comp.participants);
    const maxParticipants = competitions.map(comp => comp.maxParticipants);
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(201, 203, 207, 0.7)'
    ];
    
    // 销毁现有图表实例
    if (window.registrationChart) {
        window.registrationChart.destroy();
    }
    
    window.registrationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '已报名人数',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, competitions.length),
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                },
                {
                    label: '最大报名人数',
                    data: maxParticipants,
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderColor: 'rgba(200, 200, 200, 1)',
                    borderWidth: 1,
                    type: 'line',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '各竞赛报名人数统计'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 更新管理员统计
function updateAdminStats() {
    const competitions = getCompetitions();
    const allParticipants = getAllParticipants();
    
    // 计算统计数据
    const totalCompetitions = competitions.length;
    const totalParticipants = allParticipants.length;
    const avgParticipation = competitions.length > 0 ? 
        (competitions.reduce((sum, comp) => sum + (comp.participants / comp.maxParticipants), 0) / competitions.length * 100).toFixed(1) : 0;
    
    const mostPopular = competitions.length > 0 ? 
        competitions.reduce((max, comp) => comp.participants > max.participants ? comp : max, competitions[0]).name : '-';
    
    // 更新DOM元素
    document.getElementById('admin-total-competitions').textContent = totalCompetitions;
    document.getElementById('admin-total-participants').textContent = totalParticipants;
    document.getElementById('admin-avg-participation').textContent = `${avgParticipation}%`;
    document.getElementById('admin-most-popular').textContent = mostPopular;
}

// 初始化报名管理标签页
function initParticipantsTab() {
    updateCompetitionFilter();
    
    // 筛选器变化时更新显示
    document.getElementById('participant-competition-filter').addEventListener('change', function() {
        const compId = parseInt(this.value);
        if (compId) {
            displayParticipants(compId);
        } else {
            clearParticipantsTable();
        }
    });
}

// 更新竞赛筛选器
function updateCompetitionFilter() {
    const filter = document.getElementById('participant-competition-filter');
    if (!filter) return;
    
    const competitions = getCompetitions();
    
    // 清空现有选项（保留第一个选项）
    while (filter.children.length > 1) {
        filter.removeChild(filter.lastChild);
    }
    
    // 添加竞赛选项
    competitions.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.id;
        option.textContent = comp.name;
        filter.appendChild(option);
    });
}

// 显示报名人员
function displayParticipants(compId) {
    const tableBody = document.getElementById('participant-table');
    const noParticipantsElement = document.getElementById('no-participants');
    const allParticipants = getAllParticipants();
    
    const participants = allParticipants.filter(p => p.compId === compId);
    
    if (participants.length === 0) {
        tableBody.innerHTML = '';
        noParticipantsElement.classList.remove('d-none');
        return;
    }
    
    noParticipantsElement.classList.add('d-none');
    tableBody.innerHTML = '';
    
    participants.forEach(participant => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${participant.name}</td>
            <td>${participant.studentId}</td>
            <td>${participant.college}</td>
            <td>${participant.major}</td>
            <td>${participant.phone}</td>
            <td>${formatDate(participant.registerTime)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger remove-participant" data-id="${participant.registrationId}">移除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 添加移除报名事件监听
    document.querySelectorAll('.remove-participant').forEach(btn => {
        btn.addEventListener('click', function() {
            removeParticipant(parseInt(this.getAttribute('data-id')));
        });
    });
}

// 清空报名人员表格
function clearParticipantsTable() {
    const tableBody = document.getElementById('participant-table');
    const noParticipantsElement = document.getElementById('no-participants');
    
    tableBody.innerHTML = '';
    noParticipantsElement.classList.remove('d-none');
}

// 移除报名人员
function removeParticipant(registrationId) {
    if (!confirm('确定要移除这个报名人员吗？此操作不可撤销！')) {
        return;
    }
    
    // 从所有报名人员数据中移除
    const allParticipants = getAllParticipants();
    const participantIndex = allParticipants.findIndex(p => p.registrationId === registrationId);
    
    if (participantIndex === -1) return;
    
    const participant = allParticipants[participantIndex];
    allParticipants.splice(participantIndex, 1);
    saveAllParticipants(allParticipants);
    
    // 从我的报名中移除
    const myRegistrations = getMyRegistrations();
    const registrationIndex = myRegistrations.findIndex(reg => reg.id === registrationId);
    
    if (registrationIndex !== -1) {
        myRegistrations.splice(registrationIndex, 1);
        saveMyRegistrations(myRegistrations);
    }
    
    // 更新竞赛报名人数
    const competitions = getCompetitions();
    const compIndex = competitions.findIndex(c => c.id === participant.compId);
    
    if (compIndex !== -1) {
        competitions[compIndex].participants--;
        saveCompetitions(competitions);
    }
    
    // 更新显示
    displayParticipants(participant.compId);
    displayAdminCompetitionTable();
    updateRegistrationChart();
    updateAdminStats();
    
    showAlert('已移除报名人员！', 'info');
}

// 导出到Excel
function exportToExcel() {
    const competitions = getCompetitions();
    const allParticipants = getAllParticipants();
    
    // 创建CSV内容
    let csvContent = "竞赛名称,类别,难度,时间,地点,报名人数,最大人数,状态\n";
    
    competitions.forEach(comp => {
        csvContent += `"${comp.name}","${getCategoryText(comp.category)}","${getDifficultyText(comp.difficulty)}","${formatDate(comp.date)}","${comp.location}",${comp.participants},${comp.maxParticipants},"${getStatusText(comp.status)}"\n`;
    });
    
    csvContent += "\n\n报名人员数据\n";
    csvContent += "姓名,学号,学院,专业,联系电话,邮箱,报名竞赛,报名时间\n";
    
    allParticipants.forEach(participant => {
        csvContent += `"${participant.name}","${participant.studentId}","${participant.college}","${participant.major}","${participant.phone}","${participant.email}","${participant.compName}","${formatDate(participant.registerTime)}"\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '竞赛数据导出.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('数据已导出为CSV文件！', 'success');
}

// 导出到PDF (简化版 - 实际应用中可能需要使用PDF库)
function exportToPDF() {
    showAlert('PDF导出功能正在开发中...', 'info');
}

// 打印数据
function printData() {
    window.print();
}