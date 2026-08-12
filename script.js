/* =========================================================
   STUDENTHUB JAVASCRIPT
   COMPLETE VERSION
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let students = [];


/* =========================================================
   LOAD STUDENTS FROM LOCAL STORAGE
   ========================================================= */

try {

    students = JSON.parse(
        localStorage.getItem(
            "studenthub_students"
        ) || "[]"
    );

    if (!Array.isArray(students)) {
        students = [];
    }

} catch (error) {

    students = [];

}


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) =>
    document.getElementById(id);


const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   CURRENT FILTER
   =========================================================

   ""       = All Students
   Passed   = Passed Students
   Failed   = Failed Students
*/

let studentFilter =
    sessionStorage.getItem(
        "studenthub_filter"
    ) || "";


/* =========================================================
   SAVE STUDENTS
   ========================================================= */

function saveStudents() {

    localStorage.setItem(
        "studenthub_students",
        JSON.stringify(students)
    );

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function safe(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function(char) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[char];

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
    $("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const user =
                $("userId")
                    .value
                    .trim();


            const password =
                $("password")
                    .value
                    .trim();


            /*
               ADMIN LOGIN

               User ID:
               admin

               Password:
               1234
            */

            if (
                user === "admin" &&
                password === "1234"
            ) {

                sessionStorage.setItem(
                    "studenthub_logged_in",
                    "true"
                );


                $("loginPage")
                    .classList
                    .add("hidden");


                $("app")
                    .classList
                    .remove("hidden");


                if ($("loginError")) {

                    $("loginError")
                        .textContent = "";

                }


                openPage(
                    "dashboard"
                );


            } else {

                if ($("loginError")) {

                    $("loginError")
                        .textContent =
                        "Wrong User ID or Password.";

                }

            }

        }
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

const togglePassword =
    $("togglePassword");


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function() {

            const input =
                $("password");


            if (!input) {
                return;
            }


            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                togglePassword
                    .textContent =
                    "🙈";

            } else {

                input.type =
                    "password";

                togglePassword
                    .textContent =
                    "👁";

            }

        }
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

const menuBtn =
    $("menuBtn");


const sidebar =
    $("sidebar");


const overlay =
    $("overlay");


function openMenu() {

    if (sidebar) {

        sidebar
            .classList
            .add("open");

    }


    if (overlay) {

        overlay
            .classList
            .add("show");

    }


    if (menuBtn) {

        menuBtn
            .classList
            .add("open");

    }

}


function closeMenu() {

    if (sidebar) {

        sidebar
            .classList
            .remove("open");

    }


    if (overlay) {

        overlay
            .classList
            .remove("show");

    }


    if (menuBtn) {

        menuBtn
            .classList
            .remove("open");

    }

}


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            if (
                sidebar &&
                sidebar.classList
                    .contains("open")
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );

}


if (overlay) {

    overlay.addEventListener(
        "click",
        closeMenu
    );

}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeMenu();

        }

    }
);


/* =========================================================
   PAGE TITLES
   ========================================================= */

const pageTitles = {

    dashboard: [
        "Dashboard",
        "Manage your students easily."
    ],

    profile: [
        "Profile",
        "Your StudentHub account."
    ],

    add: [
        "Add Student",
        "Create a new student record."
    ],

    records: [
        "Student Records",
        "Search and manage registered students."
    ],

    courses: [
        "Courses",
        "Active academic courses."
    ],

    statistics: [
        "Statistics",
        "Student performance overview."
    ],

    attendance: [
        "Attendance",
        "Attendance section."
    ],

    fees: [
        "Fees",
        "Fees management section."
    ],

    notices: [
        "Notices",
        "Important notices."
    ]

};


/* =========================================================
   OPEN PAGE
   ========================================================= */

