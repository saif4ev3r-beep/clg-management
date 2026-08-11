/* =========================================================
   STUDENTHUB - FIREBASE JAVASCRIPT
   ========================================================= */

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
    apiKey: "AIzaSyD5KEHL9H9jR8rz0Uc9CLndpmrEQcuw23w",
    authDomain: "lg-management-ed8a2.firebaseapp.com",
    projectId: "lg-management-ed8a2",
    storageBucket: "lg-management-ed8a2.firebasestorage.app",
    messagingSenderId: "455533514999",
    appId: "1:455533514999:web:6b74d10745a6b25be183f2"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const $ = (id) => document.getElementById(id);


/* ================= STUDENTS ================= */

let students = [];


/* Firebase se students load karo */

async function loadStudents() {

    try {

        const snapshot = await db
            .collection("students")
            .get();

        students = [];

        snapshot.forEach((doc) => {

            students.push({
                key: doc.id,
                firebaseId: doc.id,
                ...doc.data()
            });

        });

        renderStudents();
        updateDashboard();

        console.log("Students loaded from Firebase:", students);

    } catch (error) {

        console.error("Firebase load error:", error);

        alert(
            "Firebase se data load nahi ho pa raha.\n\n" +
            "Console me error check karein."
        );

    }

}


/* ================= ACCOUNTS ================= */

let accounts = [];

try {

    accounts = JSON.parse(
        localStorage.getItem("studenthub_accounts") || "[]"
    );

    if (!Array.isArray(accounts)) {
        accounts = [];
    }

} catch {

    accounts = [];

}


function saveAccounts() {

    localStorage.setItem(
        "studenthub_accounts",
        JSON.stringify(accounts)
    );

}


/* ================= LOGIN / CREATE ================= */

const showLogin = $("showLogin");
const showCreate = $("showCreate");

const loginSection = $("loginSection");
const createSection = $("createSection");


function showLoginSection() {

    loginSection.style.display = "block";
    createSection.style.display = "none";

    showLogin.classList.add("active");
    showCreate.classList.remove("active");

}


function showCreateSection() {

    loginSection.style.display = "none";
    createSection.style.display = "block";

    showCreate.classList.add("active");
    showLogin.classList.remove("active");

}


showLogin.addEventListener(
    "click",
    showLoginSection
);


showCreate.addEventListener(
    "click",
    showCreateSection
);


/* ================= CREATE ACCOUNT ================= */

$("createAccountForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name =
            $("createName").value.trim();

        const email =
            $("createEmail").value.trim().toLowerCase();

        const password =
            $("createPassword").value.trim();

        const error =
            $("createError");


        if (!name || !email || !password) {

            error.className = "error";

            error.textContent =
                "Please fill all details.";

            return;

        }


        if (!email.includes("@")) {

            error.className = "error";

            error.textContent =
                "Enter a valid email.";

            return;

        }


        if (password.length < 4) {

            error.className = "error";

            error.textContent =
                "Password must be at least 4 characters.";

            return;

        }


        const exists =
            accounts.some(
                account =>
                    account.email === email
            );


        if (exists) {

            error.className = "error";

            error.textContent =
                "This account already exists.";

            return;

        }


     try {

    const userCredential =
        await firebase.auth().createUserWithEmailAndPassword(
            email,
            password
        );

    const user = userCredential.user;

    await db.collection("users").doc(user.uid).set({
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    });

    error.className = "success-message";

    error.textContent =
        "Account created successfully! 🎉";

} catch (firebaseError) {

    error.className = "error";

    error.textContent =
        firebaseError.message;

    return;
}


        error.className =
            "success-message";

        error.textContent =
            "Account created successfully! 🎉";


        setTimeout(
            function() {

                $("userId").value =
                    email;

                $("password").value =
                    password;

                $("createAccountForm").reset();

                error.textContent = "";

                showLoginSection();

            },
            900
        );

    }
);


/* ================= LOGIN ================= */

$("loginForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const user =
            $("userId")
                .value
                .trim()
                .toLowerCase();

        const password =
            $("password")
                .value
                .trim();

        const error =
            $("loginError");


      const admin =
    user === "admin" &&
    password === "1234";

if (!admin) {

    try {

        await firebase.auth()
            .signInWithEmailAndPassword(
                user,
                password
            );

    } catch (firebaseError) {

        error.textContent =
            "Invalid Email or Password.";

        return;
    }
}

        error.textContent = "";


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


        openPage("dashboard");

        loadStudents();

    }
);


