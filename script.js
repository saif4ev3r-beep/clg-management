/* =========================================================
   STUDENTHUB - WORKING FIREBASE VERSION
   ADMIN + TEACHER + STUDENT ROLE SYSTEM
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

/*
  This email is permanently treated as Admin.
  Other users get their role from Firestore.
*/

const ADMIN_EMAIL =
  "ansarisaifulansari004@gmail.com";


/* ================= GLOBAL VARIABLES ================= */

const $ = (id) =>
  document.getElementById(id);

let students = [];

let currentRole = "Student";

let currentProfile = null;


/* ================= ROLE FUNCTIONS ================= */

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
  String(currentRole).toLowerCase() ===
    "admin";
}


function isTeacher() {

  return (
    String(currentRole).toLowerCase() ===
    "teacher"
  );

}


function isStudent() {

  return (
    String(currentRole).toLowerCase() ===
    "student"
  );

}


/* ================= HELPERS ================= */

function showMessage(
  id,
  text,
  type = ""
) {

  const el = $(id);

  if (!el) {
    return;
  }

  el.className =
    "message " + type;

  el.textContent =
    text || "";

}


function safe(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
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

  $("currentUserName").textContent =
    userName ||
    email ||
    "User";

  $("profileName").textContent =
    userName ||
    "Student User";

  $("profileEmail").textContent =
    email ||
    "-";

  $("profileRole").textContent =
    currentRole;


  $("loginPage")
    .classList
    .add("hidden");

  $("app")
    .classList
    .remove("hidden");


  updateRoleUI();

  openPage("dashboard");

  loadStudents();

}


/* =========================================================
   ROLE UI
   ========================================================= */

function updateRoleUI() {

  const admin =
    isAdmin();


  /*
    All buttons having data-page="add"
    will be visible only to Admin.
  */

  document
    .querySelectorAll(
      '[data-page="add"]'
    )
    .forEach(
      (button) => {

        button.style.display =
          admin ? "" : "none";

      }
    );


  /*
    Add Student page itself
    is also Admin-only.
  */

  const addPage =
    $("add");

  if (addPage) {

    addPage.style.display =
      admin ? "" : "none";

  }


  /*
    Delete buttons are Admin-only.
  */

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      (button) => {

        button.style.display =
          admin ? "" : "none";

      }
    );

}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLoginPage() {

  $("app")
    .classList
    .add("hidden");

  $("loginPage")
    .classList
    .remove("hidden");

  showLoginSection();

}


/* =========================================================
   LOGIN SECTION
   ========================================================= */

function showLoginSection() {

  $("loginSection")
    .classList
    .remove("hidden-section");

  $("createSection")
    .classList
    .add("hidden-section");

  $("forgotSection")
    .classList
    .add("hidden-section");

  $("showLogin")
    .classList
    .add("active");

  $("showCreate")
    .classList
    .remove("active");

}


/* =========================================================
   CREATE SECTION
   ========================================================= */

function showCreateSection() {

  $("loginSection")
    .classList
    .add("hidden-section");

  $("createSection")
    .classList
    .remove("hidden-section");

  $("forgotSection")
    .classList
    .add("hidden-section");

  $("showCreate")
    .classList
    .add("active");

  $("showLogin")
    .classList
    .remove("active");

}


/* =========================================================
   FORGOT SECTION
   ========================================================= */

function showForgotSection() {

  $("loginSection")
    .classList
    .add("hidden-section");

  $("createSection")
    .classList
    .add("hidden-section");

  $("forgotSection")
    .classList
    .remove("hidden-section");


  const typedEmail =
    $("userId")
      .value
      .trim();

  if (typedEmail) {

    $("resetEmail").value =
      typedEmail;

  }


  showMessage(
    "forgotMessage",
    ""
  );

}


/* =========================================================
   LOGIN / CREATE TABS
   ========================================================= */

$("showLogin")
  .addEventListener(
    "click",
    showLoginSection
  );


