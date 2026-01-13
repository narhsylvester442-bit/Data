/* ===========================
   GLOBAL CONFIG
=========================== */

const API_BASE = "../../backend";

/* ===========================
   GLOBAL LOADER
=========================== */
function showLoader(){
  const loader = document.getElementById("globalLoader");
  if(loader) loader.style.display = "flex";
}

function hideLoader(){
  const loader = document.getElementById("globalLoader");
  if(loader) loader.style.display = "none";
}

/* ===========================
   TOAST NOTIFICATION
=========================== */
function toast(message, type="success"){
  let box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerText = message;
  document.body.appendChild(box);

  setTimeout(()=> box.remove(), 3000);
}

/* ===========================
   SESSION CHECK
=========================== */
function requireAuth(){
  fetch(`${API_BASE}/auth.php?action=session`)
    .then(r=>r.json())
    .then(res=>{
      if(!res.logged_in){
        location.href = "../login.html";
      }
    });
}

/* ===========================
   ROLE REDIRECT
=========================== */
function redirectByRole(role){
  switch(role){
    case "admin":
      location.href = "admin-dashboard.html";
      break;
    case "agent":
      location.href = "agent-dashboard.html";
      break;
    case "subagent":
      location.href = "subagent-dashboard.html";
      break;
    default:
      location.href = "../index.html";
  }
}

/* ===========================
   LOGOUT
=========================== */
function logout(){
  fetch(`${API_BASE}/logout.php`)
    .then(()=>{
      toast("Logged out");
      setTimeout(()=>location.href="../login.html",800);
    });
}

/* ===========================
   FETCH WRAPPER
=========================== */
async function api(url, data=null){
  showLoader();
  try{
    let res = await fetch(`${API_BASE}/${url}`,{
      method: data ? "POST" : "GET",
      body: data ? new URLSearchParams(data) : null
    });
    hideLoader();
    return await res.json();
  }catch(e){
    hideLoader();
    toast("Network error","error");
    throw e;
  }
}

/* ===========================
   AUTO SESSION CHECK
=========================== */
document.addEventListener("DOMContentLoaded",()=>{
  const securePage = document.body.dataset.auth === "true";
  if(securePage){
    requireAuth();
  }
});

/*========================
        BUY DATA
  ======================*/
  const buyBtn = document.getElementById("buyBtn");
  if (buyBtn) buyBtn.addEventListener("click", () => {
  const network = document.getElementById("network").value;
  const volume  = document.getElementById("volume").value;
  const number  = document.getElementById("number").value;

  fetch("../../backend/BuyData.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      network,
      volume,
      number
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 1) {
      alert("Data purchase successful!");
    } else {
      alert(data.message || "Failed");
    }
  })
  .catch(() => alert("Server error"));
});
