/* =========================================================
   STUDENTHUB - FIREBASE VERSION
   ADMIN + TEACHER + STUDENT
   DASHBOARD + STUDENTS + COURSES + ATTENDANCE + FEES + NOTICES
   ========================================================= */


/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyD5KEHL9H9jR8rzoUc9CLndpmrEQcuw23",
  authDomain: "lg-management-ed8a2.firebaseapp.com",
  projectId: "lg-management-ed8a2",
  storageBucket: "lg-management-ed8a2.firebasestorage.app",
  messagingSenderId: "455533514999",
  appId: "1:455533514999:web:6b74d10745a6b25be183f2",
  measurementId: "G-04ZF1TVPN8"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


/* ================= ADMIN ================= */

const ADMIN_EMAIL =
  "ansarisaifulansari004@gmail.com";


/* ================= GLOBAL VARIABLES ================= */

const $ = (id) =>
  document.getElementById(id);

let students = [];

let courses = [];

let attendanceRecords = [];

let feeRecords = [];

let notices = [];

let currentRole = "Student";

let currentProfile = null;

/*
   Dashboard se Student Records open karte waqt
   kaunsa filter laga hai:
   ""       = All
   Passed   = Passed only
   Failed   = Failed only
*/
let activeStudentFilter = "";


/* =========================================================
   HELPERS
   ========================================================= */