function openPage(page) {


    /* -----------------------------------------
       REMOVE OLD ACTIVE PAGE
       ----------------------------------------- */

    $$(".page").forEach(
        function(section) {

            section
                .classList
                .remove("active");

        }
    );


    /* -----------------------------------------
       FIND TARGET PAGE
       ----------------------------------------- */

    const target =
        $(page);


    if (!target) {
        return;
    }


    /* -----------------------------------------
       SHOW PAGE
       ----------------------------------------- */

    target
        .classList
        .add("active");


    /* -----------------------------------------
       SIDEBAR ACTIVE BUTTON
       ----------------------------------------- */

    $$(".nav-item").forEach(
        function(button) {

            button
                .classList
                .toggle(
                    "active",
                    button.dataset.page ===
                    page
                );

        }
    );


    /* -----------------------------------------
       PAGE TITLE
       ----------------------------------------- */

    if (
        pageTitles[page]
    ) {

        if ($("pageTitle")) {

            $("pageTitle")
                .textContent =
                pageTitles[page][0];

        }


        if ($("pageSubtitle")) {

            $("pageSubtitle")
                .textContent =
                pageTitles[page][1];

        }

    }


    /* -----------------------------------------
       PAGE-SPECIFIC RENDER
       ----------------------------------------- */

    if (
        page ===
        "records"
    ) {

        renderStudents();

    }


    if (
        page ===
        "courses"
    ) {

        renderCourses();

    }


    if (
        page ===
        "statistics"
    ) {

        updateStatistics();

    }


    updateDashboard();


    closeMenu();

}


/* =========================================================
   DASHBOARD STAT CARD CLICK
   ========================================================= */

function setupDashboardCards() {

    const cards =
        document.querySelectorAll(
            ".stats-grid .stat-card"
        );


    if (!cards.length) {
        return;
    }


    cards.forEach(
        function(card) {

            card.style.cursor =
                "pointer";


            card.setAttribute(
                "role",
                "button"
            );


            card.setAttribute(
                "tabindex",
                "0"
            );

        }
    );


    /* =========================================
       TOTAL STUDENTS
       ========================================= */

    if (cards[0]) {

        cards[0].onclick =
            function() {

                studentFilter =
                    "";

                sessionStorage.removeItem(
                    "studenthub_filter"
                );


                if ($("searchInput")) {

                    $("searchInput")
                        .value = "";

                }


                openPage(
                    "records"
                );

            };

    }


    /* =========================================
       PASSED
       ========================================= */

    if (cards[1]) {

        cards[1].onclick =
            function() {

                studentFilter =
                    "Passed";


                sessionStorage.setItem(
                    "studenthub_filter",
                    "Passed"
                );


                if ($("searchInput")) {

                    $("searchInput")
                        .value = "";

                }


                openPage(
                    "records"
                );

            };

    }


    /* =========================================
       FAILED
       ========================================= */

    if (cards[2]) {

        cards[2].onclick =
            function() {

                studentFilter =
                    "Failed";


                sessionStorage.setItem(
                    "studenthub_filter",
                    "Failed"
                );


                if ($("searchInput")) {

                    $("searchInput")
                        .value = "";

                }


                openPage(
                    "records"
                );

            };

    }


    /* =========================================
       COURSES
       ========================================= */

    if (cards[3]) {

        cards[3].onclick =
            function() {

                studentFilter =
                    "";

                sessionStorage.removeItem(
                    "studenthub_filter"
                );


                openPage(
                    "courses"
                );

            };

    }


    /* =========================================
       KEYBOARD SUPPORT
       ========================================= */

    cards.forEach(
        function(card) {

            card.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                            "Enter" ||
                        event.key ===
                            " "
                    ) {

                        event.preventDefault();

                        card.click();

                    }

                }
            );

        }
    );

}


/* =========================================================
   SIDEBAR / DATA-PAGE NAVIGATION
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-page]"
            );


        if (!button) {
            return;
        }


        const page =
            button.dataset.page;


        /*
           If user manually opens
           Student Records,
           remove Passed/Failed filter.
        */

        if (
            page ===
            "records"
        ) {

            studentFilter =
                "";

            sessionStorage.removeItem(
                "studenthub_filter"
            );


            if ($("searchInput")) {

                $("searchInput")
                    .value = "";

            }

        }


        openPage(page);

    }
);