/* ================= PASSWORD ================= */

$("togglePassword").addEventListener(
    "click",
    function() {

        const input =
            $("password");


        if (input.type === "password") {

            input.type = "text";

            this.textContent = "🙈";

        } else {

            input.type = "password";

            this.textContent = "👁";

        }

    }
);


/* ================= THREE DOT MENU ================= */

const menuBtn = $("menuBtn");
const sidebar = $("sidebar");
const overlay = $("overlay");


function openMenu() {

    sidebar.classList.add("open");

    overlay.classList.add("show");

}


function closeMenu() {

    sidebar.classList.remove("open");

    overlay.classList.remove("show");

}


menuBtn.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        if (
            sidebar.classList.contains("open")
        ) {

            closeMenu();

        } else {

            openMenu();

        }

    }
);


overlay.addEventListener(
    "click",
    closeMenu
);


document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeMenu();

        }

    }
);


/* ================= PAGE NAVIGATION ================= */

function openPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            pageElement => {

                pageElement.classList.remove(
                    "active"
                );

            }
        );


    const target = $(page);


    if (!target) {
        return;
    }


    target.classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page === page
                );

            }
        );


    const titles = {

        dashboard: [
            "Dashboard",
            "Manage your students easily."
        ],

        add: [
            "Add Student",
            "Create a new student record."
        ],

        records: [
            "Student Records",
            "View and manage all students."
        ],

        courses: [
            "Courses",
            "Active academic programs."
        ],

        statistics: [
            "Statistics",
            "Student performance overview."
        ],

        profile: [
            "Profile",
            "Student profile section."
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


    if (titles[page]) {

        $("pageTitle").textContent =
            titles[page][0];

        $("pageSubtitle").textContent =
            titles[page][1];

    }


    if (page === "records") {

        renderStudents();

    }


    if (page === "courses") {

        renderCourses();

    }


    if (page === "statistics") {

        updateStatistics();

    }


    updateDashboard();

    closeMenu();

}


/* ================= ALL PAGE BUTTONS ================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest("[data-page]");


        if (!button) {
            return;
        }


        openPage(
            button.dataset.page
        );

    }
);


/* =========================================================
   ADD STUDENT
   ========================================================= */

$("studentForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const student = {

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
                    .value,

            createdAt:
                new Date().toISOString()

        };


        /* Required fields */

        if (!student.name || !student.id) {

            alert(
                "Enter Student Name and Student ID."
            );

            return;

        }


        /* Duplicate ID Firebase me check karo */

        try {

            const duplicate =
                await db
                    .collection("students")
                    .where(
                        "id",
                        "==",
                        student.id
                    )
                    .get();


            if (!duplicate.empty) {

                alert(
                    "This Student ID already exists."
                );

                return;

            }


            /* Firebase me save */

            const docRef =
                await db
                    .collection("students")
                    .add(student);


            console.log(
                "Student saved to Firebase:",
                docRef.id
            );


            /* Form clear */

            this.reset();


            /* Firebase se fresh data lao */

            await loadStudents();


            alert(
                "Student added successfully! 🎉\n\n" +
                "Firebase me save ho gaya."
            );


            openPage("records");


        } catch (error) {

            console.error(
                "Firebase error:",
                error
            );


            alert(
                "Student Firebase me save nahi hua.\n\n" +
                "Error: " +
                error.message
            );

        }

    }
);


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        students.length;


    const passed =
        students.filter(
            student =>
                student.result === "Passed"
        ).length;


    const failed =
        students.filter(
            student =>
                student.result === "Failed"
        ).length;


    const courses =
        new Set(
            students
                .map(
                    student =>
                        student.course
                )
                .filter(Boolean)
        ).size;


    $("totalCount").textContent =
        total;


    $("passedCount").textContent =
        passed;


    $("failedCount").textContent =
        failed;


    $("courseCount").textContent =
        courses;


    updateStatistics();

}


/* ================= SAFE TEXT ================= */

function safe(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            char => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[char];

            }
        );

}


/* =========================================================
   RECORDS
   ========================================================= */

