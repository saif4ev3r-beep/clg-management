/* =========================================================
   STUDENTHUB - CLEAN WORKING FIREBASE VERSION
   ========================================================= */

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyD5KEHL9H9jR8rzoUc9CLndpmrEQcuw23w",
  authDomain: "lg-management-ed8a2.firebaseapp.com",
  projectId: "lg-management-ed8a2",
  storageBucket: "lg-management-ed8a2.firebasestorage.app",
  messagingSenderId: "455533514999",
  appId: "1:455533514999:web:6b74d10745a6b25be183f2",
  measurementId: "G-04ZF1TVPN8"
};


/* ================= FIREBASE START ================= */

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


/* ================= ADMIN ================= */

const ADMIN_EMAIL = "ansarisaifulansari004@gmail.com";

let currentRole = "Student";
let currentProfile = null;
let students = [];


/* ================= HELPER ================= */

const $ = (id) => document.getElementById(id);

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function showMessage(id, text, type = "") {
  const el = $(id);

  if (!el) return;

  el.className = "message " + type;
  el.textContent = text || "";
}


/* ================= ROLE CHECK ================= */

function isAdmin() {
  const user = auth.currentUser;

  if (!user) return false;

  return (
    (user.email || "").toLowerCase() ===
    ADMIN_EMAIL.toLowerCase()
  );
}

function isTeacher() {
  return String(currentRole).toLowerCase() === "teacher";
}

function isStudent() {
  return String(currentRole).toLowerCase() === "student";
}


/* =========================================================
   LOGIN / CREATE / FORGOT
   ========================================================= */

function showLoginPage() {

  const app = $("app");
  const loginPage = $("loginPage");

  if (app) {
    app.classList.add("hidden");
  }

  if (loginPage) {
    loginPage.classList.remove("hidden");
  }

  showLoginSection();
}


function showLoginSection() {

  if ($("loginSection")) {
    $("loginSection").classList.remove("hidden-section");
  }

  if ($("createSection")) {
    $("createSection").classList.add("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection").classList.add("hidden-section");
  }

  if ($("showLogin")) {
    $("showLogin").classList.add("active");
  }

  if ($("showCreate")) {
    $("showCreate").classList.remove("active");
  }
}


function showCreateSection() {

  if ($("loginSection")) {
    $("loginSection").classList.add("hidden-section");
  }

  if ($("createSection")) {
    $("createSection").classList.remove("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection").classList.add("hidden-section");
  }

  if ($("showCreate")) {
    $("showCreate").classList.add("active");
  }

  if ($("showLogin")) {
    $("showLogin").classList.remove("active");
  }
}


function showForgotSection() {

  if ($("loginSection")) {
    $("loginSection").classList.add("hidden-section");
  }

  if ($("createSection")) {
    $("createSection").classList.add("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection").classList.remove("hidden-section");
  }

  const loginEmail = $("userId");

  if (
    loginEmail &&
    $("resetEmail") &&
    loginEmail.value.trim()
  ) {
    $("resetEmail").value =
      loginEmail.value.trim();
  }

  showMessage("forgotMessage", "");
}


/* ================= PASSWORD SHOW / HIDE ================= */

