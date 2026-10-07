// ================================
// TASK & HABIT TRACKER - JAVASCRIPT
// ================================

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------
    // STATE
    // -------------------------------

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    let habits = JSON.parse(localStorage.getItem("habits")) || [];

    let selectedFilter = "all";


    // -------------------------------
    // DOM ELEMENTS
    // -------------------------------

    const taskList = document.querySelector("#taskList");
    const habitList = document.querySelector("#habitList");

    const taskModal = document.querySelector("#taskModal");
    const habitModal = document.querySelector("#habitModal");

    const taskForm = document.querySelector("#taskForm");
    const habitForm = document.querySelector("#habitForm");

    const taskTitle = document.querySelector("#taskTitle");
    const taskDescription = document.querySelector("#taskDescription");
    const taskDueDate = document.querySelector("#taskDueDate");
    const taskPriority = document.querySelector("#taskPriority");
    const taskStatus = document.querySelector("#taskStatus");

    const habitName = document.querySelector("#habitName");
    const habitFrequency = document.querySelector("#habitFrequency");


    // -------------------------------
    // STORAGE
    // -------------------------------

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }


    // -------------------------------
    // CREATE TASK
    // -------------------------------

    function createTask(data) {

        const task = {
            id: Date.now(),

            title: data.title,

            description: data.description,

            dueDate: data.dueDate,

            priority: data.priority,

            status: data.status,

            createdAt: new Date().toISOString()
        };

        tasks.push(task);

        saveTasks();

        renderTasks();

        updateAnalytics();
    }


    // -------------------------------
    // DELETE TASK
    // -------------------------------

    function deleteTask(id) {

        tasks = tasks.filter(task => task.id !== id);

        saveTasks();

        renderTasks();

        updateAnalytics();
    }


    // -------------------------------
    // UPDATE TASK STATUS
    // -------------------------------

    function updateTaskStatus(id, status) {

        const task = tasks.find(task => task.id === id);

        if (!task) return;

        task.status = status;

        saveTasks();

        renderTasks();

        updateAnalytics();
    }


    // -------------------------------
    // FILTER TASKS
    // -------------------------------

    function filterTasks(filter) {

        selectedFilter = filter;

        renderTasks();
    }


    // -------------------------------
    // RENDER TASKS
    // -------------------------------

    function renderTasks() {

        if (!taskList) return;

        taskList.innerHTML = "";

        let filteredTasks = tasks;

        if (selectedFilter !== "all") {

            filteredTasks = tasks.filter(
                task => task.status === selectedFilter
            );
        }

        if (filteredTasks.length === 0) {

            taskList.innerHTML = `
                <div class="empty-state">
                    <p>No tasks available</p>
                </div>
            `;

            return;
        }

        filteredTasks.forEach(task => {

            const taskElement = document.createElement("div");

            taskElement.className = "task-card";

            taskElement.dataset.id = task.id;

            taskElement.innerHTML = `

                <div class="task-card-header">

                    <div class="task-title-section">

                        <input
                            type="checkbox"
                            class="task-checkbox"
                            ${task.status === "completed" ? "checked" : ""}
                        >

                        <h3>${escapeHTML(task.title)}</h3>

                    </div>

                    <button
                        class="delete-task"
                        data-id="${task.id}"
                    >
                        ×
                    </button>

                </div>


                <p class="task-description">
                    ${escapeHTML(task.description || "")}
                </p>


                <div class="task-meta">

                    <span class="task-priority ${task.priority}">
                        ${task.priority}
                    </span>

                    <span class="task-date">
                        ${formatDate(task.dueDate)}
                    </span>

                </div>


                <div class="task-status">

                    <select class="status-select">

                        <option value="active"
                            ${task.status === "active" ? "selected" : ""}>
                            Active
                        </option>

                        <option value="in-progress"
                            ${task.status === "in-progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="stalled"
                            ${task.status === "stalled" ? "selected" : ""}>
                            Stalled
                        </option>

                        <option value="completed"
                            ${task.status === "completed" ? "selected" : ""}>
                            Completed
                        </option>

                    </select>

                </div>
            `;


            const checkbox =
                taskElement.querySelector(".task-checkbox");

            checkbox.addEventListener("change", () => {

                updateTaskStatus(
                    task.id,
                    checkbox.checked
                        ? "completed"
                        : "active"
                );

            });


            const statusSelect =
                taskElement.querySelector(".status-select");

            statusSelect.addEventListener("change", () => {

                updateTaskStatus(
                    task.id,
                    statusSelect.value
                );

            });


            const deleteButton =
                taskElement.querySelector(".delete-task");

            deleteButton.addEventListener("click", () => {

                deleteTask(task.id);

            });


            taskList.appendChild(taskElement);

        });

    }


    // -------------------------------
    // CREATE HABIT
    // -------------------------------

    function createHabit(data) {

        const habit = {

            id: Date.now(),

            name: data.name,

            frequency: data.frequency,

            streak: 0,

            completedDates: [],

            createdAt: new Date().toISOString()

        };

        habits.push(habit);

        saveHabits();

        renderHabits();

        updateAnalytics();
    }


    // -------------------------------
    // COMPLETE HABIT
    // -------------------------------

    function toggleHabit(id) {

        const habit = habits.find(
            habit => habit.id === id
        );

        if (!habit) return;

        const today = getToday();

        const index =
            habit.completedDates.indexOf(today);


        if (index === -1) {

            habit.completedDates.push(today);

            habit.streak++;

        } else {

            habit.completedDates.splice(index, 1);

            if (habit.streak > 0) {
                habit.streak--;
            }

        }

        saveHabits();

        renderHabits();

        updateAnalytics();
    }


    // -------------------------------
    // DELETE HABIT
    // -------------------------------

    function deleteHabit(id) {

        habits = habits.filter(
            habit => habit.id !== id
        );

        saveHabits();

        renderHabits();

        updateAnalytics();
    }


    // -------------------------------
    // RENDER HABITS
    // -------------------------------

    function renderHabits() {

        if (!habitList) return;

        habitList.innerHTML = "";

        if (habits.length === 0) {

            habitList.innerHTML = `
                <div class="empty-state">
                    <p>No habits available</p>
                </div>
            `;

            return;
        }


        habits.forEach(habit => {

            const completedToday =
                habit.completedDates.includes(getToday());


            const habitElement =
                document.createElement("div");

            habitElement.className = "habit-card";

            habitElement.dataset.id = habit.id;


            habitElement.innerHTML = `

                <div class="habit-info">

                    <h3>
                        ${escapeHTML(habit.name)}
                    </h3>

                    <span>
                        ${habit.frequency}
                    </span>

                </div>


                <div class="habit-streak">

                    <strong>
                        ${habit.streak}
                    </strong>

                    <small>
                        day streak
                    </small>

                </div>


                <button
                    class="habit-check ${
                        completedToday ? "completed" : ""
                    }"
                >
                    ${completedToday ? "✓" : "○"}
                </button>


                <button
                    class="delete-habit"
                >
                    ×
                </button>

            `;


            habitElement
                .querySelector(".habit-check")
                .addEventListener("click", () => {

                    toggleHabit(habit.id);

                });


            habitElement
                .querySelector(".delete-habit")
                .addEventListener("click", () => {

                    deleteHabit(habit.id);

                });


            habitList.appendChild(habitElement);

        });

    }


    // -------------------------------
    // ANALYTICS
    // -------------------------------

    function updateAnalytics() {

        const totalTasks = tasks.length;

        const completedTasks =
            tasks.filter(
                task => task.status === "completed"
            ).length;

        const activeTasks =
            tasks.filter(
                task => task.status !== "completed"
            ).length;


        const totalHabits = habits.length;

        const completedHabits =
            habits.filter(
                habit =>
                    habit.completedDates.includes(getToday())
            ).length;


        const completionRate =
            totalTasks === 0
                ? 0
                : Math.round(
                    (completedTasks / totalTasks) * 100
                );


        updateElement(
            "#totalTasks",
            totalTasks
        );

        updateElement(
            "#completedTasks",
            completedTasks
        );

        updateElement(
            "#activeTasks",
            activeTasks
        );

        updateElement(
            "#totalHabits",
            totalHabits
        );

        updateElement(
            "#completedHabits",
            completedHabits
        );

        updateElement(
            "#completionRate",
            `${completionRate}%`
        );


        updateDonutChart(completionRate);

    }


    // -------------------------------
    // DONUT CHART
    // -------------------------------

    function updateDonutChart(value) {

        const chart =
            document.querySelector(".donut-chart");


        if (!chart) return;


        const percentage =
            Math.min(Math.max(value, 0), 100);


        chart.style.setProperty(
            "--progress",
            `${percentage}%`
        );


        const chartValue =
            chart.querySelector(".donut-value");


        if (chartValue) {

            chartValue.textContent =
                `${percentage}%`;

        }

    }


    // -------------------------------
    // FORM - TASK
    // -------------------------------

    if (taskForm) {

        taskForm.addEventListener("submit", event => {

            event.preventDefault();


            createTask({

                title: taskTitle?.value.trim() || "",

                description:
                    taskDescription?.value.trim() || "",

                dueDate:
                    taskDueDate?.value || "",

                priority:
                    taskPriority?.value || "medium",

                status:
                    taskStatus?.value || "active"

            });


            taskForm.reset();

            closeModal(taskModal);

        });

    }


    // -------------------------------
    // FORM - HABIT
    // -------------------------------

    if (habitForm) {

        habitForm.addEventListener("submit", event => {

            event.preventDefault();


            createHabit({

                name:
                    habitName?.value.trim() || "",

                frequency:
                    habitFrequency?.value || "daily"

            });


            habitForm.reset();

            closeModal(habitModal);

        });

    }


    // -------------------------------
    // FILTER BUTTONS
    // -------------------------------

    document
        .querySelectorAll("[data-filter]")
        .forEach(button => {

            button.addEventListener("click", () => {

                filterTasks(
                    button.dataset.filter
                );

                document
                    .querySelectorAll("[data-filter]")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

            });

        });


    // -------------------------------
    // OPEN MODALS
    // -------------------------------

    document
        .querySelectorAll("[data-open-modal]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const modalId =
                    button.dataset.openModal;

                const modal =
                    document.querySelector(
                        `#${modalId}`
                    );

                openModal(modal);

            });

        });


    // -------------------------------
    // CLOSE MODALS
    // -------------------------------

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const modal =
                    button.closest(".modal");

                closeModal(modal);

            });

        });


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener("click", event => {

                if (event.target === modal) {

                    closeModal(modal);

                }

            });

        });


    // -------------------------------
    // SIDEBAR NAVIGATION
    // -------------------------------

    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const sectionId =
                    button.dataset.section;


                document
                    .querySelectorAll(".page-section")
                    .forEach(section => {

                        section.classList.remove("active");

                    });


                const section =
                    document.querySelector(
                        `#${sectionId}`
                    );


                if (section) {

                    section.classList.add("active");

                }


                document
                    .querySelectorAll("[data-section]")
                    .forEach(item => {

                        item.classList.remove("active");

                    });


                button.classList.add("active");

            });

        });


    // -------------------------------
    // SEARCH
    // -------------------------------

    const searchInput =
        document.querySelector("#searchInput");


    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(".task-card")
                .forEach(card => {

                    const title =
                        card
                            .querySelector("h3")
                            ?.textContent
                            .toLowerCase() || "";


                    card.style.display =
                        title.includes(search)
                            ? ""
                            : "none";

                });

        });

    }


    // -------------------------------
    // HELPERS
    // -------------------------------

    function openModal(modal) {

        if (!modal) return;

        modal.classList.add("active");

    }


    function closeModal(modal) {

        if (!modal) return;

        modal.classList.remove("active");

    }


    function updateElement(selector, value) {

        const element =
            document.querySelector(selector);

        if (element) {

            element.textContent = value;

        }

    }


    function formatDate(date) {

        if (!date) return "No due date";

        const parsedDate =
            new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function getToday() {

        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    // -------------------------------
    // INITIAL RENDER
    // -------------------------------

    renderTasks();

    renderHabits();

    updateAnalytics();

});