/* =========================================================
   ADD STUDENT
   ========================================================= */

const studentForm =
    $("studentForm");


if (studentForm) {

    studentForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const student = {

                key:
                    Date.now()
                    .toString(),

                name:
                    $("studentName")
                        .value
                        .trim(),

                id:
                    $("studentId")
                        .value
                        .trim(),

                email:
                    $("studentEmail")
                        .value
                        .trim(),

                phone:
                    $("studentPhone")
                        .value
                        .trim(),

                course:
                    $("studentCourse")
                        .value,

                result:
                    $("studentResult")
                        .value

            };


            /* -----------------------------------------
               BASIC VALIDATION
               ----------------------------------------- */

            if (
                !student.name ||
                !student.id
            ) {

                alert(
                    "Please enter Student Name and Student ID."
                );

                return;

            }


            /* -----------------------------------------
               DUPLICATE STUDENT ID
               ----------------------------------------- */

            const duplicate =
                students.some(
                    function(item) {

                        return (
                            String(
                                item.id
                            )
                                .toLowerCase()
                                ===
                            String(
                                student.id
                            )
                                .toLowerCase()
                        );

                    }
                );


            if (duplicate) {

                alert(
                    "This Student ID already exists."
                );

                return;

            }


            /* -----------------------------------------
               ADD
               ----------------------------------------- */

            students.push(
                student
            );


            saveStudents();


            /* -----------------------------------------
               RESET FORM
               ----------------------------------------- */

            this.reset();


            /* -----------------------------------------
               UPDATE
               ----------------------------------------- */

            updateDashboard();


            alert(
                "Student added successfully! 🎉"
            );


            /* -----------------------------------------
               OPEN ALL RECORDS
               ----------------------------------------- */

            studentFilter =
                "";

            sessionStorage.removeItem(
                "studenthub_filter"
            );


            openPage(
                "records"
            );

        }
    );

}


/* =========================================================
   DASHBOARD COUNTS
   ========================================================= */