function togglePassword() {

  const input = $("password");

  if (!input) return;

  if (input.type === "password") {

    input.type = "text";

    if ($("togglePassword")) {
      $("togglePassword").textContent = "🙈";
    }

  } else {

    input.type = "password";

    if ($("togglePassword")) {
      $("togglePassword").textContent = "👁";
    }
  }
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

async function forgotPassword(event) {
  event.preventDefault();

  const email = $("resetEmail").value.trim().toLowerCase();

  if (!email) {
    showMessage("forgotMessage", "Please enter your email.", "error");
    return;
  }

  showMessage(
    "forgotMessage",
    "Sending reset link...",
    "info"
  );

  try {
    const actionCodeSettings = {
      url: "https://saif4ev3r-beep.github.io/clg-management/",
      handleCodeInApp: false
    };

    await auth.sendPasswordResetEmail(
      email,
      actionCodeSettings
    );

    showMessage(
      "forgotMessage",
      "Reset link sent! Check your email inbox and spam folder.",
      "success"
    );

  } catch (error) {
    console.error("Password reset error:", error);

    let message = "Could not send reset link.";

    if (error.code === "auth/user-not-found") {
      message = "No account found with this email.";
    } else if (error.code === "auth/invalid-email") {
      message = "Please enter a valid email.";
    } else if (error.code === "auth/too-many-requests") {
      message = "Too many attempts. Please try again later.";
    } else if (error.code === "auth/unauthorized-continue-uri") {
      message = "Password reset domain is not authorized in Firebase.";
    }

    showMessage(
      "forgotMessage",
      message,
      "error"
    );
  }
}


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

async function createAccount(event) {

  event.preventDefault();

  const name =
    $("createName").value.trim();

  const email =
    $("createEmail").value
      .trim()
      .toLowerCase();

  const password =
    $("createPassword").value.trim();

  showMessage("createError", "");

  if (!name || !email || !password) {

    showMessage(
      "createError",
      "Please fill all details.",
      "error"
    );

    return;
  }

  if (password.length < 6) {

    showMessage(
      "createError",
      "Password must be at least 6 characters.",
      "error"
    );

    return;
  }

  showMessage(
    "createError",
    "Creating account...",
    "info"
  );

  try {

    const result =
      await auth.createUserWithEmailAndPassword(
        email,
        password
      );

    const user = result.user;

    /* Every normal created account starts as Student */

    await db
      .collection("users")
      .doc(user.uid)
      .set({

        name: name,
        email: email,
        role: "Student",

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });

    await user.updateProfile({
      displayName: name
    });

    showMessage(
      "createError",
      "Account created successfully! 🎉",
      "success"
    );

    setTimeout(function () {

      if ($("createAccountForm")) {
        $("createAccountForm").reset();
      }

      if ($("userId")) {
        $("userId").value = email;
      }

      if ($("password")) {
        $("password").value = "";
      }

      showLoginSection();

    }, 1000);

  } catch (error) {

    console.error(
      "Create account error:",
      error
    );

    let message =
      "Could not create account.";

    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      message =
        "This email is already registered.";

    } else if (
      error.code ===
      "auth/invalid-email"
    ) {

      message =
        "Please enter a valid email.";

    } else if (
      error.code ===
      "auth/weak-password"
    ) {

      message =
        "Password must be at least 6 characters.";

    } else if (
      error.code ===
      "auth/api-key-not-valid"
    ) {

      message =
        "Firebase API key is not valid. Check Firebase API key restrictions.";

    } else {

      message =
        error.message;
    }

    showMessage(
      "createError",
      message,
      "error"
    );
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(event) {

  event.preventDefault();

  const email =
    $("userId").value
      .trim()
      .toLowerCase();

  const password =
    $("password").value.trim();

  showMessage("loginError", "");

  if (!email || !password) {

    showMessage(
      "loginError",
      "Enter email and password.",
      "error"
    );

    return;
  }

  showMessage(
    "loginError",
    "Signing in...",
    "info"
  );

  try {

    const result =
      await auth.signInWithEmailAndPassword(
        email,
        password
      );

    const user = result.user;

    let name =
      user.displayName ||
      "Student User";

    let role = "Student";


    /* Load actual role from Firestore */

    try {

      const profile =
        await db
          .collection("users")
          .doc(user.uid)
          .get();

      if (profile.exists) {

        const data =
          profile.data();

        name =
          data.name ||
          name;

        role =
          data.role ||
          "Student";
      }

    } catch (profileError) {

      console.warn(
        "Profile read failed:",
        profileError
      );
    }


    /* Admin email is ALWAYS Admin */

    if (
      user.email &&
      user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

      role = "Admin";
    }


    currentRole = role;

    currentProfile = {
      uid: user.uid,
      email: user.email || "",
      name: name,
      role: role
    };


    /* Save role locally only for display.
       Security still uses Firebase user/email. */

    sessionStorage.setItem(
      "studenthub_role",
      role
    );


    showMessage(
      "loginError",
      ""
    );

    showApp(
      name,
      user.email,
      role
    );

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    let message =
      "Invalid email or password.";

    if (
      error.code ===
      "auth/user-not-found"
    ) {

      message =
        "Account not found.";

    } else if (
      error.code ===
      "auth/wrong-password"
    ) {

      message =
        "Wrong password.";

    } else if (
      error.code ===
      "auth/invalid-credential"
    ) {

      message =
        "Invalid email or password.";

    } else if (
      error.code ===
      "auth/too-many-requests"
    ) {

      message =
        "Too many attempts. Try again later.";

    } else if (
      error.code ===
      "auth/api-key-not-valid"
    ) {

      message =
        "Firebase API key is not valid.";

    } else {

      message =
        error.message;
    }

    showMessage(
      "loginError",
      message,
      "error"
    );
  }
}


/* =========================================================
   SHOW APP
   ========================================================= */

function showApp(
  userName = "User",
  email = "",
  role = "Student"
) {

  currentRole = role;

  if ($("currentUserName")) {
    $("currentUserName").textContent =
      userName || email || "User";
  }

  if ($("profileName")) {
    $("profileName").textContent =
      userName || "Student User";
  }

  if ($("profileEmail")) {
    $("profileEmail").textContent =
      email || "-";
  }

  if ($("profileRole")) {
    $("profileRole").textContent =
      role;
  }

  if ($("loginPage")) {
    $("loginPage").classList.add("hidden");
  }

  if ($("app")) {
    $("app").classList.remove("hidden");
  }

  updateRoleUI();

  openPage("dashboard");

  loadStudents();
}


/* =========================================================
   ROLE UI
   ========================================================= */

function updateRoleUI() {

  const admin = isAdmin();

  /* Hide/show Add Student menu */

  document
    .querySelectorAll('[data-page="add"]')
    .forEach(function (button) {

      button.style.display =
        admin ? "" : "none";
    });


  /* Hide/show Add Student page */

  if ($("add")) {

    $("add").style.display =
      admin ? "" : "none";
  }


  /* Hide/show delete buttons */

  document
    .querySelectorAll("[data-delete]")
    .forEach(function (button) {

      button.style.display =
        admin ? "" : "none";
    });
}


/* =========================================================
   PAGE NAVIGATION
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


function openPage(page) {

  /* ONLY ADMIN CAN OPEN ADD PAGE */

  if (
    page === "add" &&
    !isAdmin()
  ) {

    alert(
      "Only Admin can add students."
    );

    return;
  }


  document
    .querySelectorAll(".page")
    .forEach(function (section) {

      section.classList.remove("active");
    });


  const target = $(page);

  if (!target) return;

  target.classList.add("active");


  document
    .querySelectorAll(".nav-item")
    .forEach(function (button) {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );
    });


  if (pageTitles[page]) {

    if ($("pageTitle")) {

      $("pageTitle").textContent =
        pageTitles[page][0];
    }

    if ($("pageSubtitle")) {

      $("pageSubtitle").textContent =
        pageTitles[page][1];
    }
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


/* =========================================================
   MENU
   ========================================================= */

function openMenu() {

  if ($("sidebar")) {
    $("sidebar").classList.add("open");
  }

  if ($("overlay")) {
    $("overlay").classList.add("show");
  }
}


function closeMenu() {

  if ($("sidebar")) {
    $("sidebar").classList.remove("open");
  }

  if ($("overlay")) {
    $("overlay").classList.remove("show");
  }
}


/* =========================================================
   LOAD STUDENTS FROM FIRESTORE
   ========================================================= */

async function loadStudents() {

  try {

    const snapshot =
      await db
        .collection("students")
        .orderBy(
          "createdAt",
          "desc"
        )
        .get();

    students =
      snapshot.docs.map(function (doc) {

        return {
          firebaseId: doc.id,
          ...doc.data()
        };

      });


    renderStudents();

    updateDashboard();

    renderCourses();

  } catch (error) {

    console.error(
      "Firebase load error:",
      error
    );

    showMessage(
      "recordsStatus",
      "Firebase data load failed: " +
        error.message,
      "error"
    );
  }
}


/* =========================================================
   ADD STUDENT
   ========================================================= */

async function addStudent(event) {

  event.preventDefault();


  /* HARD CHECK */

  if (!isAdmin()) {

    alert(
      "Only Admin can add students."
    );

    return;
  }


  const name =
    $("studentName").value.trim();

  const id =
    $("studentId").value.trim();

  const email =
    $("studentEmail").value.trim();

  const phone =
    $("studentPhone").value.trim();

  const course =
    $("studentCourse").value;

  const result =
    $("studentResult").value;


  if (!name || !id) {

    alert(
      "Enter Student Name and Student ID."
    );

    return;
  }


  try {

    /* Check duplicate Student ID */

    const duplicate =
      await db
        .collection("students")
        .where(
          "id",
          "==",
          id
        )
        .limit(1)
        .get();


    if (!duplicate.empty) {

      alert(
        "This Student ID already exists."
      );

      return;
    }


    /* Save to Firestore */

    await db
      .collection("students")
      .add({

        name: name,

        id: id,

        email: email,

        phone: phone,

        course: course,

        result: result,

        createdBy:
          auth.currentUser
            ? auth.currentUser.uid
            : null,

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });


    if ($("studentForm")) {
      $("studentForm").reset();
    }


    await loadStudents();


    alert(
      "Student added successfully! 🎉\n\nData successfully saved."
    );


    openPage("records");

  } catch (error) {

    console.error(
      "Add student error:",
      error
    );

    alert(
      "Student Firebase me save nahi hua.\n\n" +
        error.message
    );
  }
}


/* =========================================================
   RENDER STUDENTS
   ========================================================= */

function renderStudents() {

  const table =
    $("studentTable");

  const empty =
    $("emptyRecords");

  if (!table) return;


  const searchInput =
    $("searchInput");

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


const filter =
    sessionStorage.getItem("studenthub_filter") || "";

const list =
    students.filter(function (student) {

        const text = [
            student.name,
            student.id,
            student.email,
            student.phone,
            student.course,
            student.result
        ]
            .join(" ")
            .toLowerCase();

        const searchMatch =
            text.includes(search);

        const resultMatch =
            !filter ||
            String(student.result).toLowerCase() ===
            filter.toLowerCase();

        return searchMatch && resultMatch;
    });

  table.innerHTML = "";


  if (list.length === 0) {

    if (empty) {
      empty.style.display = "block";
    }

    return;
  }


  if (empty) {
    empty.style.display = "none";
  }


  list.forEach(function (student, index) {

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

        ${
          isAdmin()
            ? `
              <button
                class="delete-btn"
                data-delete="${safe(student.firebaseId)}"
              >
                Delete
              </button>
            `
            : ""
        }

      </td>

    `;


    table.appendChild(row);
  });


  /* DELETE BUTTONS */

  document
    .querySelectorAll("[data-delete]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        async function () {

          if (!isAdmin()) {

            alert(
              "Only Admin can delete students."
            );

            return;
          }


          const id =
            button.dataset.delete;


          if (
            !confirm(
              "Delete this student permanently?"
            )
          ) {
            return;
          }


          try {

            await db
              .collection("students")
              .doc(id)
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
              "Delete failed.\n\n" +
                error.message
            );
          }
        }
      );

    });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const total =
    students.length;


  const passed =
    students.filter(function (student) {

      return student.result === "Passed";

    }).length;


  const failed =
    students.filter(function (student) {

      return student.result === "Failed";

    }).length;


  const courses =
    new Set(

      students
        .map(function (student) {

          return student.course;

        })
        .filter(Boolean)

    ).size;


  if ($("totalCount")) {
    $("totalCount").textContent =
      total;
  }

  if ($("passedCount")) {
    $("passedCount").textContent =
      passed;
  }

  if ($("failedCount")) {
    $("failedCount").textContent =
      failed;
  }

  if ($("courseCount")) {
    $("courseCount").textContent =
      courses;
  }


  updateStatistics();
}


/* =========================================================
   COURSES
   ========================================================= */

function renderCourses() {

  const grid =
    $("courseGrid");

  if (!grid) return;


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


  courses.forEach(function (
    course
  ) {

    const name =
      course[0];

    const icon =
      course[1];

    const description =
      course[2];


    const count =
      students.filter(function (
        student
      ) {

        return (
          student.course === name
        );

      }).length;


    const card =
      document.createElement("div");


    card.className =
      "course-card";


    card.innerHTML = `

      <div class="course-icon">
        ${icon}
      </div>

      <h3>
        ${safe(name)}
      </h3>

      <p>
        ${safe(description)}
      </p>

      <p>
        <b>${count}</b>
        registered students
      </p>

    `;


    grid.appendChild(card);
  });
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

  const total =
    students.length;


  const passed =
    students.filter(function (
      student
    ) {

      return student.result === "Passed";

    }).length;


  const failed =
    students.filter(function (
      student
    ) {

      return student.result === "Failed";

    }).length;


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


  if ($("passedPercent")) {

    $("passedPercent").textContent =
      passedPercent + "%";
  }


  if ($("failedPercent")) {

    $("failedPercent").textContent =
      failedPercent + "%";
  }


  if ($("passedBar")) {

    $("passedBar").style.width =
      passedPercent + "%";
  }


  if ($("failedBar")) {

    $("failedBar").style.width =
      failedPercent + "%";
  }


  if ($("statTotal")) {

    $("statTotal").textContent =
      total;
  }


  if ($("statPassed")) {

    $("statPassed").textContent =
      passed;
  }


  if ($("statFailed")) {

    $("statFailed").textContent =
      failed;
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  try {

    await auth.signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }


  currentRole = "Student";
  currentProfile = null;
  students = [];


  sessionStorage.removeItem(
    "studenthub_role"
  );


  if ($("loginForm")) {
    $("loginForm").reset();
  }

  if ($("forgotForm")) {
    $("forgotForm").reset();
  }


  showLoginPage();
}


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

auth.onAuthStateChanged(
  async function (user) {

    if (!user) {

      currentRole = "Student";
      currentProfile = null;

      showLoginPage();

      return;
    }


    let name =
      user.displayName ||
      "Student User";

    let role = "Student";


    try {

      const doc =
        await db
          .collection("users")
          .doc(user.uid)
          .get();


      if (doc.exists) {

        const data =
          doc.data();


        name =
          data.name ||
          name;


        role =
          data.role ||
          "Student";
      }

    } catch (error) {

      console.warn(
        "Could not load user profile:",
        error
      );
    }


    /* Admin email always wins */

    if (
      user.email &&
      user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

      role = "Admin";
    }


    currentRole = role;


    currentProfile = {

      uid: user.uid,

      email:
        user.email || "",

      name: name,

      role: role

    };


    sessionStorage.setItem(
      "studenthub_role",
      role
    );


    showApp(
      name,
      user.email,
      role
    );

  }
);


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function startStudentHub() {


  /* Login button */

  if ($("showLogin")) {

    $("showLogin")
      .addEventListener(
        "click",
        showLoginSection
      );
  }


  /* Create Account button */

  if ($("showCreate")) {

    $("showCreate")
      .addEventListener(
        "click",
        showCreateSection
      );
  }


  /* Forgot Password */

  if ($("forgotPasswordBtn")) {

    $("forgotPasswordBtn")
      .addEventListener(
        "click",
        showForgotSection
      );
  }


  /* Back to Login */

  if ($("backToLogin")) {

    $("backToLogin")
      .addEventListener(
        "click",
        showLoginSection
      );
  }


  /* Password eye */

  if ($("togglePassword")) {

    $("togglePassword")
      .addEventListener(
        "click",
        togglePassword
      );
  }


  /* Login form */

  if ($("loginForm")) {

    $("loginForm")
      .addEventListener(
        "submit",
        loginUser
      );
  }


  /* Create account form */

  if ($("createAccountForm")) {

    $("createAccountForm")
      .addEventListener(
        "submit",
        createAccount
      );
  }


  /* Forgot password form */

  if ($("forgotForm")) {

    $("forgotForm")
      .addEventListener(
        "submit",
        forgotPassword
      );
  }


  /* Add student */

  if ($("studentForm")) {

    $("studentForm")
      .addEventListener(
        "submit",
        addStudent
      );
  }


  /* Search */

  if ($("searchInput")) {

    $("searchInput")
      .addEventListener(
        "input",
        renderStudents
      );
  }


  /* Logout */

  if ($("logout")) {

    $("logout")
      .addEventListener(
        "click",
        logoutUser
      );
  }


  /* Sidebar menu */

  if ($("menuBtn")) {

    $("menuBtn")
      .addEventListener(
        "click",
        function () {

          if (
            $("sidebar").classList.contains(
              "open"
            )
          ) {

            closeMenu();

          } else {

            openMenu();
          }

        }
      );
  }


  /* Overlay */

  if ($("overlay")) {

    $("overlay")
      .addEventListener(
        "click",
        closeMenu
      );
  }


  /* Escape */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeMenu();
      }

    }
  );


  /* Sidebar navigation */

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-page]"
        );


      if (!button) return;


      openPage(
        button.dataset.page
      );

    }
  );


  /* Initial UI */

  renderCourses();
  updateDashboard();
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startStudentHub
  );

} else {

  startStudentHub();
}
/* =========================================================
   PASSWORD RESET FROM EMAIL LINK
   ========================================================= */

async function handlePasswordResetLink() {

  const params = new URLSearchParams(
    window.location.search
  );

  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  if (
    mode !== "resetPassword" ||
    !oobCode
  ) {
    return;
  }

  // Hide other sections
  if ($("loginSection")) {
    $("loginSection").classList.add("hidden-section");
  }

  if ($("createSection")) {
    $("createSection").classList.add("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection").classList.add("hidden-section");
  }

  if ($("resetSection")) {
    $("resetSection").classList.remove("hidden-section");
  }

  try {

    const email =
      await auth.verifyPasswordResetCode(oobCode);

    console.log(
      "Password reset for:",
      email
    );

  } catch (error) {

    console.error(
      "Reset code error:",
      error
    );

    showMessage(
      "resetMessage",
      "This reset link is expired or has already been used. Please request a new link.",
      "error"
    );

    if ($("resetForm")) {
      $("resetForm").style.display = "none";
    }

    return;
  }


  if ($("resetForm")) {

    $("resetForm").addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();

        const newPassword =
          $("newPassword").value.trim();

        const confirmPassword =
          $("confirmPassword").value.trim();


        if (newPassword.length < 6) {

          showMessage(
            "resetMessage",
            "Password must be at least 6 characters.",
            "error"
          );

          return;
        }


        if (
          newPassword !==
          confirmPassword
        ) {

          showMessage(
            "resetMessage",
            "Passwords do not match.",
            "error"
          );

          return;
        }


        try {

          showMessage(
            "resetMessage",
            "Updating password...",
            "info"
          );


          await auth.confirmPasswordReset(
            oobCode,
            newPassword
          );


          showMessage(
            "resetMessage",
            "Password updated successfully! You can now login.",
            "success"
          );


          setTimeout(
            function() {

              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );

              showLoginPage();

            },
            1500
          );


        } catch (error) {

          console.error(
            "Confirm password reset error:",
            error
          );

          showMessage(
            "resetMessage",
            "Could not update password. Please request a new reset link.",
            "error"
          );

        }

      }
    );

  }
}


/* Check reset link when app opens */
handlePasswordResetLink();

/* =========================================================
   STUDENTHUB - COURSES / ATTENDANCE / FEES / NOTICES
   FIREBASE ADMIN MANAGEMENT
   ========================================================= */

(function () {

  /* =========================================================
     COMMON HELPERS
     ========================================================= */

  function adminOnly() {
    if (!isAdmin()) {
      alert("Only Admin can perform this action.");
      return false;
    }
    return true;
  }

  function formatDate(value) {
    if (!value) return "-";

    try {
      if (value.toDate) {
        return value.toDate().toLocaleDateString("en-IN");
      }

      return new Date(value).toLocaleDateString("en-IN");
    } catch (e) {
      return String(value);
    }
  }

  function numberValue(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }


  /* =========================================================
     COURSES
     ========================================================= */

  let firebaseCourses = [];

  async function loadFirebaseCourses() {

    const grid = $("courseGrid");

    if (!grid) return;

    try {

      const snapshot = await db
        .collection("courses")
        .get();

      firebaseCourses = snapshot.docs.map(function (doc) {
        return {
          firebaseId: doc.id,
          ...doc.data()
        };
      });

      /*
       If courses collection is empty, keep the old courses
       already used by your StudentHub.
      */

      if (firebaseCourses.length === 0) {

        const defaultCourses = [
          {
            name: "B.Tech Computer Science",
            icon: "💻",
            description: "Computer Science & Engineering"
          },
          {
            name: "BCA",
            icon: "🖥️",
            description: "Bachelor of Computer Applications"
          },
          {
            name: "BBA",
            icon: "📈",
            description: "Business Administration"
          },
          {
            name: "Diploma CSE",
            icon: "⚙️",
            description: "Diploma in Computer Science"
          },
          {
            name: "B.Com",
            icon: "💼",
            description: "Bachelor of Commerce"
          },
          {
            name: "Other",
            icon: "🎓",
            description: "Other Academic Programs"
          }
        ];

        if (isAdmin()) {

          for (const course of defaultCourses) {

            await db
              .collection("courses")
              .add({
                name: course.name,
                icon: course.icon,
                description: course.description,
                createdAt:
                  firebase.firestore.FieldValue.serverTimestamp(),
                createdBy:
                  auth.currentUser
                    ? auth.currentUser.uid
                    : null
              });

          }

          const newSnapshot = await db
            .collection("courses")
            .get();

          firebaseCourses = newSnapshot.docs.map(function (doc) {
            return {
              firebaseId: doc.id,
              ...doc.data()
            };
          });

        } else {

          firebaseCourses = defaultCourses.map(function (course) {
            return {
              firebaseId: "",
              ...course
            };
          });

        }
      }

      renderFirebaseCourses();
      updateStudentCourseDropdown();

    } catch (error) {

      console.error(
        "Courses Firebase error:",
        error
      );

      grid.innerHTML = `
        <div class="box">
          <p style="color:#b91c1c;">
            Could not load courses from Firebase.
          </p>
          <small>${safe(error.message)}</small>
        </div>
      `;
    }
  }


  function renderFirebaseCourses() {

    const grid = $("courseGrid");

    if (!grid) return;

    grid.innerHTML = "";

    /*
      ADMIN ADD COURSE FORM
    */

    if (isAdmin()) {

      const adminBox =
        document.createElement("div");

      adminBox.style.cssText = `
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:18px;
        padding:20px;
        margin-bottom:20px;
      `;

      adminBox.innerHTML = `

        <h3 style="margin-top:0;">
          ➕ Add New Course
        </h3>

        <form id="firebaseCourseForm">

          <div style="
            display:grid;
            grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
          ">

            <input
              id="firebaseCourseName"
              type="text"
              placeholder="Course Name"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >

            <input
              id="firebaseCourseIcon"
              type="text"
              placeholder="Icon e.g. 💻"
              value="🎓"
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >

            <input
              id="firebaseCourseDescription"
              type="text"
              placeholder="Course Description"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >

          </div>

          <button
            type="submit"
            class="main-btn"
            style="margin-top:12px;"
          >
            ➕ Add Course
          </button>

        </form>
      `;

      grid.parentElement.insertBefore(
        adminBox,
        grid
      );

      const form =
        $("firebaseCourseForm");

      if (form) {

        form.addEventListener(
          "submit",
          addFirebaseCourse
        );

      }
    }


    /*
      COURSE CARDS
    */

    if (firebaseCourses.length === 0) {

      grid.innerHTML += `
        <div class="box">
          <p>No courses added yet.</p>
        </div>
      `;

      return;
    }


    firebaseCourses.forEach(function (course) {

      const count =
        students.filter(function (student) {

          return String(student.course || "")
            .toLowerCase() ===
            String(course.name || "")
              .toLowerCase();

        }).length;


      const card =
        document.createElement("div");

      card.className =
        "course-card";


      card.innerHTML = `

        <div class="course-icon">
          ${safe(course.icon || "🎓")}
        </div>

        <h3>
          ${safe(course.name)}
        </h3>

        <p>
          ${safe(course.description || "")}
        </p>

        <p>
          <b>${count}</b>
          registered students
        </p>

        ${
          isAdmin() && course.firebaseId
            ? `
              <button
                type="button"
                class="delete-btn"
                data-course-delete="${safe(course.firebaseId)}"
                style="margin-top:10px;"
              >
                Delete
              </button>
            `
            : ""
        }

      `;

      grid.appendChild(card);

    });


    /*
      DELETE COURSE
    */

    grid
      .querySelectorAll("[data-course-delete]")
      .forEach(function (button) {

        button.addEventListener(
          "click",
          async function () {

            if (!adminOnly()) return;

            const id =
              button.dataset.courseDelete;

            if (
              !confirm(
                "Delete this course?"
              )
            ) {
              return;
            }

            try {

              await db
                .collection("courses")
                .doc(id)
                .delete();

              alert(
                "Course deleted successfully."
              );

              await loadFirebaseCourses();

            } catch (error) {

              console.error(
                "Delete course error:",
                error
              );

              alert(
                "Course delete failed.\n\n" +
                error.message
              );
            }

          }
        );

      });

  }


  async function addFirebaseCourse(event) {

    event.preventDefault();

    if (!adminOnly()) return;

    const name =
      $("firebaseCourseName")
        .value
        .trim();

    const icon =
      $("firebaseCourseIcon")
        .value
        .trim() || "🎓";

    const description =
      $("firebaseCourseDescription")
        .value
        .trim();


    if (!name || !description) {

      alert(
        "Please enter Course Name and Description."
      );

      return;
    }


    try {

      /*
        Duplicate check
      */

      const duplicate =
        firebaseCourses.some(function (course) {

          return String(course.name)
            .toLowerCase() ===
            name.toLowerCase();

        });


      if (duplicate) {

        alert(
          "This course already exists."
        );

        return;
      }


      await db
        .collection("courses")
        .add({

          name: name,
          icon: icon,
          description: description,

          createdBy:
            auth.currentUser
              ? auth.currentUser.uid
              : null,

          createdAt:
            firebase.firestore.FieldValue
              .serverTimestamp()

        });


      alert(
        "Course added successfully! 🎉"
      );

      await loadFirebaseCourses();

    } catch (error) {

      console.error(
        "Add course error:",
        error
      );

      alert(
        "Course Firebase me save nahi hua.\n\n" +
        error.message
      );

    }

  }


  function updateStudentCourseDropdown() {

    const select =
      $("studentCourse");

    if (!select) return;

    if (
      !firebaseCourses ||
      firebaseCourses.length === 0
    ) {
      return;
    }


    const oldValue =
      select.value;


    select.innerHTML = `

      <option value="">
        Select Course
      </option>

    `;


    firebaseCourses.forEach(function (course) {

      const option =
        document.createElement("option");

      option.value =
        course.name;

      option.textContent =
        course.name;

      select.appendChild(option);

    });


    /*
      Keep previous selection if possible.
    */

    if (
      Array.from(select.options)
        .some(function (option) {
          return option.value === oldValue;
        })
    ) {

      select.value = oldValue;

    }

  }


  /* =========================================================
     ATTENDANCE
     ========================================================= */

  let attendanceRecords = [];


  async function loadAttendance() {

    try {

      const snapshot =
        await db
          .collection("attendance")
          .get();


      attendanceRecords =
        snapshot.docs.map(function (doc) {

          return {
            firebaseId: doc.id,
            ...doc.data()
          };

        });


      renderAttendance();

    } catch (error) {

      console.error(
        "Attendance load error:",
        error
      );

      const box =
        $("attendance");

      if (box) {

        const table =
          box.querySelector(".table-wrap");

        if (table) {

          table.innerHTML =
            `<p style="color:#b91c1c;">
              Attendance load failed:
              ${safe(error.message)}
            </p>`;

        }

      }

    }

  }


  function renderAttendance() {

    const section =
      $("attendance");

    if (!section) return;


    const box =
      section.querySelector(".box");

    if (!box) return;


    let adminPanel =
      $("firebaseAttendanceAdmin");


    if (!adminPanel && isAdmin()) {

      adminPanel =
        document.createElement("div");

      adminPanel.id =
        "firebaseAttendanceAdmin";

      adminPanel.style.cssText = `
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:18px;
        padding:20px;
        margin-bottom:20px;
      `;

      adminPanel.innerHTML = `

        <h3 style="margin-top:0;">
          ➕ Add Attendance
        </h3>

        <form id="firebaseAttendanceForm">

          <div style="
            display:grid;
            grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
          ">

            <select
              id="attendanceStudent"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >
              <option value="">
                Select Student
              </option>
            </select>


            <input
              id="attendanceSubject"
              type="text"
              placeholder="Subject"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >


            <input
              id="attendanceTotal"
              type="number"
              min="0"
              placeholder="Total Classes"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >


            <input
              id="attendancePresent"
              type="number"
              min="0"
              placeholder="Present Classes"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >


            <input
              id="attendanceDate"
              type="date"
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >

          </div>


          <button
            type="submit"
            class="main-btn"
            style="margin-top:12px;"
          >
            ➕ Save Attendance
          </button>

        </form>

      `;

      box.insertBefore(
        adminPanel,
        box.querySelector(".table-wrap")
      );


      $("firebaseAttendanceForm")
        .addEventListener(
          "submit",
          addAttendance
        );

    }


    updateAttendanceStudentList();


    /*
      Existing sample attendance table ko
      replace karke Firebase table banayenge.
    */

    let tableWrap =
      box.querySelector(
        "#firebaseAttendanceTableWrap"
      );


    if (!tableWrap) {

      tableWrap =
        document.createElement("div");

      tableWrap.id =
        "firebaseAttendanceTableWrap";

      tableWrap.className =
        "table-wrap";

      box.appendChild(tableWrap);

    }


    if (
      attendanceRecords.length === 0
    ) {

      tableWrap.innerHTML = `
        <p>
          No attendance records added yet.
        </p>
      `;

      return;
    }


    let html = `

      <table>

        <thead>

          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Total</th>
            <th>Present</th>
            <th>Attendance</th>
            <th>Date</th>
            ${
              isAdmin()
                ? "<th>Action</th>"
                : ""
            }
          </tr>

        </thead>

        <tbody>

    `;


    attendanceRecords.forEach(function (record) {

      const total =
        numberValue(record.total);

      const present =
        numberValue(record.present);

      const percent =
        total > 0
          ? Math.round(
              (present / total) * 100
            )
          : 0;


      html += `

        <tr>

          <td>
            <b>
              ${safe(record.studentName || record.studentId || "-")}
            </b>
          </td>

          <td>
            ${safe(record.subject || "-")}
          </td>

          <td>
            ${total}
          </td>

          <td>
            ${present}
          </td>

          <td>
            <span class="badge ${
              percent >= 75
                ? "pass"
                : "fail"
            }">
              ${percent}%
            </span>
          </td>

          <td>
            ${safe(formatDate(record.date))}
          </td>

          ${
            isAdmin()
              ? `
                <td>
                  <button
                    class="delete-btn"
                    data-attendance-delete="${safe(record.firebaseId)}"
                  >
                    Delete
                  </button>
                </td>
              `
              : ""
          }

        </tr>

      `;

    });


    html += `
        </tbody>
      </table>
    `;


    tableWrap.innerHTML =
      html;


    tableWrap
      .querySelectorAll(
        "[data-attendance-delete]"
      )
      .forEach(function (button) {

        button.addEventListener(
          "click",
          async function () {

            if (!adminOnly()) return;

            if (
              !confirm(
                "Delete this attendance record?"
              )
            ) {
              return;
            }

            try {

              await db
                .collection("attendance")
                .doc(
                  button.dataset
                    .attendanceDelete
                )
                .delete();


              await loadAttendance();

              alert(
                "Attendance deleted."
              );

            } catch (error) {

              alert(
                "Delete failed.\n\n" +
                error.message
              );

            }

          }
        );

      });

  }


  function updateAttendanceStudentList() {

    const select =
      $("attendanceStudent");

    if (!select) return;


    const oldValue =
      select.value;


    select.innerHTML = `
      <option value="">
        Select Student
      </option>
    `;


    students.forEach(function (student) {

      const option =
        document.createElement("option");

      option.value =
        student.firebaseId;

      option.textContent =
        student.name +
        " (" +
        student.id +
        ")";

      option.dataset.name =
        student.name;

      option.dataset.studentId =
        student.id;

      select.appendChild(option);

    });


    select.value =
      oldValue;

  }


  async function addAttendance(event) {

    event.preventDefault();

    if (!adminOnly()) return;


    const select =
      $("attendanceStudent");

    const selected =
      select.options[
        select.selectedIndex
      ];


    if (!selected || !selected.value) {

      alert(
        "Please select a student."
      );

      return;
    }


    const subject =
      $("attendanceSubject")
        .value
        .trim();


    const total =
      numberValue(
        $("attendanceTotal").value
      );


    const present =
      numberValue(
        $("attendancePresent").value
      );


    const date =
      $("attendanceDate").value;


    if (!subject || total <= 0) {

      alert(
        "Enter valid subject and total classes."
      );

      return;
    }


    if (present > total) {

      alert(
        "Present classes cannot be greater than total classes."
      );

      return;
    }


    const student =
      students.find(function (item) {

        return item.firebaseId ===
          selected.value;

      });


    try {

      await db
        .collection("attendance")
        .add({

          studentId:
            student
              ? student.id
              : selected.dataset.studentId,

          studentName:
            student
              ? student.name
              : selected.dataset.name,

          subject: subject,

          total: total,

          present: present,

          date: date || "",

          createdBy:
            auth.currentUser
              ? auth.currentUser.uid
              : null,

          createdAt:
            firebase.firestore.FieldValue
              .serverTimestamp()

        });


      $("firebaseAttendanceForm")
        .reset();


      alert(
        "Attendance saved successfully! 🎉"
      );


      await loadAttendance();

    } catch (error) {

      console.error(
        "Attendance save error:",
        error
      );

      alert(
        "Attendance Firebase me save nahi hua.\n\n" +
        error.message
      );

    }

  }


  /* =========================================================
     FEES
     ========================================================= */

  let feeRecords = [];


  async function loadFees() {

    try {

      const snapshot =
        await db
          .collection("fees")
          .get();


      feeRecords =
        snapshot.docs.map(function (doc) {

          return {
            firebaseId: doc.id,
            ...doc.data()
          };

        });


      renderFees();

    } catch (error) {

      console.error(
        "Fees load error:",
        error
      );

    }

  }


  function renderFees() {

    const section =
      $("fees");

    if (!section) return;


    const box =
      section.querySelector(".box");

    if (!box) return;


    let adminPanel =
      $("firebaseFeesAdmin");


    if (!adminPanel && isAdmin()) {

      adminPanel =
        document.createElement("div");

      adminPanel.id =
        "firebaseFeesAdmin";

      adminPanel.style.cssText = `
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:18px;
        padding:20px;
        margin-bottom:20px;
      `;

      adminPanel.innerHTML = `

        <h3 style="margin-top:0;">
          💰 Add Fee Record
        </h3>

        <form id="firebaseFeesForm">

          <div style="
            display:grid;
            grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
            gap:12px;
          ">

            <select
              id="feeStudent"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >
              <option value="">
                Select Student
              </option>
            </select>


            <input
              id="feeTotal"
              type="number"
              min="0"
              placeholder="Total Fees"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >


            <input
              id="feePaid"
              type="number"
              min="0"
              placeholder="Paid Amount"
              required
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >


            <input
              id="feeNextPayment"
              type="date"
              style="
                padding:12px;
                border:1px solid #cbd5e1;
                border-radius:10px;
              "
            >

          </div>


          <button
            type="submit"
            class="main-btn"
            style="margin-top:12px;"
          >
            💾 Save Fees
          </button>

        </form>

      `;


      box.insertBefore(
        adminPanel,
        box.querySelector(".fee-grid") ||
        box.firstChild
      );


      $("firebaseFeesForm")
        .addEventListener(
          "submit",
          addFee
        );

    }


    updateFeeStudentList();


    let tableWrap =
      $("firebaseFeesTableWrap");


    if (!tableWrap) {

      tableWrap =
        document.createElement("div");

      tableWrap.id =
        "firebaseFeesTableWrap";

      tableWrap.className =
        "table-wrap";

      box.appendChild(tableWrap);

    }


    if (feeRecords.length === 0) {

      tableWrap.innerHTML = `
        <p>
          No fee records added yet.
        </p>
      `;

      return;
    }


    let html = `

      <h3>
        💳 Student Fee Records
      </h3>

      <table>

        <thead>

          <tr>
            <th>Student</th>
            <th>Total Fees</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Next Payment</th>
            ${
              isAdmin()
                ? "<th>Action</th>"
                : ""
            }
          </tr>

        </thead>

        <tbody>

    `;


    feeRecords.forEach(function (fee) {

      const total =
        numberValue(fee.total);

      const paid =
        numberValue(fee.paid);

      const due =
        Math.max(
          0,
          total - paid
        );


      html += `

        <tr>

          <td>
            <b>
              ${safe(fee.studentName || "-")}
            </b>
            <br>
            <small>
              ${safe(fee.studentId || "")}
            </small>
          </td>

          <td>
            ₹${total.toLocaleString("en-IN")}
          </td>

          <td>
            ₹${paid.toLocaleString("en-IN")}
          </td>

          <td>
            <span class="badge ${
              due === 0
                ? "pass"
                : "fail"
            }">
              ₹${due.toLocaleString("en-IN")}
            </span>
          </td>

          <td>
            ${safe(formatDate(fee.nextPayment))}
          </td>

          ${
            isAdmin()
              ? `
                <td>
                  <button
                    class="delete-btn"
                    data-fee-delete="${safe(fee.firebaseId)}"
                  >
                    Delete
                  </button>
                </td>
              `
              : ""
          }

        </tr>

      `;

    });


    html += `
        </tbody>
      </table>
    `;


    tableWrap.innerHTML =
      html;


    tableWrap
      .querySelectorAll(
        "[data-fee-delete]"
      )
      .forEach(function (button) {

        button.addEventListener(
          "click",
          async function () {

            if (!adminOnly()) return;

            if (
              !confirm(
                "Delete this fee record?"
              )
            ) {
              return;
            }


            try {

              await db
                .collection("fees")
                .doc(
                  button.dataset.feeDelete
                )
                .delete();


              await loadFees();


              alert(
                "Fee record deleted."
              );

            } catch (error) {

              alert(
                "Delete failed.\n\n" +
                error.message
              );

            }

          }
        );

      });

  }


  function updateFeeStudentList() {

    const select =
      $("feeStudent");

    if (!select) return;


    const oldValue =
      select.value;


    select.innerHTML = `
      <option value="">
        Select Student
      </option>
    `;


    students.forEach(function (student) {

      const option =
        document.createElement("option");

      option.value =
        student.firebaseId;

      option.textContent =
        student.name +
        " (" +
        student.id +
        ")";

      select.appendChild(option);

    });


    select.value =
      oldValue;

  }


  async function addFee(event) {

    event.preventDefault();

    if (!adminOnly()) return;


    const select =
      $("feeStudent");

    const selected =
      select.options[
        select.selectedIndex
      ];


    if (!selected || !selected.value) {

      alert(
        "Please select a student."
      );

      return;
    }


    const total =
      numberValue(
        $("feeTotal").value
      );


    const paid =
      numberValue(
        $("feePaid").value
      );


    const nextPayment =
      $("feeNextPayment").value;


    if (total < 0 || paid < 0) {

      alert(
        "Fee amount cannot be negative."
      );

      return;
    }


    if (paid > total) {

      alert(
        "Paid amount cannot be greater than total fees."
      );

      return;
    }


    const student =
      students.find(function (item) {

        return item.firebaseId ===
          selected.value;

      });


    try {

      await db
        .collection("fees")
        .add({

          studentId:
            student
              ? student.id
              : "",

          studentName:
            student
              ? student.name
              : selected.textContent,

          total: total,

          paid: paid,

          due:
            Math.max(
              0,
              total - paid
            ),

          nextPayment:
            nextPayment || "",

          createdBy:
            auth.currentUser
              ? auth.currentUser.uid
              : null,

          createdAt:
            firebase.firestore.FieldValue
              .serverTimestamp()

        });


      $("firebaseFeesForm")
        .reset();


      alert(
        "Fees saved successfully! 🎉"
      );


      await loadFees();

    } catch (error) {

      console.error(
        "Fee save error:",
        error
      );

      alert(
        "Fees Firebase me save nahi hua.\n\n" +
        error.message
      );

    }

  }


  /* =========================================================
     NOTICES
     ========================================================= */

  let firebaseNotices = [];


  async function loadNotices() {

    try {

      const snapshot =
        await db
          .collection("notices")
          .get();


      firebaseNotices =
        snapshot.docs.map(function (doc) {

          return {
            firebaseId: doc.id,
            ...doc.data()
          };

        });


      renderFirebaseNotices();

    } catch (error) {

      console.error(
        "Notices load error:",
        error
      );

    }

  }


  function renderFirebaseNotices() {

    const section =
      $("notices");

    if (!section) return;


    const box =
      section.querySelector(".box");

    if (!box) return;


    let adminPanel =
      $("firebaseNoticesAdmin");


    if (!adminPanel && isAdmin()) {

      adminPanel =
        document.createElement("div");

      adminPanel.id =
        "firebaseNoticesAdmin";

      adminPanel.style.cssText = `
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:18px;
        padding:20px;
        margin-bottom:20px;
      `;

      adminPanel.innerHTML = `

        <h3 style="margin-top:0;">
          📢 Add New Notice
        </h3>

        <form id="firebaseNoticeForm">

          <input
            id="noticeTitle"
            type="text"
            placeholder="Notice Title"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:12px;
              border:1px solid #cbd5e1;
              border-radius:10px;
              margin-bottom:12px;
            "
          >


          <textarea
            id="noticeText"
            placeholder="Write notice..."
            required
            rows="4"
            style="
              width:100%;
              box-sizing:border-box;
              padding:12px;
              border:1px solid #cbd5e1;
              border-radius:10px;
              resize:vertical;
            "
          ></textarea>


          <button
            type="submit"
            class="main-btn"
            style="margin-top:12px;"
          >
            📢 Publish Notice
          </button>

        </form>

      `;


      box.insertBefore(
        adminPanel,
        box.querySelector(".notice-list") ||
        box.firstChild
      );


      $("firebaseNoticeForm")
        .addEventListener(
          "submit",
          addNotice
        );

    }


    let list =
      $("firebaseNoticeList");


    if (!list) {

      list =
        document.createElement("div");

      list.id =
        "firebaseNoticeList";

      list.className =
        "notice-list";

      box.appendChild(list);

    }


    list.innerHTML = "";


    if (firebaseNotices.length === 0) {

      list.innerHTML = `
        <div class="notice-card">
          <div class="notice-icon">📢</div>
          <div>
            <b>No notices available.</b>
            <p>New notices will appear here.</p>
          </div>
        </div>
      `;

      return;
    }


    firebaseNotices
      .sort(function (a, b) {

        const da =
          a.createdAt &&
          a.createdAt.toDate
            ? a.createdAt.toDate()
            : new Date(0);

        const dbb =
          b.createdAt &&
          b.createdAt.toDate
            ? b.createdAt.toDate()
            : new Date(0);

        return dbb - da;

      });


    firebaseNotices.forEach(function (notice) {

      const article =
        document.createElement("article");

      article.className =
        "notice-card";


      article.innerHTML = `

        <div class="notice-icon">
          📢
        </div>

        <div style="flex:1;">

          <span class="notice-date">
            ${safe(formatDate(notice.createdAt))}
          </span>

          <h3>
            ${safe(notice.title)}
          </h3>

          <p>
            ${safe(notice.text)}
          </p>

          ${
            isAdmin()
              ? `
                <button
                  class="delete-btn"
                  data-notice-delete="${safe(notice.firebaseId)}"
                >
                  Delete
                </button>
              `
              : ""
          }

        </div>

      `;


      list.appendChild(article);

    });


    list
      .querySelectorAll(
        "[data-notice-delete]"
      )
      .forEach(function (button) {

        button.addEventListener(
          "click",
          async function () {

            if (!adminOnly()) return;


            if (
              !confirm(
                "Delete this notice?"
              )
            ) {
              return;
            }


            try {

              await db
                .collection("notices")
                .doc(
                  button.dataset
                    .noticeDelete
                )
                .delete();


              await loadNotices();


              alert(
                "Notice deleted."
              );

            } catch (error) {

              alert(
                "Delete failed.\n\n" +
                error.message
              );

            }

          }
        );

      });

  }


  async function addNotice(event) {

    event.preventDefault();

    if (!adminOnly()) return;


    const title =
      $("noticeTitle")
        .value
        .trim();


    const text =
      $("noticeText")
        .value
        .trim();


    if (!title || !text) {

      alert(
        "Enter notice title and notice text."
      );

      return;
    }


    try {

      await db
        .collection("notices")
        .add({

          title: title,

          text: text,

          createdBy:
            auth.currentUser
              ? auth.currentUser.uid
              : null,

          createdAt:
            firebase.firestore.FieldValue
              .serverTimestamp()

        });


      $("firebaseNoticeForm")
        .reset();


      alert(
        "Notice published successfully! 🎉"
      );


      await loadNotices();

    } catch (error) {

      console.error(
        "Notice save error:",
        error
      );

      alert(
        "Notice Firebase me save nahi hua.\n\n" +
        error.message
      );

    }

  }


  /* =========================================================
     PAGE NAVIGATION HOOK
     ========================================================= */

  const originalOpenPage =
    window.openPage;


  window.openPage =
    function (page) {

      /*
        Run existing navigation first.
        This keeps your original StudentHub working.
      */

      originalOpenPage(page);


      if (page === "courses") {
        loadFirebaseCourses();
      }


      if (page === "attendance") {
        loadAttendance();
      }


      if (page === "fees") {
        loadFees();
      }


      if (page === "notices") {
        loadNotices();
      }

    };


  /* =========================================================
     WHEN STUDENTS LOAD
     ========================================================= */

  const originalLoadStudents =
    window.loadStudents;


  window.loadStudents =
    async function () {

      await originalLoadStudents();

      updateStudentCourseDropdown();
      updateAttendanceStudentList();
      updateFeeStudentList();

    };


  /* =========================================================
     ROLE CHANGE / LOGIN
     ========================================================= */

  function refreshManagementPages() {

    if ($("courses") &&
        $("courses").classList.contains("active")) {

      loadFirebaseCourses();

    }


    if ($("attendance") &&
        $("attendance").classList.contains("active")) {

      loadAttendance();

    }


    if ($("fees") &&
        $("fees").classList.contains("active")) {

      loadFees();

    }


    if ($("notices") &&
        $("notices").classList.contains("active")) {

      loadNotices();

    }

  }


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  setTimeout(function () {

    updateStudentCourseDropdown();

    updateAttendanceStudentList();

    updateFeeStudentList();

    if ($("courseGrid")) {
      loadFirebaseCourses();
    }

     /* =========================================================
   BACK BUTTON FOR INNER PAGES
   Student Records / Courses / Statistics / Attendance
   Fees / Notices
   ========================================================= */

function addBackButtons() {

    const pages = [
        "records",
        "courses",
        "statistics",
        "attendance",
        "fees",
        "notices"
    ];

    pages.forEach(function(pageId) {

        const page = document.getElementById(pageId);

        if (!page) return;

        // Agar button pehle se hai to dobara mat banao
        if (page.querySelector(".page-back-btn")) return;

        const box = page.querySelector(".box");

        if (!box) return;

        const backButton = document.createElement("button");

        backButton.className = "page-back-btn";
        backButton.type = "button";
        backButton.innerHTML = "← Back";

        backButton.addEventListener("click", function() {

            // Dashboard par wapas
            if (typeof openPage === "function") {
                openPage("dashboard");
            }

        });

        // Box ke sabse upar button lagao
        box.insertBefore(backButton, box.firstChild);

    });
}


/* =========================================================
   RUN BACK BUTTON SETUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function() {
    addBackButtons();
});


/* Agar app already loaded ho chuka ho */
setTimeout(function() {
    addBackButtons();
}, 500);

     /* =========================================================
   BACK BUTTON - ALL INNER PAGES
   ========================================================= */

function setupAllBackButtons() {

    const pageIds = [
        "profile",
        "records",
        "courses",
        "statistics",
        "attendance",
        "fees",
        "notices"
    ];

    pageIds.forEach(function(pageId) {

        const page = document.getElementById(pageId);

        if (!page) return;

        const box = page.querySelector(".box");

        if (!box) return;

        // Duplicate button na bane
        if (box.querySelector(".page-back-btn")) return;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "page-back-btn";
        button.innerHTML = "← Back to Dashboard";

        button.onclick = function() {

            if (typeof openPage === "function") {
                openPage("dashboard");
            }

        };

        box.insertBefore(button, box.firstChild);
    });
}


/* =========================================================
   RUN
   ========================================================= */

setupAllBackButtons();

document.addEventListener("DOMContentLoaded", function() {
    setupAllBackButtons();
});

setTimeout(function() {
    setupAllBackButtons();
}, 500);

setTimeout(function() {
    setupAllBackButtons();
}, 1500);
  }, 1000);


})();
