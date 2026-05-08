https://anastasiyabobko.github.io/Dashboard-Project/




App overview
The Employee & Project Dashboard is a comprehensive management application for tracking employees, projects, and their assignments across different time periods. 




Implemented functionality:

1. Data Persistence & Monthly Snapshots
 - Data persists in localStorage and loads on page refresh
 - Each month stores independent data (changes in one month don't affect others)
 - Month/Year selectors switch between different months' data correctly
 - Seed Data feature copies data from one month to another
 
2. Employee CRUD Operations 
 - Add Employee form creates new employees with all fields
 - Delete Employee button removes employee and all their assignments
 - Inline editing works for Position (dropdown) and Salary (number input)

3. Project CRUD Operations
 - Add Project form creates new projects with all fields
 - Delete Project button removes project and unassigns all employees

4. Assignment Management 
 - Assign button opens popup and successfully assigns employee to project with capacity and fit
 - Unassign only unassigns
 - Edit assignment popup successfully updates capacity and fit values

5. Financial Calculations
 - Effective capacity calculated correctly: capacity × fit × (vacation coefficient - NOT WORKING) 
 - Revenue calculations correct (per employee and per project)
 - Cost calculations correct (minimum 0.5 × salary, bench payments - NOT WORKING)
 - Profit/Income values correct and color-coded (green/red)

6. Forms & Validation 
- Employee form validates all fields (name, surname, DOB 18+, position, salary)
- Project form validates all fields (project name, company, budget, capacity)
- Submit buttons disabled until all fields valid, error messages appear/disappear correctly

7. Tables Display 
 - Projects table displays all data correctly (capacity as "used/total", income color-coded)
 - Employees table displays all data correctly (age calculated, assignments count shown)
 - Total Estimated Income displayed below projects table with correct calculation
 - Assign button disabled when employee at max capacity (1.5)

8. Sorting
 - Clicking sort icons sorts columns ascending/descending (both tables)
 - Sort icons update to show current state (↑ ↓ ⇅)

9. Filtering
- Filter popups work for text columns and Position dropdown
- Filter chips display active filters and can be removed individually
 
10. Details Popups
 - "Show Employees" popup displays all employees on project with correct calculations
 - "Show Assignments" popup displays all employee assignments with correct calculations
 - Popups have close button
 - Empty state message shown when no data


13. Navigation & UI (10 points)
 - Projects/Employees tabs switch content correctly
 - Sidebar collapses/expands with toggle button
- "See at Projects/Employees" links navigate and apply filters
