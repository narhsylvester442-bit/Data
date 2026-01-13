/* ===========================
   AUTH UTILITIES
=========================== */

/* LOGIN */
function loginUser(email, password) {
  fetch("../backend/auth.php?action=login", {
    method: "POST",
    body: new URLSearchParams({ email, password })
  })
  .then(r => r.json())
  .then(res => {
    if (res.error) {
      alert(res.error);
      return;
    }

    if (!res.approved) {
      alert("Account pending admin approval");
      return;
    }

    /* ROLE REDIRECT */
    switch (res.role) {
      case "admin":
        location.href = "pages/admin-dashboard.html";
        break;
      case "agent":
        location.href = "pages/agent-dashboard.html";
        break;
      case "subagent":
        location.href = "pages/subagent-dashboard.html";
        break;
      default:
        alert("Invalid account role");
    }
  });
}

/* SIGNUP – STEP 1 (SEND OTP) */
function sendOTP(email, phone, password, ref = "") {
  fetch("../backend/auth.php?action=send_otp", {
    method: "POST",
    body: new URLSearchParams({ email, phone, password, ref })
  })
  .then(r => r.text())
  .then(res => {
    if (res === "OTP_SENT") {
      document.getElementById("step1").style.display = "none";
      document.getElementById("step2").style.display = "block";
      alert("OTP sent to your phone");
    } else {
      alert(res);
    }
  });
}

/* SIGNUP – STEP 2 (VERIFY OTP) */
function verifyOTP(otp) {
  fetch("../backend/auth.php?action=verify_otp", {
    method: "POST",
    body: new URLSearchParams({ otp })
  })
  .then(r => r.text())
  .then(res => {
    alert(res);
    if (res.includes("successful")) {
      location.href = "login.html";
    }
  });
}

/* LOGOUT */
function logout() {
  fetch("../backend/Logout.php")
    .then(() => location.href = "../login.html");
}

/* SESSION CHECK (OPTIONAL USE) */
function checkSession() {
  fetch("../backend/auth.php?action=session")
    .then(r => r.json())
    .then(res => {
      if (!res.logged_in) {
        location.href = "../login.html";
      }
    });
}