function safe(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    function (char) {

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


function showMessage(
  id,
  text,
  type = ""
) {

  const element = $(id);

  if (!element) {
    return;
  }

  element.className =
    "message " + type;

  element.textContent =
    text || "";

}


function formatDate(value) {

  if (!value) {
    return "";
  }

  try {

    const date =
      value.toDate
        ? value.toDate()
        : new Date(value);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  } catch (error) {

    return "";

  }

}


/* =========================================================
   ROLE FUNCTIONS
   ========================================================= */

function isAdmin() {

  const user =
    auth.currentUser;

  if (!user) {
    return false;
  }

  return (
    (
      user.email || ""
    ).toLowerCase() ===
    ADMIN_EMAIL.toLowerCase()
  ) ||
  String(currentRole)
    .toLowerCase() ===
    "admin";

}


function isTeacher() {

  return (
    String(currentRole)
      .toLowerCase() ===
    "teacher"
  );

}


function isStudent() {

  return (
    String(currentRole)
      .toLowerCase() ===
    "student"
  );

}


/* =========================================================
   LOGIN SECTION
   ========================================================= */

function showLoginPage() {

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

  showLoginSection();

}


function showLoginSection() {

  if ($("loginSection")) {
    $("loginSection")
      .classList
      .remove("hidden-section");
  }

  if ($("createSection")) {
    $("createSection")
      .classList
      .add("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection")
      .classList
      .add("hidden-section");
  }

  if ($("showLogin")) {
    $("showLogin")
      .classList
      .add("active");
  }

  if ($("showCreate")) {
    $("showCreate")
      .classList
      .remove("active");
  }

}


function showCreateSection() {

  if ($("loginSection")) {
    $("loginSection")
      .classList
      .add("hidden-section");
  }

  if ($("createSection")) {
    $("createSection")
      .classList
      .remove("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection")
      .classList
      .add("hidden-section");
  }

  if ($("showCreate")) {
    $("showCreate")
      .classList
      .add("active");
  }

  if ($("showLogin")) {
    $("showLogin")
      .classList
      .remove("active");
  }

}


function showForgotSection() {

  if ($("loginSection")) {
    $("loginSection")
      .classList
      .add("hidden-section");
  }

  if ($("createSection")) {
    $("createSection")
      .classList
      .add("hidden-section");
  }

  if ($("forgotSection")) {
    $("forgotSection")
      .classList
      .remove("hidden-section");
  }

  const typedEmail =
    $("userId")
      ? $("userId").value.trim()
      : "";

  if (
    typedEmail &&
    $("resetEmail")
  ) {

    $("resetEmail").value =
      typedEmail;

  }

  showMessage(
    "forgotMessage",
    ""
  );

}


/* =========================================================
   LOGIN / CREATE BUTTONS
   ========================================================= */

if ($("showLogin")) {

  $("showLogin")
    .addEventListener(
      "click",
      showLoginSection
    );

}


if ($("showCreate")) {

  $("showCreate")
    .addEventListener(
      "click",
      showCreateSection
    );

}


if ($("forgotPasswordBtn")) {

  $("forgotPasswordBtn")
    .addEventListener(
      "click",
      showForgotSection
    );

}


if ($("backToLogin")) {

  $("backToLogin")
    .addEventListener(
      "click",
      showLoginSection
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

if ($("togglePassword")) {

  $("togglePassword")
    .addEventListener(
      "click",
      function () {

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

          this.textContent =
            "🙈";

        } else {

          input.type =
            "password";

          this.textContent =
            "👁";

        }

      }
    );

}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

if ($("forgotForm")) {

  $("forgotForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const email =
          $("resetEmail")
            .value
            .trim()
            .toLowerCase();

        if (!email) {

          showMessage(
            "forgotMessage",
            "Please enter your email.",
            "error"
          );

          return;

        }

        showMessage(
          "forgotMessage",
          "Sending reset link...",
          "info"
        );

        try {

          await auth
            .sendPasswordResetEmail(
              email
            );

          showMessage(
            "forgotMessage",
            "Reset link sent! Check your email inbox/spam folder.",
            "success"
          );

        } catch (error) {

          console.error(
            "Password reset error:",
            error
          );

          let message =
            "Could not send reset link.";

          if (
            error.code ===
            "auth/user-not-found"
          ) {

            message =
              "No account found with this email.";

          }

          else if (
            error.code ===
            "auth/invalid-email"
          ) {

            message =
              "Please enter a valid email.";

          }

          else if (
            error.code ===
            "auth/too-many-requests"
          ) {

            message =
              "Too many attempts. Please try again later.";

          }

          else if (
            error.code ===
            "auth/operation-not-allowed"
          ) {

            message =
              "Password reset is not enabled in Firebase Authentication.";

          }

          showMessage(
            "forgotMessage",
            message,
            "error"
          );

        }

      }
    );

}


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

if ($("createAccountForm")) {

  $("createAccountForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const name =
          $("createName")
            .value
            .trim();

        const email =
          $("createEmail")
            .value
            .trim()
            .toLowerCase();

        const password =
          $("createPassword")
            .value
            .trim();

        if (
          !name ||
          !email ||
          !password
        ) {

          showMessage(
            "createError",
            "Please fill all details.",
            "error"
          );

          return;

        }

        if (
          password.length < 6
        ) {

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

          const credential =
            await auth
              .createUserWithEmailAndPassword(
                email,
                password
              );

          const user =
            credential.user;

          await db
            .collection("users")
            .doc(user.uid)
            .set({

              name:
                name,

              email:
                email,

              role:
                "Student",

              createdAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()

            });

          await user
            .updateProfile({
              displayName:
                name
            });

          showMessage(
            "createError",
            "Account created successfully! 🎉",
            "success"
          );

          setTimeout(
            async function () {

              $("createAccountForm")
                .reset();

              if ($("userId")) {

                $("userId").value =
                  email;

              }

              if ($("password")) {

                $("password").value =
                  "";

              }

              await auth.signOut();

              showLoginSection();

            },
            900
          );

        } catch (error) {

          console.error(
            "Create account error:",
            error
          );

          let message =
            error.message ||
            "Could not create account.";

          if (
            error.code ===
            "auth/email-already-in-use"
          ) {

            message =
              "This email is already registered.";

          }

          else if (
            error.code ===
            "auth/invalid-email"
          ) {

            message =
              "Please enter a valid email.";

          }

          else if (
            error.code ===
            "auth/weak-password"
          ) {

            message =
              "Password is too weak. Use at least 6 characters.";

          }

          showMessage(
            "createError",
            message,
            "error"
          );

        }

      }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

if ($("loginForm")) {

  $("loginForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const email =
          $("userId")
            .value
            .trim()
            .toLowerCase();

        const password =
          $("password")
            .value
            .trim();

        if (
          !email ||
          !password
        ) {

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

          const credential =
            await auth
              .signInWithEmailAndPassword(
                email,
                password
              );

          const user =
            credential.user;

          let name =
            user.displayName ||
            "Student User";

          let role =
            "Student";

          try {

            const profileDoc =
              await db
                .collection("users")
                .doc(user.uid)
                .get();

            if (
              profileDoc.exists
            ) {

              const data =
                profileDoc.data();

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

          if (
            user.email &&
            user.email
              .toLowerCase() ===
            ADMIN_EMAIL
              .toLowerCase()
          ) {

            role =
              "Admin";

          }

          currentRole =
            role;

          currentProfile = {

            uid:
              user.uid,

            email:
              user.email || "",

            name:
              name,

            role:
              role

          };

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

          }

          else if (
            error.code ===
            "auth/wrong-password"
          ) {

            message =
              "Wrong password.";

          }

          else if (
            error.code ===
            "auth/invalid-credential"
          ) {

            message =
              "Invalid email or password.";

          }

          else if (
            error.code ===
            "auth/too-many-requests"
          ) {

            message =
              "Too many attempts. Try again later.";

          }

          showMessage(
            "loginError",
            message,
            "error"
          );

        }

      }
    );

}


/* =========================================================
   SHOW APP
   ========================================================= */

function showApp(
  userName = "User",
  email = "",
  role = "Student"
) {

  currentRole =
    role || "Student";

  if ($("currentUserName")) {

    $("currentUserName")
      .textContent =
      userName ||
      email ||
      "User";

  }

  if ($("profileName")) {

    $("profileName")
      .textContent =
      userName ||
      "Student User";

  }

  if ($("profileEmail")) {

    $("profileEmail")
      .textContent =
      email ||
      "-";

  }

  if ($("profileRole")) {

    $("profileRole")
      .textContent =
      currentRole;

  }

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

  updateRoleUI();

  openPage(
    "dashboard"
  );

  loadAllData();

}


/* =========================================================
   ROLE UI
   ========================================================= */

function updateRoleUI() {

  const admin =
    isAdmin();

  document
    .querySelectorAll(
      '[data-page="add"]'
    )
    .forEach(
      function (button) {

        button.style.display =
          admin
            ? ""
            : "none";

      }
    );

  if ($("add")) {

    $("add").style.display =
      admin
        ? ""
        : "none";

  }

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      function (button) {

        button.style.display =
          admin
            ? ""
            : "none";

      }
    );

  renderAdminControls();

}


/* =========================================================
   MENU
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

}


if (menuBtn) {

  menuBtn
    .addEventListener(
      "click",
      function () {

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

  overlay
    .addEventListener(
      "click",
      closeMenu
    );

}


document
  .addEventListener(
    "keydown",
    function (event) {

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

const titles = {

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
    "Attendance records."
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
    .forEach(
      function (section) {

        section
          .classList
          .remove("active");

      }
    );


  const target =
    $(page);

  if (!target) {
    return;
  }


  target
    .classList
    .add("active");


  document
    .querySelectorAll(".nav-item")
    .forEach(
      function (button) {

        button
          .classList
          .toggle(
            "active",
            button.dataset.page ===
              page
          );

      }
    );


  if (
    titles[page]
  ) {

    if ($("pageTitle")) {

      $("pageTitle")
        .textContent =
        titles[page][0];

    }

    if ($("pageSubtitle")) {

      $("pageSubtitle")
        .textContent =
        titles[page][1];

    }

  }


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


  if (
    page ===
    "attendance"
  ) {

    renderAttendance();

  }


  if (
    page ===
    "fees"
  ) {

    renderFees();

  }


  if (
    page ===
    "notices"
  ) {

    renderNotices();

  }


  updateDashboard();

  closeMenu();

}


/* =========================================================
   NAVIGATION CLICK
   ========================================================= */

document
  .addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-page]"
        );

      if (!button) {
        return;
      }

      openPage(
        button.dataset.page
      );

    }
  );


