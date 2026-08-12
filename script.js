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


      return text.includes(search);
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