function renderStudents() {

    const table =
        $("studentTable");

    const empty =
        $("emptyRecords");

    const search =
        $("searchInput")
            .value
            .trim()
            .toLowerCase();


    const list =
        students.filter(
            student => {

                const text = (

                    (student.name || "") +
                    " " +
                    (student.id || "") +
                    " " +
                    (student.email || "") +
                    " " +
                    (student.course || "") +
                    " " +
                    (student.result || "")

                ).toLowerCase();


                return text.includes(search);

            }
        );


    table.innerHTML = "";


    if (list.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    list.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>

                    <b>
                        ${safe(student.name)}
                    </b>

                    <br>

                    <small>
                        ${safe(student.email)}
                    </small>

                </td>

                <td>
                    ${safe(student.id)}
                </td>

                <td>
                    ${safe(student.course)}
                </td>

                <td>

                    <span class="badge ${
                        student.result === "Passed"
                            ? "pass"
                            : "fail"
                    }">

                        ${safe(student.result)}

                    </span>

                </td>

                <td>

                    <button
                        class="delete-btn"
                        data-delete="${student.firebaseId}"
                    >
                        Delete
                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );


    document
        .querySelectorAll("[data-delete]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async function() {

                        if (
                            !confirm(
                                "Delete this student?"
                            )
                        ) {

                            return;

                        }


                        const documentId =
                            button.dataset.delete;


                        try {

                            await db
                                .collection("students")
                                .doc(documentId)
                                .delete();


                            await loadStudents();


                            alert(
                                "Student deleted successfully."
                            );


                        } catch (error) {

                            console.error(
                                "Delete error:",
                                error
                            );


                            alert(
                                "Student delete nahi hua.\n\n" +
                                error.message
                            );

                        }

                    }
                );

            }
        );

}


/* ================= SEARCH ================= */

$("searchInput").addEventListener(
    "input",
    renderStudents
);


/* =========================================================
   COURSES
   ========================================================= */

function renderCourses() {

    const grid =
        $("courseGrid");


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


    grid.innerHTML = "";


    courses.forEach(
        course => {

            const count =
                students.filter(
                    student =>
                        student.course ===
                        course[0]
                ).length;


            const card =
                document.createElement("div");


            card.className =
                "course-card";


            card.innerHTML = `

                <div class="course-icon">
                    ${course[1]}
                </div>

                <h3>
                    ${safe(course[0])}
                </h3>

                <p>
                    ${safe(course[2])}
                </p>

                <p>
                    <b>${count}</b>
                    registered students
                </p>

            `;


            grid.appendChild(card);

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
            student =>
                student.result === "Passed"
        ).length;


    const failed =
        students.filter(
            student =>
                student.result === "Failed"
        ).length;


    const passedPercent =
        total
            ? Math.round(
                (passed / total) * 100
            )
            : 0;


    const failedPercent =
        total
            ? Math.round(
                (failed / total) * 100
            )
            : 0;


    $("passedPercent").textContent =
        passedPercent + "%";


    $("failedPercent").textContent =
        failedPercent + "%";


    $("passedBar").style.width =
        passedPercent + "%";


    $("failedBar").style.width =
        failedPercent + "%";


    $("statTotal").textContent =
        total;


    $("statPassed").textContent =
        passed;


    $("statFailed").textContent =
        failed;

}


/* =========================================================
   LOGOUT
   ========================================================= */

$("logout").addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "studenthub_logged_in"
        );


        $("app")
            .classList
            .add("hidden");


        $("loginPage")
            .classList
            .remove("hidden");


        $("userId").value = "";

        $("password").value = "";


        showLoginSection();

        closeMenu();

    }
);


/* =========================================================
   INPUT VISIBILITY
   ========================================================= */

document
    .querySelectorAll(
        ".student-form input, .student-form select"
    )
    .forEach(
        function(field) {

            field.addEventListener(
                "input",
                function() {

                    this.style.color =
                        "#172033";

                    this.style.webkitTextFillColor =
                        "#172033";

                    this.style.backgroundColor =
                        "#ffffff";

                }
            );


            field.addEventListener(
                "change",
                function() {

                    this.style.color =
                        "#172033";

                    this.style.webkitTextFillColor =
                        "#172033";

                    this.style.backgroundColor =
                        "#ffffff";

                }
            );

        }
    );


/* =========================================================
   START APP
   ========================================================= */

async function startApp() {

    updateDashboard();

    renderCourses();

    closeMenu();


    if (
        sessionStorage.getItem(
            "studenthub_logged_in"
        ) === "true"
    ) {

        $("loginPage")
            .classList
            .add("hidden");


        $("app")
            .classList
            .remove("hidden");


        openPage("dashboard");


        /* Firebase se data load */

        await loadStudents();


    } else {

        $("loginPage")
            .classList
            .remove("hidden");


        $("app")
            .classList
            .add("hidden");


        showLoginSection();

    }

}