function updateDashboard() {

    const total =
        students.length;


    const passed =
        students.filter(
            function(student) {

                return (
                    String(
                        student.result
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    "passed"
                );

            }
        ).length;


    const failed =
        students.filter(
            function(student) {

                return (
                    String(
                        student.result
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    "failed"
                );

            }
        ).length;


    const courses =
        new Set(
            students
                .map(
                    function(student) {

                        return student.course;

                    }
                )
                .filter(Boolean)
        ).size;


    if ($("totalCount")) {

        $("totalCount")
            .textContent =
            total;

    }


    if ($("passedCount")) {

        $("passedCount")
            .textContent =
            passed;

    }


    if ($("failedCount")) {

        $("failedCount")
            .textContent =
            failed;

    }


    if ($("courseCount")) {

        $("courseCount")
            .textContent =
            courses;

    }


    updateStatistics();

}


/* =========================================================
   STUDENT RECORDS
   ========================================================= */

function renderStudents() {

    const table =
        $("studentTable");


    const empty =
        $("emptyRecords");


    if (
        !table ||
        !empty
    ) {

        return;

    }


    /* -----------------------------------------
       SEARCH
       ----------------------------------------- */

    const searchInput =
        $("searchInput");


    const search =
        searchInput
            ? searchInput
                .value
                .toLowerCase()
                .trim()
            : "";


    /* -----------------------------------------
       CURRENT FILTER
       ----------------------------------------- */

    const savedFilter =
        sessionStorage.getItem(
            "studenthub_filter"
        );


    if (
        savedFilter ===
            "Passed" ||
        savedFilter ===
            "Failed"
    ) {

        studentFilter =
            savedFilter;

    }


    /* -----------------------------------------
       FILTER STUDENTS
       ----------------------------------------- */

    const list =
        students.filter(
            function(student) {


                /* =============================
                   SEARCH MATCH
                   ============================= */

                const text = (

                    String(
                        student.name ||
                        ""
                    ) +

                    " " +

                    String(
                        student.id ||
                        ""
                    ) +

                    " " +

                    String(
                        student.email ||
                        ""
                    ) +

                    " " +

                    String(
                        student.phone ||
                        ""
                    ) +

                    " " +

                    String(
                        student.course ||
                        ""
                    ) +

                    " " +

                    String(
                        student.result ||
                        ""
                    )

                )
                    .toLowerCase();


                const searchMatch =
                    text.includes(
                        search
                    );


                /* =============================
                   RESULT MATCH
                   ============================= */

                const result =
                    String(
                        student.result ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const filter =
                    String(
                        studentFilter ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                let resultMatch =
                    true;


                if (
                    filter ===
                    "passed"
                ) {

                    resultMatch =
                        result ===
                        "passed";

                }


                if (
                    filter ===
                    "failed"
                ) {

                    resultMatch =
                        result ===
                        "failed";

                }


                return (
                    searchMatch &&
                    resultMatch
                );

            }
        );


    /* -----------------------------------------
       CLEAR TABLE
       ----------------------------------------- */

    table.innerHTML =
        "";


    /* -----------------------------------------
       EMPTY
       ----------------------------------------- */

    if (
        list.length ===
        0
    ) {

        empty.style.display =
            "block";


        if (
            studentFilter ===
            "Passed"
        ) {

            empty.textContent =
                "No Passed students found.";

        }

        else if (
            studentFilter ===
            "Failed"
        ) {

            empty.textContent =
                "No Failed students found.";

        }

        else {

            empty.textContent =
                "No student records found.";

        }


        return;

    }


    empty.style.display =
        "none";


    /* -----------------------------------------
       TABLE ROWS
       ----------------------------------------- */

    list.forEach(
        function(
            student,
            index
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            const isPassed =
                String(
                    student.result ||
                    ""
                )
                    .trim()
                    .toLowerCase()
                    ===
                "passed";


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <b>
                        ${safe(
                            student.name
                        )}
                    </b>

                    <br>

                    <small>
                        ${safe(
                            student.email
                        )}
                    </small>

                </td>


                <td>

                    ${safe(
                        student.id
                    )}

                </td>


                <td>

                    ${safe(
                        student.course
                    )}

                </td>


                <td>

                    <span
                        class="badge ${
                            isPassed
                                ? "pass"
                                : "fail"
                        }"
                    >

                        ${safe(
                            student.result
                        )}

                    </span>

                </td>


                <td>

                    <button
                        class="delete-btn"
                        data-delete="${safe(
                            student.key
                        )}"
                    >

                        Delete

                    </button>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    /* -----------------------------------------
       DELETE BUTTONS
       ----------------------------------------- */

    table
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const key =
                            button
                                .dataset
                                .delete;


                        if (
                            !confirm(
                                "Delete this student?"
                            )
                        ) {

                            return;

                        }


                        students =
                            students.filter(
                                function(student) {

                                    return (
                                        String(
                                            student.key
                                        ) !==
                                        String(
                                            key
                                        )
                                    );

                                }
                            );


                        saveStudents();


                        renderStudents();


                        updateDashboard();

                    }
                );

            }
        );

}


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
    $("searchInput");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            renderStudents();

        }
    );

}


/* =========================================================
   COURSES
   ========================================================= */