$("showCreate")
  .addEventListener(
    "click",
    showCreateSection
  );


$("forgotPasswordBtn")
  .addEventListener(
    "click",
    showForgotSection
  );


$("backToLogin")
  .addEventListener(
    "click",
    showLoginSection
  );


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

$("togglePassword")
  .addEventListener(
    "click",
    function () {

      const input =
        $("password");

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


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

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


        let msg =
          "Could not send reset link.";


        if (
          error.code ===
          "auth/user-not-found"
        ) {

          msg =
            "No account found with this email.";

        }


        else if (
          error.code ===
          "auth/invalid-email"
        ) {

          msg =
            "Please enter a valid email.";

        }


        else if (
          error.code ===
          "auth/too-many-requests"
        ) {

          msg =
            "Too many attempts. Please try again later.";

        }


        else if (
          error.code ===
          "auth/operation-not-allowed"
        ) {

          msg =
            "Password reset is not enabled in Firebase Authentication.";

        }


        showMessage(
          "forgotMessage",
          msg,
          "error"
        );

      }

    }
  );


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

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


      showMessage(
        "createError",
        ""
      );


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


        /*
          Every newly created account
          starts as Student.
          
          Admin/Teacher roles will be
          assigned separately by Admin.
        */

        await db
          .collection("users")
          .doc(user.uid)
          .set({

            name: name,

            email: email,

            role: "Student",

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
          () => {

            $("createAccountForm")
              .reset();

            $("userId").value =
              email;

            $("password").value =
              "";

            showLoginSection();

          },
          1000
        );


      } catch (error) {

        console.error(
          "Create account error:",
          error
        );


        let msg =
          error.message;


        if (
          error.code ===
          "auth/email-already-in-use"
        ) {

          msg =
            "This email is already registered.";

        }


        else if (
          error.code ===
          "auth/invalid-email"
        ) {

          msg =
            "Please enter a valid email.";

        }


        else if (
          error.code ===
          "auth/weak-password"
        ) {

          msg =
            "Password is too weak. Use at least 6 characters.";

        }


        showMessage(
          "createError",
          msg,
          "error"
        );

      }

    }
  );


/* =========================================================
   LOGIN
   ========================================================= */

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


      /*
        IMPORTANT:
        We DO NOT trust the role dropdown.

        Real role comes from:
        Firestore -> users -> UID -> role
      */


      showMessage(
        "loginError",
        ""
      );


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


        /*
          Get actual role
          from Firestore.
        */

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

        } catch (
          profileError
        ) {

          console.warn(
            "Profile read failed:",
            profileError
          );

        }


        /*
          Main Admin email is ALWAYS Admin.
        */

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


        let msg =
          "Invalid email or password.";


        if (
          error.code ===
          "auth/user-not-found"
        ) {

          msg =
            "Account not found.";

        }


        if (
          error.code ===
          "auth/wrong-password"
        ) {

          msg =
            "Wrong password.";

        }


        if (
          error.code ===
          "auth/invalid-credential"
        ) {

          msg =
            "Invalid email or password.";

        }


        if (
          error.code ===
          "auth/too-many-requests"
        ) {

          msg =
            "Too many attempts. Try again later.";

        }


        showMessage(
          "loginError",
          msg,
          "error"
        );

      }

    }
  );


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

auth.onAuthStateChanged(
  async (user) => {

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


    /*
      Main Admin account
      always remains Admin.
    */

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
        user.email || "",

      name:
        name,

      role:
        role

    };


    showApp(
      name,
      user.email,
      role
    );

  }
);


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

  sidebar
    .classList
    .add("open");

  overlay
    .classList
    .add("show");

}


function closeMenu() {

  sidebar
    .classList
    .remove("open");

  overlay
    .classList
    .remove("show");

}


menuBtn
  .addEventListener(
    "click",
    () => {

      sidebar
        .classList
        .toggle("open");

      overlay
        .classList
        .toggle("show");

    }
  );