/* =========================================================
   DASHBOARD STAT CARDS
   ========================================================= */

function setupDashboardCards() {

  const cards =
    document.querySelectorAll(
      ".stats-grid .stat-card"
    );

  if (
    cards.length <
    4
  ) {

    return;

  }


  cards.forEach(
    function (card) {

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


  /*
     TOTAL STUDENTS
     → ALL STUDENTS
  */

  cards[0].onclick =
    function () {

      activeStudentFilter =
        "";

      openPage(
        "records"
      );

    };


  /*
     PASSED
     → ONLY PASSED
  */

  cards[1].onclick =
    function () {

      activeStudentFilter =
        "Passed";

      openPage(
        "records"
      );

    };


  /*
     FAILED
     → ONLY FAILED
  */

  cards[2].onclick =
    function () {

      activeStudentFilter =
        "Failed";

      openPage(
        "records"
      );

    };


  /*
     COURSES
     → COURSES PAGE
  */

  cards[3].onclick =
    function () {

      openPage(
        "courses"
      );

    };


  cards.forEach(
    function (card) {

      card.onkeydown =
        function (event) {

          if (
            event.key ===
              "Enter" ||
            event.key ===
              " "
          ) {

            event.preventDefault();

            card.click();

          }

        };

    }
  );

}


/* =========================================================
   LOAD STUDENTS
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
      snapshot.docs.map(
        function (doc) {

          return {

            firebaseId:
              doc.id,

            ...doc.data()

          };

        }
      );


    renderStudents();

    updateDashboard();

  } catch (error) {

    console.error(
      "Firebase students load error:",
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

if ($("studentForm")) {

  $("studentForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        if (!isAdmin()) {

          alert(
            "Only Admin can add students."
          );

          return;

        }


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
              .value ||
            "Other",

          result:
            $("studentResult")
              .value ||
            "Passed",

          createdAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          createdBy:
            auth.currentUser
              ? auth.currentUser.uid
              : null

        };


        if (
          !student.name ||
          !student.id
        ) {

          alert(
            "Enter Student Name and Student ID."
          );

          return;

        }


        try {

          const duplicate =
            await db
              .collection("students")
              .where(
                "id",
                "==",
                student.id
              )
              .limit(1)
              .get();


          if (
            !duplicate.empty
          ) {

            alert(
              "This Student ID already exists."
            );

            return;

          }


          await db
            .collection("students")
            .add(
              student
            );


          this.reset();


          await loadStudents();


          alert(
            "Student added successfully! 🎉"
          );


          activeStudentFilter =
            "";

          openPage(
            "records"
          );

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
    );

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


  const searchInput =
    $("searchInput");


  const search =
    searchInput
      ? searchInput
          .value
          .trim()
          .toLowerCase()
      : "";


  const filter =
    String(
      activeStudentFilter ||
      ""
    )
      .trim()
      .toLowerCase();


  const list =
    students.filter(
      function (student) {

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
          text.includes(
            search
          );


        const result =
          String(
            student.result ||
            ""
          )
            .trim()
            .toLowerCase();


        const resultMatch =
          !filter ||
          result ===
            filter;


        return (
          searchMatch &&
          resultMatch
        );

      }
    );


  table.innerHTML =
    "";


  if (
    list.length ===
    0
  ) {

    empty.style.display =
      "block";

    empty.textContent =
      filter
        ? "No " +
          filter +
          " student records found."
        : "No student records found.";

    return;

  }


  empty.style.display =
    "none";


  list.forEach(
    function (
      student,
      index
    ) {

      const row =
        document.createElement(
          "tr"
        );


      const passed =
        String(
          student.result ||
          ""
        )
          .trim()
          .toLowerCase() ===
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
              passed
                ? "pass"
                : "fail"
            }"
          >

            ${safe(
              student.result ||
              ""
            )}

          </span>

        </td>

        <td>

          ${
            isAdmin()
              ? `
                <button
                  class="delete-btn"
                  data-delete="${safe(
                    student.firebaseId
                  )}"
                >
                  Delete
                </button>
              `
              : ""
          }

        </td>

      `;


      table.appendChild(
        row
      );

    }
  );


  table
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      function (button) {

        button
          .addEventListener(
            "click",
            async function () {

              if (
                !isAdmin()
              ) {

                alert(
                  "Only Admin can delete students."
                );

                return;

              }


              if (
                !confirm(
                  "Delete this student permanently?"
                )
              ) {

                return;

              }


              try {

                await db
                  .collection(
                    "students"
                  )
                  .doc(
                    button
                      .dataset
                      .delete
                  )
                  .delete();


                await loadStudents();

              } catch (error) {

                alert(
                  "Delete failed.\n\n" +
                    error.message
                );

              }

            }
          );

      }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

if ($("searchInput")) {

  $("searchInput")
    .addEventListener(
      "input",
      renderStudents
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
      function (student) {

        return (
          String(
            student.result ||
            ""
          )
            .trim()
            .toLowerCase() ===
          "passed"
        );

      }
    ).length;


  const failed =
    students.filter(
      function (student) {

        return (
          String(
            student.result ||
            ""
          )
            .trim()
            .toLowerCase() ===
          "failed"
        );

      }
    ).length;


  const courseCount =
    new Set(
      students
        .map(
          function (student) {
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
      courseCount;

  }


  updateStatistics();

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

  const total =
    students.length;


  const passed =
    students.filter(
      function (student) {

        return (
          String(
            student.result ||
            ""
          )
            .trim()
            .toLowerCase() ===
          "passed"
        );

      }
    ).length;


  const failed =
    students.filter(
      function (student) {

        return (
          String(
            student.result ||
            ""
          )
            .trim()
            .toLowerCase() ===
          "failed"
        );

      }
    ).length;


  const passedPercent =
    total
      ? Math.round(
          passed /
            total *
            100
        )
      : 0;


  const failedPercent =
    total
      ? Math.round(
          failed /
            total *
            100
        )
      : 0;


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
   DEFAULT COURSES
   ========================================================= */

const defaultCourses = [

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


/* =========================================================
   LOAD COURSES
   ========================================================= */

async function loadCourses() {

  try {

    const snapshot =
      await db
        .collection("courses")
        .orderBy(
          "createdAt",
          "asc"
        )
        .get();


    const customCourses =
      snapshot.docs.map(
        function (doc) {

          return {

            firebaseId:
              doc.id,

            ...doc.data()

          };

        }
      );


    const defaults =
      defaultCourses.map(
        function (course) {

          return {

            name:
              course[0],

            icon:
              course[1],

            description:
              course[2],

            firebaseId:
              "default-" +
              course[0]

          };

        }
      );


    const customNames =
      new Set(
        customCourses.map(
          function (course) {

            return course.name;

          }
        )
      );


    courses =
      defaults
        .filter(
          function (course) {

            return !customNames
              .has(
                course.name
              );

          }
        )
        .concat(
          customCourses
        );


    renderCourses();

    updateCourseSelect();

  } catch (error) {

    console.warn(
      "Courses load failed:",
      error
    );


    courses =
      defaultCourses.map(
        function (course) {

          return {

            name:
              course[0],

            icon:
              course[1],

            description:
              course[2],

            firebaseId:
              "default-" +
              course[0]

          };

        }
      );


    renderCourses();

    updateCourseSelect();

  }

}


/* =========================================================
   RENDER COURSES
   ========================================================= */

function renderCourses() {

  const grid =
    $("courseGrid");

  if (!grid) {
    return;
  }


  grid.innerHTML =
    "";


  courses.forEach(
    function (course) {

      const count =
        students.filter(
          function (student) {

            return (
              student.course ===
              course.name
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

        <div class="course-icon">

          ${safe(
            course.icon ||
            "🎓"
          )}

        </div>

        <h3>

          ${safe(
            course.name
          )}

        </h3>

        <p>

          ${safe(
            course.description ||
            "Academic program"
          )}

        </p>

        <p>

          <b>
            ${count}
          </b>

          registered students

        </p>

        ${
          isAdmin() &&
          !String(
            course.firebaseId
          ).startsWith(
            "default-"
          )

            ? `

              <button
                class="delete-btn"
                data-course-delete="${safe(
                  course.firebaseId
                )}"
              >
                Delete
              </button>

            `

            : ""
        }

      `;


      grid.appendChild(
        card
      );

    }
  );


  grid
    .querySelectorAll(
      "[data-course-delete]"
    )
    .forEach(
      function (button) {

        button
          .addEventListener(
            "click",
            async function () {

              if (
                !isAdmin()
              ) {

                return;

              }


              if (
                !confirm(
                  "Delete this course?"
                )
              ) {

                return;

              }


              try {

                await db
                  .collection(
                    "courses"
                  )
                  .doc(
                    button
                      .dataset
                      .courseDelete
                  )
                  .delete();


                await loadCourses();

              } catch (error) {

                alert(
                  "Course delete failed.\n\n" +
                    error.message
                );

              }

            }
          );

      }
    );

}


/* =========================================================
   UPDATE STUDENT COURSE SELECT
   ========================================================= */

function updateCourseSelect() {

  const select =
    $("studentCourse");

  if (
    !select ||
    !courses.length
  ) {

    return;

  }


  const current =
    select.value;


  select.innerHTML =
    courses
      .map(
        function (course) {

          return `

            <option
              value="${safe(
                course.name
              )}"
            >

              ${safe(
                course.name
              )}

            </option>

          `;

        }
      )
      .join("");


  if (
    courses.some(
      function (course) {

        return (
          course.name ===
          current
        );

      }
    )
  ) {

    select.value =
      current;

  }

}


/* =========================================================
   ADMIN FORM HELPER
   ========================================================= */

function addAdminForm(
  sectionId,
  html,
  submitHandler
) {

  const section =
    $(sectionId);

  if (
    !section ||
    !isAdmin()
  ) {

    return;

  }


  const box =
    section.querySelector(
      ".box"
    );

  if (!box) {
    return;
  }


  if (
    box.querySelector(
      ".admin-add-panel"
    )
  ) {

    return;

  }


  const panel =
    document.createElement(
      "div"
    );


  panel.className =
    "admin-add-panel box";


  panel.style.marginTop =
    "20px";


  panel.innerHTML =
    html;


  box.appendChild(
    panel
  );


  const form =
    panel.querySelector(
      "form"
    );


  if (form) {

    form.addEventListener(
      "submit",
      submitHandler
    );

  }

}


/* =========================================================
   ADMIN CONTROLS
   ========================================================= */

function renderAdminControls() {

  if (
    !isAdmin()
  ) {

    return;

  }


  /* ================= COURSE FORM ================= */

  addAdminForm(
    "courses",

    `

      <h3>
        Admin: Add Course
      </h3>

      <form
        id="adminCourseForm"
        class="student-form"
      >

        <div class="form-grid">

          <div>

            <label>
              Course Name
            </label>

            <input
              id="adminCourseName"
              required
              placeholder="e.g. MCA"
            >

          </div>


          <div>

            <label>
              Icon
            </label>

            <input
              id="adminCourseIcon"
              value="🎓"
              placeholder="🎓"
            >

          </div>


          <div
            style="grid-column:1/-1"
          >

            <label>
              Description
            </label>

            <input
              id="adminCourseDescription"
              required
              placeholder="Course description"
            >

          </div>

        </div>


        <button
          class="main-btn"
          type="submit"
        >

          + Add Course

        </button>

      </form>

    `,

    async function (event) {

      event.preventDefault();


      const name =
        $("adminCourseName")
          .value
          .trim();


      const icon =
        $("adminCourseIcon")
          .value
          .trim() ||
        "🎓";


      const description =
        $("adminCourseDescription")
          .value
          .trim();


      if (
        !name ||
        !description
      ) {

        return;

      }


      try {

        const duplicate =
          await db
            .collection(
              "courses"
            )
            .where(
              "name",
              "==",
              name
            )
            .limit(1)
            .get();


        if (
          !duplicate.empty
        ) {

          alert(
            "This course already exists."
          );

          return;

        }


        await db
          .collection(
            "courses"
          )
          .add({

            name:
              name,

            icon:
              icon,

            description:
              description,

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp(),

            createdBy:
              auth.currentUser.uid

          });


        event.target.reset();


        if (
          $("adminCourseIcon")
        ) {

          $("adminCourseIcon")
            .value =
            "🎓";

        }


        await loadCourses();


        alert(
          "Course added successfully!"
        );

      } catch (error) {

        alert(
          "Course save failed.\n\n" +
            error.message
        );

      }

    }

  );


  /* ================= ATTENDANCE FORM ================= */

  addAdminForm(
    "attendance",

    `

      <h3>
        Admin: Add Attendance
      </h3>

      <form
        id="adminAttendanceForm"
        class="student-form"
      >

        <div class="form-grid">

          <div>

            <label>
              Subject
            </label>

            <input
              id="attSubject"
              required
              placeholder="Subject name"
            >

          </div>


          <div>

            <label>
              Total Classes
            </label>

            <input
              id="attTotal"
              type="number"
              min="1"
              required
            >

          </div>


          <div>

            <label>
              Present
            </label>

            <input
              id="attPresent"
              type="number"
              min="0"
              required
            >

          </div>

        </div>


        <button
          class="main-btn"
          type="submit"
        >

          + Add Attendance

        </button>

      </form>

    `,

    async function (event) {

      event.preventDefault();


      const subject =
        $("attSubject")
          .value
          .trim();


      const total =
        Number(
          $("attTotal")
            .value
        );


      const present =
        Number(
          $("attPresent")
            .value
        );


      if (
        !subject ||
        !total ||
        present < 0 ||
        present > total
      ) {

        alert(
          "Enter valid attendance values."
        );

        return;

      }


      try {

        await db
          .collection(
            "attendance"
          )
          .add({

            subject:
              subject,

            total:
              total,

            present:
              present,

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp(),

            createdBy:
              auth.currentUser.uid

          });


        event.target.reset();


        await loadAttendance();


        alert(
          "Attendance added successfully!"
        );

      } catch (error) {

        alert(
          "Attendance save failed.\n\n" +
            error.message
        );

      }

    }

  );


  /* ================= FEES FORM ================= */

  addAdminForm(
    "fees",

    `

      <h3>
        Admin: Add Fee Record
      </h3>

      <form
        id="adminFeeForm"
        class="student-form"
      >

        <div class="form-grid">

          <div>

            <label>
              Total Fees
            </label>

            <input
              id="feeTotal"
              type="number"
              min="0"
              required
              placeholder="45000"
            >

          </div>


          <div>

            <label>
              Paid
            </label>

            <input
              id="feePaid"
              type="number"
              min="0"
              required
              placeholder="30000"
            >

          </div>


          <div>

            <label>
              Next Payment / Note
            </label>

            <input
              id="feeNote"
              required
              placeholder="15 Sep 2026"
            >

          </div>

        </div>


        <button
          class="main-btn"
          type="submit"
        >

          + Add Fee Record

        </button>

      </form>

    `,

    async function (event) {

      event.preventDefault();


      const total =
        Number(
          $("feeTotal")
            .value
        );


      const paid =
        Number(
          $("feePaid")
            .value
        );


      const note =
        $("feeNote")
          .value
          .trim();


      if (
        paid >
        total
      ) {

        alert(
          "Paid amount cannot be greater than total fees."
        );

        return;

      }


      try {

        await db
          .collection(
            "fees"
          )
          .add({

            total:
              total,

            paid:
              paid,

            note:
              note,

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp(),

            createdBy:
              auth.currentUser.uid

          });


        event.target.reset();


        await loadFees();


        alert(
          "Fee record added successfully!"
        );

      } catch (error) {

        alert(
          "Fee save failed.\n\n" +
            error.message
        );

      }

    }

  );


  /* ================= NOTICE FORM ================= */

  addAdminForm(
    "notices",

    `

      <h3>
        Admin: Add Notice
      </h3>

      <form
        id="adminNoticeForm"
        class="student-form"
      >

        <div class="form-grid">

          <div>

            <label>
              Title
            </label>

            <input
              id="noticeTitle"
              required
              placeholder="Notice title"
            >

          </div>


          <div>

            <label>
              Date
            </label>

            <input
              id="noticeDate"
              type="date"
              required
            >

          </div>


          <div>

            <label>
              Icon
            </label>

            <input
              id="noticeIcon"
              value="📢"
            >

          </div>


          <div
            style="grid-column:1/-1"
          >

            <label>
              Description
            </label>

            <textarea
              id="noticeDescription"
              required
              rows="3"
              placeholder="Notice details"
            ></textarea>

          </div>

        </div>


        <button
          class="main-btn"
          type="submit"
        >

          + Add Notice

        </button>

      </form>

    `,

    async function (event) {

      event.preventDefault();


      const title =
        $("noticeTitle")
          .value
          .trim();


      const date =
        $("noticeDate")
          .value;


      const icon =
        $("noticeIcon")
          .value
          .trim() ||
        "📢";


      const description =
        $("noticeDescription")
          .value
          .trim();


      if (
        !title ||
        !date ||
        !description
      ) {

        return;

      }


      try {

        await db
          .collection(
            "notices"
          )
          .add({

            title:
              title,

            date:
              date,

            icon:
              icon,

            description:
              description,

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp(),

            createdBy:
              auth.currentUser.uid

          });


        event.target.reset();


        if (
          $("noticeIcon")
        ) {

          $("noticeIcon")
            .value =
            "📢";

        }


        await loadNotices();


        alert(
          "Notice added successfully!"
        );

      } catch (error) {

        alert(
          "Notice save failed.\n\n" +
            error.message
        );

      }

    }

  );

}


/* =========================================================
   ATTENDANCE
   ========================================================= */

async function loadAttendance() {

  try {

    const snapshot =
      await db
        .collection(
          "attendance"
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .get();


    attendanceRecords =
      snapshot.docs.map(
        function (doc) {

          return {

            firebaseId:
              doc.id,

            ...doc.data()

          };

        }
      );


  } catch (error) {

    attendanceRecords =
      [];

    console.warn(
      "Attendance load failed:",
      error
    );

  }


  renderAttendance();

}


function renderAttendance() {

  const section =
    $("attendance");

  if (!section) {
    return;
  }


  const box =
    section.querySelector(
      ".box"
    );

  if (!box) {
    return;
  }


  let content =
    box.querySelector(
      ".dynamic-attendance"
    );


  if (!content) {

    content =
      document.createElement(
        "div"
      );

    content.className =
      "dynamic-attendance";

    const adminPanel =
      box.querySelector(
        ".admin-add-panel"
      );

    if (adminPanel) {

      box.insertBefore(
        content,
        adminPanel
      );

    } else {

      box.appendChild(
        content
      );

    }

  }


  const total =
    attendanceRecords.reduce(
      function (
        sum,
        record
      ) {

        return (
          sum +
          Number(
            record.total ||
            0
          )
        );

      },
      0
    );


  const present =
    attendanceRecords.reduce(
      function (
        sum,
        record
      ) {

        return (
          sum +
          Number(
            record.present ||
            0
          )
        );

      },
      0
    );


  const absent =
    Math.max(
      0,
      total -
        present
    );


  const percent =
    total
      ? Math.round(
          present /
            total *
            100
        )
      : 0;


  content.innerHTML = `

    <div
      class="attendance-summary"
    >

      <div
        class="attendance-circle"
      >

        <strong>
          ${percent}%
        </strong>

        <span>
          Overall
        </span>

      </div>


      <div
        class="attendance-metrics"
      >

        <div>

          <small>
            Total Classes
          </small>

          <strong>
            ${total}
          </strong>

        </div>


        <div>

          <small>
            Present
          </small>

          <strong>
            ${present}
          </strong>

        </div>


        <div>

          <small>
            Absent
          </small>

          <strong>
            ${absent}
          </strong>

        </div>

      </div>

    </div>


    <div class="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              Subject
            </th>

            <th>
              Total
            </th>

            <th>
              Present
            </th>

            <th>
              Attendance
            </th>

            ${
              isAdmin()
                ? "<th>Action</th>"
                : ""
            }

          </tr>

        </thead>


        <tbody>

          ${
            attendanceRecords
              .map(
                function (
                  record
                ) {

                  const p =
                    Number(
                      record.total
                    )
                      ? Math.round(
                          Number(
                            record.present
                          ) /
                          Number(
                            record.total
                          ) *
                          100
                        )
                      : 0;


                  return `

                    <tr>

                      <td>

                        <b>
                          ${safe(
                            record.subject
                          )}
                        </b>

                      </td>

                      <td>
                        ${Number(
                          record.total ||
                          0
                        )}
                      </td>

                      <td>
                        ${Number(
                          record.present ||
                          0
                        )}
                      </td>

                      <td>

                        <span
                          class="badge ${
                            p >= 75
                              ? "pass"
                              : "fail"
                          }"
                        >

                          ${p}%

                        </span>

                      </td>

                      ${
                        isAdmin()
                          ? `

                            <td>

                              <button
                                class="delete-btn"
                                data-att-delete="${safe(
                                  record.firebaseId
                                )}"
                              >

                                Delete

                              </button>

                            </td>

                          `
                          : ""
                      }

                    </tr>

                  `;

                }
              )
              .join("")
          }

        </tbody>

      </table>

    </div>

  `;


  content
    .querySelectorAll(
      "[data-att-delete]"
    )
    .forEach(
      function (button) {

        button
          .addEventListener(
            "click",
            async function () {

              if (
                !confirm(
                  "Delete this attendance record?"
                )
              ) {

                return;

              }


              try {

                await db
                  .collection(
                    "attendance"
                  )
                  .doc(
                    button
                      .dataset
                      .attDelete
                  )
                  .delete();


                await loadAttendance();

              } catch (error) {

                alert(
                  error.message
                );

              }

            }
          );

      }
    );

}


/* =========================================================
   FEES
   ========================================================= */

async function loadFees() {

  try {

    const snapshot =
      await db
        .collection(
          "fees"
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(20)
        .get();


    feeRecords =
      snapshot.docs.map(
        function (doc) {

          return {

            firebaseId:
              doc.id,

            ...doc.data()

          };

        }
      );


  } catch (error) {

    feeRecords =
      [];

    console.warn(
      "Fees load failed:",
      error
    );

  }


  renderFees();

}


function renderFees() {

  const section =
    $("fees");

  if (!section) {
    return;
  }


  const box =
    section.querySelector(
      ".box"
    );

  if (!box) {
    return;
  }


  let content =
    box.querySelector(
      ".dynamic-fees"
    );


  if (!content) {

    content =
      document.createElement(
        "div"
      );

    content.className =
      "dynamic-fees";


    const oldGrid =
      box.querySelector(
        ".fee-grid"
      );

    if (oldGrid) {
      oldGrid.remove();
    }


    const oldProgress =
      box.querySelector(
        ".fee-progress-box"
      );

    if (oldProgress) {
      oldProgress.remove();
    }


    box.appendChild(
      content
    );

  }


  const latest =
    feeRecords[0];


  if (!latest) {

    content.innerHTML =
      "<p>No fee record added yet.</p>";

    return;

  }


  const total =
    Number(
      latest.total ||
      0
    );


  const paid =
    Number(
      latest.paid ||
      0
    );


  const due =
    Math.max(
      0,
      total -
        paid
    );


  const percent =
    total
      ? Math.round(
          paid /
            total *
            100
        )
      : 0;


  content.innerHTML = `

    <div
      class="fee-grid"
    >

      <div
        class="fee-card total"
      >

        <span>
          💰 Total Fees
        </span>

        <strong>
          ₹${total.toLocaleString(
            "en-IN"
          )}
        </strong>

        <small>
          Latest record
        </small>

      </div>


      <div
        class="fee-card paid"
      >

        <span>
          ✅ Paid
        </span>

        <strong>
          ₹${paid.toLocaleString(
            "en-IN"
          )}
        </strong>

        <small>
          Payment received
        </small>

      </div>


      <div
        class="fee-card due"
      >

        <span>
          ⚠️ Due
        </span>

        <strong>
          ₹${due.toLocaleString(
            "en-IN"
          )}
        </strong>

        <small>
          ${safe(
            latest.note ||
            ""
          )}
        </small>

      </div>

    </div>


    <div
      class="fee-progress-box"
    >

      <div
        class="section-head"
      >

        <b>
          Payment Progress
        </b>

        <strong>
          ${percent}%
        </strong>

      </div>


      <div
        class="progress"
      >

        <div
          class="progress-fill fee-progress"
          style="width:${percent}%"
        ></div>

      </div>

    </div>


    ${
      feeRecords.length > 1
        ? `

          <h3
            style="margin-top:20px"
          >
            Previous Records
          </h3>


          <div
            class="table-wrap"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Due
                  </th>

                  ${
                    isAdmin()
                      ? "<th>Action</th>"
                      : ""
                  }

                </tr>

              </thead>


              <tbody>

                ${feeRecords
                  .slice(1)
                  .map(
                    function (
                      record
                    ) {

                      const rTotal =
                        Number(
                          record.total ||
                          0
                        );

                      const rPaid =
                        Number(
                          record.paid ||
                          0
                        );

                      const rDue =
                        Math.max(
                          0,
                          rTotal -
                            rPaid
                        );


                      return `

                        <tr>

                          <td>
                            ${safe(
                              formatDate(
                                record.createdAt
                              )
                            )}
                          </td>

                          <td>
                            ₹${rTotal.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            ₹${rPaid.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            ₹${rDue.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          ${
                            isAdmin()
                              ? `

                                <td>

                                  <button
                                    class="delete-btn"
                                    data-fee-delete="${safe(
                                      record.firebaseId
                                    )}"
                                  >

                                    Delete

                                  </button>

                                </td>

                              `
                              : ""
                          }

                        </tr>

                      `;

                    }
                  )
                  .join("")}

              </tbody>

            </table>

          </div>

        `
        : ""
    }

  `;


  content
    .querySelectorAll(
      "[data-fee-delete]"
    )
    .forEach(
      function (button) {

        button
          .addEventListener(
            "click",
            async function () {

              if (
                !confirm(
                  "Delete this fee record?"
                )
              ) {

                return;

              }


              try {

                await db
                  .collection(
                    "fees"
                  )
                  .doc(
                    button
                      .dataset
                      .feeDelete
                  )
                  .delete();


                await loadFees();

              } catch (error) {

                alert(
                  error.message
                );

              }

            }
          );

      }
    );

}


/* =========================================================
   NOTICES
   ========================================================= */

async function loadNotices() {

  try {

    const snapshot =
      await db
        .collection(
          "notices"
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .get();


    notices =
      snapshot.docs.map(
        function (doc) {

          return {

            firebaseId:
              doc.id,

            ...doc.data()

          };

        }
      );


  } catch (error) {

    notices =
      [];

    console.warn(
      "Notices load failed:",
      error
    );

  }


  renderNotices();

}


function renderNotices() {

  const section =
    $("notices");

  if (!section) {
    return;
  }


  const box =
    section.querySelector(
      ".box"
    );

  if (!box) {
    return;
  }


  let list =
    box.querySelector(
      ".dynamic-notice-list"
    );


  if (!list) {

    list =
      document.createElement(
        "div"
      );

    list.className =
      "dynamic-notice-list notice-list";


    const old =
      box.querySelector(
        ".notice-list"
      );

    if (old) {
      old.remove();
    }


    box.appendChild(
      list
    );

  }


  if (
    !notices.length
  ) {

    list.innerHTML =
      "<p>No notices added yet.</p>";

    return;

  }


  list.innerHTML =
    notices
      .map(
        function (notice) {

          return `

            <article
              class="notice-card"
            >

              <div
                class="notice-icon"
              >

                ${safe(
                  notice.icon ||
                  "📢"
                )}

              </div>


              <div
                style="flex:1"
              >

                <span
                  class="notice-date"
                >

                  ${safe(
                    notice.date ||
                    formatDate(
                      notice.createdAt
                    )
                  )}

                </span>


                <h3>

                  ${safe(
                    notice.title
                  )}

                </h3>


                <p>

                  ${safe(
                    notice.description
                  )}

                </p>


                ${
                  isAdmin()
                    ? `

                      <button
                        class="delete-btn"
                        data-notice-delete="${safe(
                          notice.firebaseId
                        )}"
                      >

                        Delete

                      </button>

                    `
                    : ""
                }

              </div>

            </article>

          `;

        }
      )
      .join("");


  list
    .querySelectorAll(
      "[data-notice-delete]"
    )
    .forEach(
      function (button) {

        button
          .addEventListener(
            "click",
            async function () {

              if (
                !confirm(
                  "Delete this notice?"
                )
              ) {

                return;

              }


              try {

                await db
                  .collection(
                    "notices"
                  )
                  .doc(
                    button
                      .dataset
                      .noticeDelete
                  )
                  .delete();


                await loadNotices();

              } catch (error) {

                alert(
                  error.message
                );

              }

            }
          );

      }
    );

}


/* =========================================================
   LOAD ALL DATA
   ========================================================= */

async function loadAllData() {

  await Promise.all([

    loadStudents(),

    loadCourses(),

    loadAttendance(),

    loadFees(),

    loadNotices()

  ]);


  setupDashboardCards();

  renderAdminControls();

  updateRoleUI();

}


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

auth.onAuthStateChanged(
  async function (user) {

    if (!user) {

      currentRole =
        "Student";

      currentProfile =
        null;

      showLoginPage();

      return;

    }


    let name =
      user.displayName ||
      "Student User";


    let role =
      "Student";


    try {

      const profileDoc =
        await db
          .collection(
            "users"
          )
          .doc(
            user.uid
          )
          .get();


      if (
        profileDoc.exists
      ) {

        const data =
          profileDoc.data();


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


    if (
      user.email &&
      user.email
        .toLowerCase() ===
      ADMIN_EMAIL
        .toLowerCase()
    ) {

      role =
        "Admin";

    }


    currentProfile = {

      uid:
        user.uid,

      email:
        user.email ||
        "",

      name:
        name,

      role:
        role

    };


    currentRole =
      role;


    showApp(
      name,
      user.email,
      role
    );

  }
);


/* =========================================================
   LOGOUT
   ========================================================= */

if ($("logout")) {

  $("logout")
    .addEventListener(
      "click",
      async function () {

        try {

          await auth
            .signOut();

        } catch (error) {

          console.error(
            "Logout error:",
            error
          );

        }


        currentRole =
          "Student";

        currentProfile =
          null;


        if ($("loginForm")) {

          $("loginForm")
            .reset();

        }


        if ($("forgotForm")) {

          $("forgotForm")
            .reset();

        }


        showLoginPage();

      }
    );

}


/* =========================================================
   INITIAL UI
   ========================================================= */

setupDashboardCards();

renderAdminControls();

updateDashboard();