function renderCourses() {

    const grid =
        $("courseGrid");


    if (!grid) {
        return;
    }


    const courses = [

        [
            "B.Tech Computer Science",
            "💻",
            "Computer Science & Engineering"
        ],

        [
            "BCA",
            "🖥️",
            "Bachelor of Computer Applications"
        ],

        [
            "BBA",
            "📈",
            "Business Administration"
        ],

        [
            "Diploma CSE",
            "⚙️",
            "Diploma in Computer Science"
        ],

        [
            "B.Com",
            "💼",
            "Bachelor of Commerce"
        ],

        [
            "Other",
            "🎓",
            "Other Academic Programs"
        ]

    ];


    grid.innerHTML =
        "";


    courses.forEach(
        function(course) {

            const count =
                students.filter(
                    function(student) {

                        return (
                            student.course ===
                            course[0]
                        );

                    }
                ).length;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "course-card";


            card.innerHTML = `

                <div
                    class="course-icon"
                >

                    ${course[1]}

                </div>


                <h3>

                    ${safe(
                        course[0]
                    )}

                </h3>


                <p>

                    ${safe(
                        course[2]
                    )}

                </p>


                <p>

                    <b>
                        ${count}
                    </b>

                    registered students

                </p>

            `;


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        students.length;


    const passed =
        students.filter(
            function(student) {

                return (
                    String(
                        student.result ||
                        ""
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    "passed"
                );

            }
        ).length;


    const failed =
        students.filter(
            function(student) {

                return (
                    String(
                        student.result ||
                        ""
                    )
                        .trim()
                        .toLowerCase()
                        ===
                    "failed"
                );

            }
        ).length;


    const passedPercent =
        total === 0
            ? 0
            : Math.round(
                passed /
                total *
                100
            );


    const failedPercent =
        total === 0
            ? 0
            : Math.round(
                failed /
                total *
                100
            );


    if ($("passedBar")) {

        $("passedBar")
            .style
            .width =
            passedPercent +
            "%";

    }


    if ($("failedBar")) {

        $("failedBar")
            .style
            .width =
            failedPercent +
            "%";

    }


    if ($("passedPercent")) {

        $("passedPercent")
            .textContent =
            passedPercent +
            "%";

    }


    if ($("failedPercent")) {

        $("failedPercent")
            .textContent =
            failedPercent +
            "%";

    }


    if ($("statTotal")) {

        $("statTotal")
            .textContent =
            total;

    }


    if ($("statPassed")) {

        $("statPassed")
            .textContent =
            passed;

    }


    if ($("statFailed")) {

        $("statFailed")
            .textContent =
            failed;

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

const logout =
    $("logout");


if (logout) {

    logout.addEventListener(
        "click",
        function() {


            sessionStorage.removeItem(
                "studenthub_logged_in"
            );


            sessionStorage.removeItem(
                "studenthub_filter"
            );


            studentFilter =
                "";


            closeMenu();


            if ($("app")) {

                $("app")
                    .classList
                    .add("hidden");

            }


            if ($("loginPage")) {

                $("loginPage")
                    .classList
                    .remove("hidden");

            }


            if ($("userId")) {

                $("userId")
                    .value = "";

            }


            if ($("password")) {

                $("password")
                    .value = "";

            }

        }
    );

}


/* =========================================================
   START APP
   ========================================================= */

function startApp() {


    /* -----------------------------------------
       CHECK LOGIN
       ----------------------------------------- */

    if (
        sessionStorage.getItem(
            "studenthub_logged_in"
        ) ===
        "true"
    ) {

        if ($("loginPage")) {

            $("loginPage")
                .classList
                .add("hidden");

        }


        if ($("app")) {

            $("app")
                .classList
                .remove("hidden");

        }

    } else {

        if ($("loginPage")) {

            $("loginPage")
                .classList
                .remove("hidden");

        }


        if ($("app")) {

            $("app")
                .classList
                .add("hidden");

        }

    }


    /* -----------------------------------------
       SIDEBAR CLOSED
       ----------------------------------------- */

    closeMenu();


    /* -----------------------------------------
       UPDATE DASHBOARD
       ----------------------------------------- */

    updateDashboard();


    /* -----------------------------------------
       COURSES
       ----------------------------------------- */

    renderCourses();


    /* -----------------------------------------
       DASHBOARD CARDS
       ----------------------------------------- */

    setupDashboardCards();

}


/* =========================================================
   START
   ========================================================= */

startApp();

const firebaseConfig = {
  apiKey: "AIzaSyD5KEHL9H9jR8rzoUc9CLndpmrEQcuw23w",
  authDomain: "lg-management-ed8a2.firebaseapp.com",
  projectId: "lg-management-ed8a2",
  storageBucket: "lg-management-ed8a2.firebasestorage.app",
  messagingSenderId: "774955654860",
  appId: "1:774955654860:web:dcf07c5d5a19c0e3a4b7c1"
};