overlay
  .addEventListener(
    "click",
    closeMenu
  );


document
  .addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Escape"
      ) {

        closeMenu();

      }

    }
  );


/* =========================================================
   PAGE NAVIGATION
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

  /*
    ONLY ADMIN CAN OPEN ADD STUDENT.
  */

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
      (section) => {

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
      (button) => {

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

    $("pageTitle")
      .textContent =
        titles[page][0];

    $("pageSubtitle")
      .textContent =
        titles[page][1];

  }


  if (
    page === "records"
  ) {

    renderStudents();

  }


  if (
    page === "courses"
  ) {

    renderCourses();

  }


  if (
    page === "statistics"
  ) {

    updateStatistics();

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
    (event) => {

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
        (doc) => ({

          firebaseId:
            doc.id,

          ...doc.data()

        })
      );


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

$("studentForm")
  .addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      /*
        IMPORTANT:
        Even if someone bypasses the UI,
        JavaScript will block non-admin users.
      */

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
            .value,

        result:
          $("studentResult")
            .value,

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
          "Student added successfully! 🎉\n\nYour data successfully saved."
        );


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
      (student) => {

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


        return text.includes(
          search
        );

      }
    );


  table.innerHTML =
    "";


  if (
    list.length === 0
  ) {

    empty.style.display =
      "block";

    return;

  }


  empty.style.display =
    "none";


  list.forEach(
    (student, index) => {

      const row =
        document.createElement(
          "tr"
        );


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
            data-delete="${safe(student.firebaseId)}"
            style="display:${
              isAdmin()
                ? ""
                : "none"
            }"
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


  /*
    Delete buttons
  */

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      (button) => {

        button
          .addEventListener(
            "click",
            async () => {


              /*
                Extra Admin check.
              */

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
                  .collection(
                    "students"
                  )
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

      }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

$("searchInput")
  .addEventListener(
    "input",
    renderStudents
  );


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const total =
    students.length;


  const passed =
    students.filter(
      (s) =>
        s.result ===
        "Passed"
    ).length;


  const failed =
    students.filter(
      (s) =>
        s.result ===
        "Failed"
    ).length;


  const courses =
    new Set(
      students
        .map(
          (s) =>
            s.course
        )
        .filter(Boolean)
    ).size;


  $("totalCount")
    .textContent =
      total;


  $("passedCount")
    .textContent =
      passed;


  $("failedCount")
    .textContent =
      failed;


  $("courseCount")
    .textContent =
      courses;


  updateStatistics();

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
    ([name, icon, description]) => {


      const count =
        students.filter(
          (student) =>
            student.course ===
            name
        ).length;


      const card =
        document.createElement(
          "div"
        );


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
      (s) =>
        s.result ===
        "Passed"
    ).length;


  const failed =
    students.filter(
      (s) =>
        s.result ===
        "Failed"
    ).length;


  const passedPercent =
    total
      ? Math.round(
          (passed / total) *
            100
        )
      : 0;


  const failedPercent =
    total
      ? Math.round(
          (failed / total) *
            100
        )
      : 0;


  $("passedPercent")
    .textContent =
      passedPercent +
      "%";


  $("failedPercent")
    .textContent =
      failedPercent +
      "%";


  $("passedBar")
    .style.width =
      passedPercent +
      "%";


  $("failedBar")
    .style.width =
      failedPercent +
      "%";


  $("statTotal")
    .textContent =
      total;


  $("statPassed")
    .textContent =
      passed;


  $("statFailed")
    .textContent =
      failed;

}


/* =========================================================
   LOGOUT
   ========================================================= */

$("logout")
  .addEventListener(
    "click",
    async () => {

      try {

        currentRole =
          "Student";

        currentProfile =
          null;


        await auth.signOut();


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }


      $("loginForm")
        .reset();


      $("forgotForm")
        .reset();


      showLoginPage();

    }
  );


/* =========================================================
   START
   ========================================================= */

renderCourses();

updateDashboard();
