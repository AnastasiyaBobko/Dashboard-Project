let currentPeriod = '';

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.toggle-button');
    const openBtn = document.querySelector('.open-btn');

    const navItems = document.querySelectorAll('.nav-item');
    const projectsTab = document.querySelector('#projects-tab');
    const employeesTab = document.querySelector('#employees-tab');

    const monthSelect = document.querySelector('#month');
    const yearSelect = document.querySelector('#year');

    const addProjectBtn = document.querySelector('.add-project-btn');
    const projectPanel = document.querySelector('#project-panel');
    const projectForm = document.querySelector('#add-project-form');
    const cancelProjectBtn = document.querySelector('#cancel-btn');
    const projectSubmitBtn = document.querySelector('#submit-btn');

    const projectName = document.querySelector('#project-name');
    const companyName = document.querySelector('#company-name');
    const budget = document.querySelector('#budget');
    const employeeCapacity = document.querySelector('#employee-capacity');

    const projectsTbody = document.querySelector('#projects-tbody');
    const projectInputs = [projectName, companyName, budget, employeeCapacity];

    const addEmployeeBtn = document.querySelector('.add-employee-btn');
    const employeePanel = document.querySelector('#employee-panel');
    const employeeForm = document.querySelector('#add-employee-form');
    const cancelEmployeeBtn = document.querySelector('#employee-cancel-btn');
    const employeeSubmitBtn = document.querySelector('#employee-submit-btn');

    const employeeName = document.querySelector('#employee-name');
    const employeeSurname = document.querySelector('#employee-surname');
    const employeeBirthdate = document.querySelector('#employee-birthdate');
    const employeePosition = document.querySelector('#employee-position');
    const employeeSalary = document.querySelector('#employee-salary');

    const employeesTbody = document.querySelector('#employees-tbody');
    const employeeInputs = [
        employeeName,
        employeeSurname,
        employeeBirthdate,
        employeePosition,
        employeeSalary
    ];

    const projectSortableHeaders = document.querySelectorAll('#projects-tab .sortable');
    const employeeSortableHeaders = document.querySelectorAll('#employees-tab .sortable');

    const seedBtn = document.querySelector('.seed-btn');

    let projectSortField = null;
    let projectSortDirection = 'asc';
    let employeeSortField = null;
    let employeeSortDirection = 'asc';

    

    let filters = {
        companyName: '',
        projectName: ''
    };

    let selectedEmployeeIdForAssign = null;

    createAssignPopup();
    createProjectEmployeesPopup();
    createSeedPopup();

    const assignPopup = document.querySelector('#assign-popup');
    const assignProjectSelect = document.querySelector('#assign-project');
    const assignCapacityInput = document.querySelector('#assign-capacity');
    const assignFitInput = document.querySelector('#assign-fit');
    const assignSaveBtn = document.querySelector('#assign-save-btn');
    const assignCancelBtn = document.querySelector('#assign-cancel-btn');

    const projectEmployeesPopup = document.querySelector('#project-employees-popup');
    const projectEmployeesClose = document.querySelector('#project-employees-close');
    const projectEmployeesTitle = document.querySelector('#project-employees-title');
    const projectEmployeesList = document.querySelector('#project-employees-list');

    function getMonthlyData() {
        const data = localStorage.getItem('monthlyData');
        return data ? JSON.parse(data) : {};
    }

    function saveMonthlyData(data) {
        localStorage.setItem('monthlyData', JSON.stringify(data));
    }

    function updateCurrentPeriod() {
        const monthIndex = parseInt(monthSelect.value, 10) - 1;
        currentPeriod = `${yearSelect.value}-${monthIndex}`;
    }

    function getPreviousPeriod(period) {
        const [yearStr, monthStr] = period.split('-');
        let year = parseInt(yearStr, 10);
        let month = parseInt(monthStr, 10);

        month--;

        if (month < 0) {
            month = 11;
            year--;
        }

        return `${year}-${month}`;
    }

    function createSnapshotIfMissing() {
        const data = getMonthlyData();

        if (data[currentPeriod]) {
            return data;
        }

        const previousPeriod = getPreviousPeriod(currentPeriod);

        if (data[previousPeriod]) {
            data[currentPeriod] = structuredClone(data[previousPeriod]);
        } else {
            data[currentPeriod] = {
                employees: [],
                projects: []
            };
        }

        saveMonthlyData(data);
        return data;
    }

    function getCurrentMonthData() {
        const data = createSnapshotIfMissing();
        return data[currentPeriod];
    }

    function switchTab(tabName) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const targetTab = document.querySelector(`#${tabName}-tab`);

        if (targetTab) {
            targetTab.classList.add('active');
        }

        if (tabName === 'projects') renderProjectsTable();
        if (tabName === 'employees') renderEmployeesTable();
    }

    function addProject(project) {
        const data = createSnapshotIfMissing();
        data[currentPeriod].projects.push(project);
        saveMonthlyData(data);
    }

    function addEmployee(employee) {
        const data = createSnapshotIfMissing();
        data[currentPeriod].employees.push(employee);
        saveMonthlyData(data);
    }

    function deleteProject(projectId) {
        const data = createSnapshotIfMissing();

        data[currentPeriod].projects = data[currentPeriod].projects.filter(project => {
            return String(project.id) !== String(projectId);
        });

        data[currentPeriod].employees.forEach(employee => {
            employee.assignments = (employee.assignments || []).filter(assignment => {
                return String(assignment.projectId) !== String(projectId);
            });
        });

        saveMonthlyData(data);
        renderProjectsTable();
        renderEmployeesTable();
    }

    function deleteEmployee(employeeId) {
        const data = createSnapshotIfMissing();

        data[currentPeriod].employees = data[currentPeriod].employees.filter(employee => {
            return String(employee.id) !== String(employeeId);
        });

        saveMonthlyData(data);
        renderEmployeesTable();
        renderProjectsTable();
    }

    function getProjectById(projectId) {
        const monthData = getCurrentMonthData();

        return (monthData.projects || []).find(project => {
            return String(project.id) === String(projectId);
        });
    }

    function getEmployeesForProject(projectId) {
        const monthData = getCurrentMonthData();

        return (monthData.employees || []).filter(employee => {
            return (employee.assignments || []).some(assignment => {
                return String(assignment.projectId) === String(projectId);
            });
        });
    }

    function getAssignmentForProject(employee, projectId) {
        return (employee.assignments || []).find(assignment => {
            return String(assignment.projectId) === String(projectId);
        });
    }

    function getDaysInMonth() {
        const [yearStr, monthStr] = currentPeriod.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
    
        return new Date(year, month + 1, 0).getDate();
    }
    
    function isWeekday(year, month, day) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
    
        return dayOfWeek !== 0 && dayOfWeek !== 6;
    }
    
    function countWorkingDaysInMonth() {
        const [yearStr, monthStr] = currentPeriod.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const daysInMonth = getDaysInMonth();
    
        let workingDays = 0;
    
        for (let day = 1; day <= daysInMonth; day++) {
            if (isWeekday(year, month, day)) {
                workingDays++;
            }
        }
    
        return workingDays;
    }
    
    function calculateVacationCoefficient(vacationDays) {
        const [yearStr, monthStr] = currentPeriod.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const workingDays = countWorkingDaysInMonth();
    
        const vacationWorkingDays = (vacationDays || []).filter(day => {
            return isWeekday(year, month, Number(day));
        }).length;
    
        if (workingDays === 0) return 1;
    
        return (workingDays - vacationWorkingDays) / workingDays;
    }
    
    function calculateEmployeeEffectiveCapacity(employee, assignment) {
        const assignedCapacity = Number(assignment.capacity) || 0;
        const fit = Number(assignment.fit) || 0;
        const vacationCoefficient = calculateVacationCoefficient(employee.vacationDays);
    
        return assignedCapacity * fit * vacationCoefficient;
    }
    
    function calculateUsedCapacity(project) {
        const employees = getEmployeesForProject(project.id);
    
        return employees.reduce((sum, employee) => {
            const assignment = getAssignmentForProject(employee, project.id);
    
            if (!assignment) return sum;
    
            return sum + calculateEmployeeEffectiveCapacity(employee, assignment);
        }, 0);
    }
    
    function calculateRevenuePerEffectiveCapacity(project) {
        const budget = Number(project.budget) || 0;
        const projectCapacity = Number(project.employeeCapacity) || 0;
        const usedEffectiveCapacity = calculateUsedCapacity(project);
    
        const capacityForRevenue = Math.max(projectCapacity, usedEffectiveCapacity);
    
        if (capacityForRevenue === 0) return 0;
    
        return budget / capacityForRevenue;
    }
    
    function calculateRevenue(project, effectiveCapacity) {
        const revenuePerEffectiveCapacity = calculateRevenuePerEffectiveCapacity(project);
        return revenuePerEffectiveCapacity * effectiveCapacity;
    }
    
    function calculateCost(employee, assignedCapacity) {
        const salary = Number(employee.salary) || 0;
        return salary * Math.max(0.5, assignedCapacity);
    }
    
    function calculateBenchCost(employee) {
        const salary = Number(employee.salary) || 0;
        return salary * 0.5;
    }
    
    function calculateAssignmentProfit(project, employee, assignment) {
        const effectiveCapacity = calculateEmployeeEffectiveCapacity(employee, assignment);
        const revenue = calculateRevenue(project, effectiveCapacity);
        const cost = calculateCost(employee, Number(assignment.capacity) || 0);
    
        return revenue - cost;
    }
    
    function calculateEstimatedIncome(project) {
        const employees = getEmployeesForProject(project.id);
    
        return employees.reduce((sum, employee) => {
            const assignment = getAssignmentForProject(employee, project.id);
    
            if (!assignment) return sum;
    
            return sum + calculateAssignmentProfit(project, employee, assignment);
        }, 0);
    }
    
    function calculateEmployeeProfit(employee) {
        return (employee.assignments || []).reduce((sum, assignment) => {
            const project = getProjectById(assignment.projectId);
    
            if (!project) return sum;
    
            return sum + calculateAssignmentProfit(project, employee, assignment);
        }, 0);
    }
    
    function calculateTotalIncome(projects) {
        return projects.reduce((sum, project) => {
            return sum + calculateEstimatedIncome(project);
        }, 0);
    }


    let projectFilters = {
        companyName: '',
        projectName: ''
    };
    
    let employeeFilters = {
        name: '',
        surname: '',
        position: ''
    };
    
    let activeFilterTable = null;
    let activeFilterField = null;
    let activeFilterLabel = null;
    function createFilterPopup() {
        if (document.querySelector('#filter-popup')) return;
    
        const popup = document.createElement('div');
        popup.id = 'filter-popup';
        popup.className = 'filter-popup';
        popup.style.display = 'none';
    
        popup.innerHTML = `
            <div id="filter-control"></div>
            <div class="filter-popup-actions">
                <button type="button" id="filter-apply-btn">Apply</button>
                <button type="button" id="filter-cancel-btn">Cancel</button>
            </div>
        `;
    
        document.body.appendChild(popup);
    }
    createFilterPopup();
    const filterPopup = document.querySelector('#filter-popup');
    const filterControl = document.querySelector('#filter-control');
    const filterApplyBtn = document.querySelector('#filter-apply-btn');
    const filterCancelBtn = document.querySelector('#filter-cancel-btn');
    const projectFilterChips = document.querySelector('#project-filter-chips');
    const employeeFilterChips = document.querySelector('#employee-filter-chips');

    function openFilterPopup(button, table, field, label) {
        activeFilterTable = table;
        activeFilterField = field;
        activeFilterLabel = label;
    
        const currentValue =
            table === 'projects'
                ? projectFilters[field]
                : employeeFilters[field];
    
        if (table === 'employees' && field === 'position') {
            filterControl.innerHTML = `
                <select id="filter-value">
                    <option value="">All</option>
                    <option value="junior">Junior</option>
                    <option value="middle">Middle</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="architect">Architect</option>
                    <option value="bo">BO</option>
                </select>
            `;
    
            const select = document.querySelector('#filter-value');
            select.value = currentValue;
    
            select.addEventListener('change', function () {
                applyActiveFilter();
            });
        } else {
            filterControl.innerHTML = `
                <input type="text" id="filter-value" value="${currentValue}" placeholder="Filter">
            `;
    
            const input = document.querySelector('#filter-value');
            input.focus();
    
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    applyActiveFilter();
                }
            });
        }
    
        const rect = button.getBoundingClientRect();
    
        filterPopup.style.display = 'block';
        filterPopup.style.top = `${rect.bottom + window.scrollY + 6}px`;
        filterPopup.style.left = `${rect.left + window.scrollX}px`;
    }

    function applyActiveFilter() {
        const control = document.querySelector('#filter-value');
        const value = control ? control.value.trim().toLowerCase() : '';
    
        if (activeFilterTable === 'projects') {
            projectFilters[activeFilterField] = value;
            renderProjectsTable();
            renderProjectFilterChips();
        }
    
        if (activeFilterTable === 'employees') {
            employeeFilters[activeFilterField] = value;
            renderEmployeesTable();
            renderEmployeeFilterChips();
        }
    
        closeFilterPopup();
    }
    
    function closeFilterPopup() {
        filterPopup.style.display = 'none';
        activeFilterTable = null;
        activeFilterField = null;
        activeFilterLabel = null;
    }
    
    filterApplyBtn.addEventListener('click', applyActiveFilter);
    filterCancelBtn.addEventListener('click', closeFilterPopup);

    document.querySelectorAll('#projects-tab .filter-icon').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
    
            const th = button.closest('th');
    
            openFilterPopup(
                button,
                'projects',
                th.dataset.filter,
                th.dataset.label
            );
        });
    });
    
    document.querySelectorAll('#employees-tab .filter-icon').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
    
            const th = button.closest('th');
    
            openFilterPopup(
                button,
                'employees',
                th.dataset.filter,
                th.dataset.label
            );
        });
    });


    function getMonthName(monthIndex) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        return monthNames[Number(monthIndex)];
    }
    
    function getPeriodLabel(period) {
        const [year, month] = period.split('-');
        return `${getMonthName(month)} ${year}`;
    }
    
    function cloneDataForSeed(sourceMonthData) {
        const projectIdMap = {};
    
        const projects = (sourceMonthData.projects || []).map(project => {
            const newProjectId = crypto.randomUUID();
    
            projectIdMap[String(project.id)] = newProjectId;
    
            return {
                ...structuredClone(project),
                id: newProjectId
            };
        });
    
        const employees = (sourceMonthData.employees || []).map(employee => {
            return {
                ...structuredClone(employee),
                id: crypto.randomUUID(),
                vacationDays: [],
                assignments: (employee.assignments || []).map(assignment => {
                    return {
                        ...assignment,
                        projectId: projectIdMap[String(assignment.projectId)]
                    };
                }).filter(assignment => assignment.projectId)
            };
        });
    
        return {
            projects,
            employees
        };
    }
    function createSeedPopup() {
        if (document.querySelector('#seed-popup')) return;
    
        const popup = document.createElement('div');
        popup.id = 'seed-popup';
        popup.className = 'seed-popup';
        popup.setAttribute('aria-hidden', 'true');
    
        popup.innerHTML = `
            <div class="seed-popup-content">
                <button type="button" class="popup-close-btn" id="seed-close-btn">×</button>
                <h3>Seed Data</h3>
                <div id="seed-list"></div>
            </div>
        `;
    
        document.body.appendChild(popup);
    }
    
    function openSeedPopup() {
        const data = getMonthlyData();
        const seedList = document.querySelector('#seed-list');
        const seedPopup = document.querySelector('#seed-popup');
    
        seedList.innerHTML = '';
    
        const periods = Object.keys(data).filter(period => {
            return period !== currentPeriod && data[period];
        });
    
        if (periods.length === 0) {
            seedList.innerHTML = '<p>No months with data available.</p>';
        }
    
        periods.sort().forEach(period => {
            const monthData = data[period];
            const projects = monthData.projects || [];
            const employees = monthData.employees || [];
            const totalIncome = calculateTotalIncomeForPeriod(period);
    
            const item = document.createElement('div');
            item.className = 'seed-item';
    
            item.innerHTML = `
                <div>
                    <strong>${getPeriodLabel(period)}</strong>
                    <p>Projects: ${projects.length}</p>
                    <p>Employees: ${employees.length}</p>
                    <p class="${totalIncome >= 0 ? 'income-positive' : 'income-negative'}">
                        Total estimated income: $${totalIncome.toFixed(2)}
                    </p>
                </div>
    
                <button type="button" class="seed-month-btn" data-period="${period}">
                    Seed
                </button>
            `;
    
            seedList.appendChild(item);
        });
    
        seedPopup.classList.add('open');
        seedPopup.setAttribute('aria-hidden', 'false');
    }
    
    function closeSeedPopup() {
        const seedPopup = document.querySelector('#seed-popup');
    
        seedPopup.classList.remove('open');
        seedPopup.setAttribute('aria-hidden', 'true');
    }
    
    function seedFromPeriod(sourcePeriod) {
        const data = getMonthlyData();
    
        if (!data[sourcePeriod]) {
            alert('Source month has no data');
            return;
        }
    
        if (!data[currentPeriod]) {
            data[currentPeriod] = {
                employees: [],
                projects: []
            };
        }
    
        const confirmed = confirm(
            `Copy data from ${getPeriodLabel(sourcePeriod)} to ${getPeriodLabel(currentPeriod)}? Existing data will stay.`
        );
    
        if (!confirmed) return;
    
        const copiedData = cloneDataForSeed(data[sourcePeriod]);
    
        data[currentPeriod].projects = [
            ...(data[currentPeriod].projects || []),
            ...copiedData.projects
        ];
    
        data[currentPeriod].employees = [
            ...(data[currentPeriod].employees || []),
            ...copiedData.employees
        ];
    
        saveMonthlyData(data);
    
        closeSeedPopup();
        renderProjectsTable();
        renderEmployeesTable();
    }
    
    function calculateTotalIncomeForPeriod(period) {
        const previousPeriod = currentPeriod;
        currentPeriod = period;
    
        const data = getMonthlyData();
    
        if (!data[period]) {
            currentPeriod = previousPeriod;
            return 0;
        }
    
        const projects = data[period].projects || [];
        const total = calculateTotalIncome(projects);
    
        currentPeriod = previousPeriod;
        return total;
    }


    function updateTotalIncome(projects) {
        const totalIncomeEl = document.querySelector('.total-income');
    
        if (!totalIncomeEl) return;
    
        const total = calculateTotalIncome(projects);
    
        totalIncomeEl.innerHTML = `
            <strong>Total Estimated Income:</strong>
            <span>$${total.toFixed(2)}</span>
        `;
    
        totalIncomeEl.classList.toggle('income-positive', total >= 0);
        totalIncomeEl.classList.toggle('income-negative', total < 0);
    }
    
    function calculateAge(birthdate) {
        const birthDate = new Date(birthdate);
        const today = new Date();
    
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
    
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
    
        return age;
    }
    
    function getEmployeeTotalCapacity(employee) {
        return (employee.assignments || []).reduce((sum, assignment) => {
            return sum + (Number(assignment.capacity) || 0);
        }, 0);
    }
    
    function getProjectSortValue(project, field) {
        if (field === 'companyName') return project.companyName.toLowerCase();
        if (field === 'projectName') return project.projectName.toLowerCase();
        if (field === 'budget') return Number(project.budget);
        if (field === 'employeeCapacity') return calculateUsedCapacity(project);
        if (field === 'estimatedIncome') return calculateEstimatedIncome(project);
    }

    function getEmployeeSortValue(employee, field) {
        if (field === 'name') return employee.name.toLowerCase();
        if (field === 'surname') return employee.surname.toLowerCase();
        if (field === 'age') return calculateAge(employee.birthdate);
        if (field === 'position') return employee.position.toLowerCase();
        if (field === 'salary') return Number(employee.salary) || 0;
        if (field === 'estimatedPayment') return Number(employee.salary) || 0;
        if (field === 'projectedIncome') return calculateEmployeeProfit(employee);
    
        return '';
    }
    
    function renderProjectsTable() {
        const monthData = getCurrentMonthData();
        let projects = [...(monthData.projects || [])];
    
        projects = projects.filter(project => {
    const companyMatch = project.companyName
        .toLowerCase()
        .includes(projectFilters.companyName);

    const projectMatch = project.projectName
        .toLowerCase()
        .includes(projectFilters.projectName);

    return companyMatch && projectMatch;
});
    
        if (projectSortField) {
            projects.sort((a, b) => {
                const valueA = getProjectSortValue(a, projectSortField);
                 const valueB = getProjectSortValue(b, projectSortField);

            if (typeof valueA === 'string') {
                return projectSortDirection === 'asc'
                     ? valueA.localeCompare(valueB)
                      : valueB.localeCompare(valueA);
    }

    return projectSortDirection === 'asc'
        ? valueA - valueB
        : valueB - valueA;
            });
        }
    
        updateTotalIncome(projects);
    
        projectsTbody.innerHTML = '';
        const projectRowTemplate = document.querySelector('#project-row-template');

projects.forEach(project => {
    const usedCapacity = calculateUsedCapacity(project);
    const totalCapacity = Number(project.employeeCapacity) || 0;
    const employeesCount = getEmployeesForProject(project.id).length;
    const estimatedIncome = calculateEstimatedIncome(project);
    const isOverCapacity = usedCapacity > totalCapacity;

    const clone = projectRowTemplate.content.cloneNode(true);

    clone.querySelector('.col-company').textContent = project.companyName;
    clone.querySelector('.col-project').textContent = project.projectName;
    clone.querySelector('.col-budget').textContent = `$${Number(project.budget).toFixed(2)}`;

    const capacityCell = clone.querySelector('.col-capacity');
    capacityCell.textContent = `${usedCapacity.toFixed(1)}/${totalCapacity}`;
    capacityCell.classList.toggle('over-capacity', isOverCapacity);

    const showEmployeesBtn = clone.querySelector('.show-employees-btn');
    showEmployeesBtn.textContent = `Show Employees (${employeesCount})`;
    showEmployeesBtn.dataset.id = project.id;

    const incomeCell = clone.querySelector('.col-income');
    incomeCell.textContent = `$${estimatedIncome.toFixed(2)}`;
    incomeCell.classList.toggle('income-positive', estimatedIncome >= 0);
    incomeCell.classList.toggle('income-negative', estimatedIncome < 0);

    const deleteBtn = clone.querySelector('.delete-project-btn');
    deleteBtn.dataset.id = project.id;

    projectsTbody.appendChild(clone);
});
    

    }

    function renderEmployeesTable() {
        const monthData = getCurrentMonthData();
        let employees = [...(monthData.employees || [])];
        employees = employees.filter(employee => {
            const nameMatch = employee.name
                .toLowerCase()
                .includes(employeeFilters.name);
        
            const surnameMatch = employee.surname
                .toLowerCase()
                .includes(employeeFilters.surname);
        
            const positionMatch = employeeFilters.position
                ? employee.position.toLowerCase() === employeeFilters.position
                : true;
        
            return nameMatch && surnameMatch && positionMatch;
        });
 
        if (employeeSortField) {
            employees.sort((a, b) => {
                const valueA = getEmployeeSortValue(a, employeeSortField);
                const valueB = getEmployeeSortValue(b, employeeSortField);
    
                if (typeof valueA === 'string') {
                    return employeeSortDirection === 'asc'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }
    
                return employeeSortDirection === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            });
        }
    
        employeesTbody.innerHTML = '';
    
        employees.forEach(employee => {
            const age = calculateAge(employee.birthdate);
            const salary = Number(employee.salary) || 0;
            const estimatedPayment = salary;
    
            const assignments = employee.assignments || [];
            const projectLabel = assignments.length
                ? assignments.map(assignment => {
                    const project = getProjectById(assignment.projectId);
    
                    return project
                        ? `${project.projectName} (${Number(assignment.capacity).toFixed(2)}/${Number(assignment.fit).toFixed(2)})`
                        : 'Deleted project';
                }).join(', ')
                : 'Not assigned';
    
            const projectedIncome = Number(calculateEmployeeProfit(employee)) || 0;
            const totalCapacity = getEmployeeTotalCapacity(employee);
    
            const row = document.createElement('tr');
    
            row.innerHTML = `
                <td>${employee.name}</td>
                <td>${employee.surname}</td>
                <td>${age}</td>
                <td>${employee.position}</td>
                <td>$${salary.toFixed(2)}</td>
                <td>$${estimatedPayment.toFixed(2)}</td>
                <td>${projectLabel}</td>
                <td class="${projectedIncome >= 0 ? 'income-positive' : 'income-negative'}">
                    $${projectedIncome.toFixed(2)}
                </td>
                <td>
                    <button 
                        type="button" 
                        class="assign-employee-btn" 
                        data-id="${employee.id}"
                        ${totalCapacity >= 1.5 ? 'disabled' : ''}
                    >
                        Assign
                    </button>
    
                    <button type="button" class="delete-employee-btn" data-id="${employee.id}">
                        Delete
                    </button>
                </td>
            `;
    
            employeesTbody.appendChild(row);
        });
    }
    
    
    function renderProjectFilterChips() {
        renderFilterChips(projectFilterChips, projectFilters, {
            companyName: 'Company Name',
            projectName: 'Project Name'
        }, 'projects');
    }
    
    function renderEmployeeFilterChips() {
        renderFilterChips(employeeFilterChips, employeeFilters, {
            name: 'Name',
            surname: 'Surname',
            position: 'Position'
        }, 'employees');
    }
    
    function renderFilterChips(container, filtersObj, labels, table) {
        container.innerHTML = '';
    
        const activeFilters = Object.entries(filtersObj).filter(([_, value]) => value);
    
        activeFilters.forEach(([field, value]) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'filter-chip';
            chip.dataset.table = table;
            chip.dataset.field = field;
            chip.textContent = `${labels[field]}: ${value} ×`;
    
            container.appendChild(chip);
        });
    
        if (activeFilters.length >= 2) {
            const clearChip = document.createElement('button');
            clearChip.type = 'button';
            clearChip.className = 'filter-chip clear-filters-chip';
            clearChip.dataset.table = table;
            clearChip.textContent = 'Clear Filters ×';
    
            container.appendChild(clearChip);
        }
    }


    projectFilterChips.addEventListener('click', function (e) {
        if (!e.target.classList.contains('filter-chip')) return;
    
        if (e.target.classList.contains('clear-filters-chip')) {
            projectFilters = {
                companyName: '',
                projectName: ''
            };
        } else {
            projectFilters[e.target.dataset.field] = '';
        }
    
        renderProjectsTable();
        renderProjectFilterChips();
    });
    
    employeeFilterChips.addEventListener('click', function (e) {
        if (!e.target.classList.contains('filter-chip')) return;
    
        if (e.target.classList.contains('clear-filters-chip')) {
            employeeFilters = {
                name: '',
                surname: '',
                position: ''
            };
        } else {
            employeeFilters[e.target.dataset.field] = '';
        }
    
        renderEmployeesTable();
        renderEmployeeFilterChips();
    });






    function validateProjectInput(input) {
        let error = '';
        const value = input.value.trim();

        if (input.name === 'project_name') {
            if (!value) error = 'Project Name is required';
            else if (value.length < 3) error = 'Minimum 3 characters';
            else if (!/^[a-zA-Z0-9\s]+$/.test(value)) error = 'Only letters and numbers allowed';
        }

        if (input.name === 'company_name') {
            if (!value) error = 'Company Name is required';
            else if (value.length < 2) error = 'Minimum 2 characters';
            else if (!/^[a-zA-Z0-9\s]+$/.test(value)) error = 'Only letters and numbers allowed';
        }

        if (input.name === 'project_budget') {
            if (!value) error = 'Budget is required';
            else if (!/^\d+(\.\d{2})$/.test(value)) error = 'Enter a positive number with 2 decimal places';
            else if (parseFloat(value) <= 0) error = 'Budget must be greater than 0';
        }

        if (input.name === 'employee_capacity') {
            if (!value) error = 'Employee Capacity is required';
            else if (!/^\d+$/.test(value)) error = 'Must be an integer';
            else if (parseInt(value, 10) < 1) error = 'Minimum value is 1';
        }

        const errorEl = document.querySelector(`#${input.id}-error`);
        if (errorEl) errorEl.textContent = error;

        input.classList.toggle('invalid', !!error);
        input.classList.toggle('valid', !error && value !== '');

        return !error;
    }

    function checkProjectForm() {
        let isValid = true;

        projectInputs.forEach(input => {
            if (!validateProjectInput(input)) isValid = false;
        });

        projectSubmitBtn.disabled = !isValid;
        return isValid;
    }

    function validateEmployeeInput(input) {
        let error = '';
        const value = input.value.trim();

        if (input.name === 'employee_name') {
            if (!value) error = 'Name is required';
            else if (value.length < 2) error = 'Minimum 2 characters';
            else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) error = 'Only letters allowed';
        }

        if (input.name === 'employee_surname') {
            if (!value) error = 'Surname is required';
            else if (value.length < 2) error = 'Minimum 2 characters';
            else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) error = 'Only letters allowed';
        }

        if (input.name === 'employee_birthdate') {
            if (!value) {
                error = 'Date of birth is required';
            } else {
                const birthDate = new Date(value);
                const today = new Date();

                if (birthDate > today) {
                    error = 'Birth date cannot be in the future';
                }
            }
        }

        if (input.name === 'employee_position') {
            if (!value || value === 'Select position') error = 'Position is required';
        }

        if (input.name === 'employee_salary') {
            if (!value) error = 'Salary is required';
            else if (!/^\d+(\.\d{2})$/.test(value)) error = 'Enter number like 1000.00';
            else if (parseFloat(value) <= 0) error = 'Salary must be greater than 0';
        }

        const errorEl = document.querySelector(`#${input.id}-error`);
        if (errorEl) errorEl.textContent = error;

        input.classList.toggle('invalid', !!error);
        input.classList.toggle('valid', !error && value !== '');

        return !error;
    }

    function checkEmployeeForm() {
        let isValid = true;

        employeeInputs.forEach(input => {
            if (!validateEmployeeInput(input)) isValid = false;
        });

        employeeSubmitBtn.disabled = !isValid;
        return isValid;
    }

    function openAssignPopup(employeeId, projectIdToEdit = null) {
        selectedEmployeeIdForAssign = employeeId;

        const monthData = getCurrentMonthData();
        const employee = monthData.employees.find(item => {
            return String(item.id) === String(employeeId);
        });

        assignProjectSelect.innerHTML = '<option value="">Select project</option>';

        monthData.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.projectName} (${project.companyName})`;
            assignProjectSelect.appendChild(option);
        });

        assignCapacityInput.value = '0.5';
        assignFitInput.value = '1.0';

        if (employee && projectIdToEdit) {
            const assignment = getAssignmentForProject(employee, projectIdToEdit);

            if (assignment) {
                assignProjectSelect.value = assignment.projectId;
                assignCapacityInput.value = assignment.capacity;
                assignFitInput.value = assignment.fit;
            }
        }

        assignPopup.classList.add('open');
        assignPopup.setAttribute('aria-hidden', 'false');
    }

    function closeAssignPopup() {
        selectedEmployeeIdForAssign = null;
        assignPopup.classList.remove('open');
        assignPopup.setAttribute('aria-hidden', 'true');
    }

    function saveAssignment() {
        const projectId = assignProjectSelect.value;
        const capacity = Number(assignCapacityInput.value);
        const fit = Number(assignFitInput.value);

        if (!projectId) {
            alert('Select project');
            return;
        }

        if (capacity < 0 || capacity > 1.5) {
            alert('Capacity must be between 0.0 and 1.5');
            return;
        }

        if (fit < 0 || fit > 1) {
            alert('Fit must be between 0.0 and 1.0');
            return;
        }

        const data = createSnapshotIfMissing();
        const employee = data[currentPeriod].employees.find(item => {
            return String(item.id) === String(selectedEmployeeIdForAssign);
        });

        if (!employee) return;

        employee.assignments = employee.assignments || [];

        const currentTotalCapacity = getEmployeeTotalCapacity(employee);
        const existingAssignment = employee.assignments.find(item => {
            return String(item.projectId) === String(projectId);
        });

        const existingCapacity = existingAssignment ? Number(existingAssignment.capacity) || 0 : 0;
        const newTotalCapacity = currentTotalCapacity - existingCapacity + capacity;

        if (newTotalCapacity > 1.5) {
            alert('Total employee capacity cannot exceed 1.5');
            return;
        }

        if (existingAssignment) {
            existingAssignment.capacity = capacity;
            existingAssignment.fit = fit;
        } else {
            employee.assignments.push({
                projectId,
                capacity,
                fit
            });
        }

        saveMonthlyData(data);

        closeAssignPopup();
        renderEmployeesTable();
        renderProjectsTable();
    }

    function openProjectEmployeesPopup(projectId) {
        const project = getProjectById(projectId);
        const monthData = getCurrentMonthData();

        if (!project) return;

        const employees = (monthData.employees || [])
            .filter(employee => getAssignmentForProject(employee, projectId))
            .sort((a, b) => a.name.localeCompare(b.name));

        projectEmployeesTitle.textContent = `Employees for ${project.projectName}`;
        projectEmployeesList.innerHTML = '';

        if (employees.length === 0) {
            projectEmployeesList.innerHTML = '<p>No employees assigned to this project.</p>';
        }

        employees.forEach(employee => {
            const assignment = getAssignmentForProject(employee, projectId);

            const capacity = Number(assignment.capacity) || 0;
            const fit = Number(assignment.fit) || 0;
            const vacationCoefficient = calculateVacationCoefficient(employee.vacationDays);
            const effectiveCapacity = capacity * fit * vacationCoefficient;

            const revenue = calculateRevenue(project, effectiveCapacity);
            const cost = calculateCost(employee, capacity);
            const profit = calculateAssignmentProfit(project, employee, assignment);

            const card = document.createElement('div');
            card.classList.add('employee-detail-card');

            card.innerHTML = `
                <button type="button" class="employee-name-link" data-id="${employee.id}">
                    ${employee.name} ${employee.surname}
                </button>

                <p><strong>Assigned capacity:</strong> ${capacity.toFixed(2)}</p>
                <p><strong>Project fit coefficient:</strong> ${fit.toFixed(2)}</p>
                <p><strong>Vacation days:</strong> ${(employee.vacationDays || []).join(', ') || 'None'}</p>
                <p><strong>Effective capacity:</strong> ${effectiveCapacity.toFixed(3)}</p>
                <p><strong>Revenue:</strong> $${revenue.toFixed(2)}</p>
                <p><strong>Cost:</strong> $${cost.toFixed(2)}</p>
                <p class="${profit >= 0 ? 'income-positive' : 'income-negative'}">
                    <strong>Profit:</strong> $${profit.toFixed(2)}
                </p>

                <div class="employee-actions">
                    <button 
                        type="button" 
                        class="edit-assignment-btn" 
                        data-employee-id="${employee.id}" 
                        data-project-id="${projectId}"
                    >
                        Edit
                    </button>

                    <button 
                        type="button" 
                        class="unassign-employee-btn" 
                        data-employee-id="${employee.id}" 
                        data-project-id="${projectId}"
                    >
                        Unassign
                    </button>
                </div>
            `;

            projectEmployeesList.appendChild(card);
        });

        projectEmployeesPopup.classList.add('open');
        projectEmployeesPopup.setAttribute('aria-hidden', 'false');
    }

    function closeProjectEmployeesPopup() {
        projectEmployeesPopup.classList.remove('open');
        projectEmployeesPopup.setAttribute('aria-hidden', 'true');
    }

    function unassignEmployeeFromProject(employeeId, projectId) {
        const data = createSnapshotIfMissing();

        const employee = data[currentPeriod].employees.find(item => {
            return String(item.id) === String(employeeId);
        });

        if (!employee) return;

        employee.assignments = (employee.assignments || []).filter(assignment => {
            return String(assignment.projectId) !== String(projectId);
        });

        saveMonthlyData(data);

        renderEmployeesTable();
        renderProjectsTable();
        openProjectEmployeesPopup(projectId);
    }

    function createAssignPopup() {
        if (document.querySelector('#assign-popup')) return;

        const popup = document.createElement('div');
        popup.id = 'assign-popup';
        popup.className = 'assign-popup';
        popup.setAttribute('aria-hidden', 'true');

        popup.innerHTML = `
            <div class="assign-popup-content">
                <h3>Assign Employee</h3>

                <div class="input-data">
                    <label for="assign-project">Project</label>
                    <select id="assign-project"></select>
                </div>

                <div class="input-data">
                    <label for="assign-capacity">Capacity</label>
                    <input type="number" id="assign-capacity" min="0" max="1.5" step="0.1">
                </div>

                <div class="input-data">
                    <label for="assign-fit">Fit</label>
                    <input type="number" id="assign-fit" min="0" max="1" step="0.1">
                </div>

                <div class="assign-popup-actions">
                    <button type="button" id="assign-save-btn">Save</button>
                    <button type="button" id="assign-cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
    }

    function createProjectEmployeesPopup() {
        if (document.querySelector('#project-employees-popup')) return;

        const popup = document.createElement('div');
        popup.id = 'project-employees-popup';
        popup.className = 'project-employees-popup';
        popup.setAttribute('aria-hidden', 'true');

        popup.innerHTML = `
            <div class="project-employees-content">
                <button type="button" class="popup-close-btn" id="project-employees-close">×</button>
                <h3 id="project-employees-title">Employees</h3>
                <div id="project-employees-list"></div>
            </div>
        `;

        document.body.appendChild(popup);
    }

    if (sidebar && closeBtn && openBtn) {
        closeBtn.addEventListener('click', function () {
            sidebar.classList.add('hidden');
            openBtn.style.display = 'block';
            openBtn.focus();
        });

        openBtn.addEventListener('click', function () {
            sidebar.classList.remove('hidden');
            openBtn.style.display = 'none';
            closeBtn.focus();
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            switchTab(item.dataset.tab);
        });
    });

    projectInputs.forEach(input => {
        input.addEventListener('input', function () {
            validateProjectInput(input);
            checkProjectForm();
        });

        input.addEventListener('blur', function () {
            validateProjectInput(input);
            checkProjectForm();
        });
    });

    employeeInputs.forEach(input => {
        input.addEventListener('input', function () {
            validateEmployeeInput(input);
            checkEmployeeForm();
        });

        input.addEventListener('blur', function () {
            validateEmployeeInput(input);
            checkEmployeeForm();
        });
    });


    employeeSortableHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const field = header.dataset.sort;
    
            if (employeeSortField === field) {
                employeeSortDirection = employeeSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                employeeSortField = field;
                employeeSortDirection = 'asc';
            }
    
            employeeSortableHeaders.forEach(h => {
                h.classList.remove('active');
                const icon = h.querySelector('.sort-icon');
                if (icon) {
                    icon.textContent = '⇅';
}
            });
    
            header.classList.add('active');
            const activeIcon = header.querySelector('.sort-icon');
            if (activeIcon) {
                activeIcon.textContent = employeeSortDirection === 'asc' ? '↑' : '↓';
            }
    
            renderEmployeesTable();
        });
    });
    projectSortableHeaders.forEach(header => {
        header.addEventListener('click', function (e) {
            if (e.target.classList.contains('filter-icon')) {
                return;
            }
    
            const field = header.dataset.sort;
    
            if (projectSortField === field) {
                projectSortDirection = projectSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                projectSortField = field;
                projectSortDirection = 'asc';
            }
    
            projectSortableHeaders.forEach(h => {
                h.classList.remove('active');
    
                const icon = h.querySelector('.sort-icon');
                if (icon) {
                    icon.textContent = '⇅';
                }
            });
    
            header.classList.add('active');
    
            const activeIcon = header.querySelector('.sort-icon');
            if (activeIcon) {
                activeIcon.textContent = projectSortDirection === 'asc' ? '↑' : '↓';
            }
    
            renderProjectsTable();
        });
    });
   


    addProjectBtn.addEventListener('click', function () {
        projectPanel.classList.add('open');
        projectPanel.setAttribute('aria-hidden', 'false');
        projectName.focus();
    });

    cancelProjectBtn.addEventListener('click', function () {
        projectPanel.classList.remove('open');
        projectPanel.setAttribute('aria-hidden', 'true');
        addProjectBtn.focus();
    });

    addEmployeeBtn.addEventListener('click', function () {
        employeePanel.classList.add('open');
        employeePanel.setAttribute('aria-hidden', 'false');
        employeeName.focus();
    });

    cancelEmployeeBtn.addEventListener('click', function () {
        employeePanel.classList.remove('open');
        employeePanel.setAttribute('aria-hidden', 'true');
        addEmployeeBtn.focus();
    });

    projectForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (checkProjectForm()) {
            const newProject = {
                id: Date.now(),
                projectName: projectName.value.trim(),
                companyName: companyName.value.trim(),
                budget: parseFloat(budget.value).toFixed(2),
                employeeCapacity: parseInt(employeeCapacity.value, 10)
            };

            addProject(newProject);
            renderProjectsTable();

            projectForm.reset();
            projectSubmitBtn.disabled = true;

            projectInputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });

            document.querySelectorAll('#add-project-form .error').forEach(el => {
                el.textContent = '';
            });

            projectPanel.classList.remove('open');
            projectPanel.setAttribute('aria-hidden', 'true');
            addProjectBtn.focus();
        }
    });

    employeeForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (checkEmployeeForm()) {
            const newEmployee = {
                id: Date.now(),
                name: employeeName.value.trim(),
                surname: employeeSurname.value.trim(),
                birthdate: employeeBirthdate.value,
                position: employeePosition.value,
                salary: parseFloat(employeeSalary.value).toFixed(2),
                assignments: [],
                vacationDays: []
            };

            addEmployee(newEmployee);
            renderEmployeesTable();

            employeeForm.reset();
            employeeSubmitBtn.disabled = true;

            employeeInputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });

            document.querySelectorAll('#add-employee-form .error').forEach(el => {
                el.textContent = '';
            });

            employeePanel.classList.remove('open');
            employeePanel.setAttribute('aria-hidden', 'true');
            addEmployeeBtn.focus();
        }
    });

    projectsTbody.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-project-btn')) {
            deleteProject(e.target.dataset.id);
        }

        if (e.target.classList.contains('show-employees-btn')) {
            openProjectEmployeesPopup(e.target.dataset.id);
        }
    });

    employeesTbody.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-employee-btn')) {
            deleteEmployee(e.target.dataset.id);
        }

        if (e.target.classList.contains('assign-employee-btn')) {
            openAssignPopup(e.target.dataset.id);
        }
    });

    assignSaveBtn.addEventListener('click', saveAssignment);
    assignCancelBtn.addEventListener('click', closeAssignPopup);

    assignPopup.addEventListener('click', function (e) {
        if (e.target === assignPopup) {
            closeAssignPopup();
        }
    });

    projectEmployeesClose.addEventListener('click', closeProjectEmployeesPopup);

    projectEmployeesPopup.addEventListener('click', function (e) {
        if (e.target === projectEmployeesPopup) {
            closeProjectEmployeesPopup();
        }
    });

    projectEmployeesList.addEventListener('click', function (e) {
        if (e.target.classList.contains('unassign-employee-btn')) {
            unassignEmployeeFromProject(
                e.target.dataset.employeeId,
                e.target.dataset.projectId
            );
        }

        if (e.target.classList.contains('edit-assignment-btn')) {
            closeProjectEmployeesPopup();
            openAssignPopup(
                e.target.dataset.employeeId,
                e.target.dataset.projectId
            );
        }

        if (e.target.classList.contains('employee-name-link')) {
            console.log('Employee action menu:', e.target.dataset.id);
        }
    });

    monthSelect.addEventListener('change', function () {
        updateCurrentPeriod();
        createSnapshotIfMissing();
        renderProjectsTable();
        renderEmployeesTable();
    });

    yearSelect.addEventListener('change', function () {
        updateCurrentPeriod();
        createSnapshotIfMissing();
        renderProjectsTable();
        renderEmployeesTable();
    });


    seedBtn.addEventListener('click', openSeedPopup);

document.querySelector('#seed-close-btn').addEventListener('click', closeSeedPopup);

document.querySelector('#seed-popup').addEventListener('click', function (e) {
    if (e.target.id === 'seed-popup') {
        closeSeedPopup();
    }
});

document.querySelector('#seed-list').addEventListener('click', function (e) {
    if (e.target.classList.contains('seed-month-btn')) {
        seedFromPeriod(e.target.dataset.period);
    }
});

    updateCurrentPeriod();
    createSnapshotIfMissing();
    renderProjectsTable();
    renderEmployeesTable();
    switchTab('projects');
    renderProjectFilterChips();
renderEmployeeFilterChips();

    projectSubmitBtn.disabled = true;
    employeeSubmitBtn.disabled = true;
});