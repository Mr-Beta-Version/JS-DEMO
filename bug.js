/* =========================================================
   Demo: Realistic insecure JavaScript patterns
   For security scanner testing ONLY
   ========================================================= */

/* 1) Hardcoded secrets (realistic formats) */

// Stripe (realistic live key pattern)
const STRIPE_SECRET_KEY = "sk_live_51NAbCdEfGhIjKlMnOpQrStUvWxYz0123456789";

// AWS credentials (common leak style)
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPL";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// JWT (structurally valid)
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTk5OTk5OTk5OX0." +
  "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

/* 2) Sensitive endpoints and admin paths */

const API_BASE = "https://api.example.com/v1";
const ADMIN_PANEL = "https://admin.example.com/dashboard";
const INTERNAL_DEBUG = "https://api.example.com/debug?dump=true";
const PHPMYADMIN = "https://db.example.com/phpmyadmin/";
const HEALTH_CHECK = "https://api.example.com/internal/health";

/* 3) DOM XSS via location.hash */

function renderFromHash() {
  const data = decodeURIComponent(location.hash.substring(1));
  document.getElementById("output").innerHTML = data; // DOM XSS sink
}
window.addEventListener("hashchange", renderFromHash);

/* 4) DOM XSS via query parameter */

function getQueryParam(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

const username = getQueryParam("user");
if (username) {
  document.write("<h3>Welcome " + username + "</h3>"); // DOM XSS sink
}

/* 5) Dangerous eval / Function usage */

function executeUserCode() {
  const payload = getQueryParam("code");
  if (payload) {
    eval(payload); // extremely dangerous
  }
}

function calculateExpression() {
  const expr = getQueryParam("expr");
  if (expr) {
    const fn = new Function("return (" + expr + ")");
    console.log("Expression result:", fn());
  }
}

/* 6) Insecure postMessage handling */

window.addEventListener("message", (event) => {
  // Missing origin validation
  if (event.data && event.data.action === "render") {
    document.getElementById("output").innerHTML = event.data.html; // XSS sink
  }

  if (event.data && event.data.action === "navigate") {
    window.location.href = event.data.url; // open redirect
  }
});

/* 7) Open redirect vulnerability */

function goNext() {
  const next = getQueryParam("next");
  if (next) {
    location.href = next; // no validation
  }
}

/* 8) Insecure fetch usage */

function deleteAccount(userId) {
  const token = localStorage.getItem("auth_token");

  // Sensitive action via GET + token in URL
  fetch(
    API_BASE +
      "/users/delete?id=" +
      encodeURIComponent(userId) +
      "&token=" +
      encodeURIComponent(token),
    { method: "GET" }
  )
    .then((r) => r.text())
    .then((t) => console.log("deleteAccount:", t));
}

/* 9) Storing secrets in browser storage */

localStorage.setItem("auth_token", JWT_TOKEN);
sessionStorage.setItem("refresh_token", "rfrsh_8f7d6c5b4a3210");

/* 10) Prototype pollution style merge */

function mergeUnsafe(target, source) {
  for (const key in source) {
    target[key] = source[key]; // no hasOwnProperty or __proto__ protection
  }
  return target;
}

const profile = {};
mergeUnsafe(profile, JSON.parse(getQueryParam("profile") || "{}"));

/* 11) Weak CORS / credentialed request */

function loadPrivateData() {
  fetch("https://api.example.com/private/data", {
    method: "GET",
    credentials: "include" // cookies sent cross-origin
  })
    .then((r) => r.text())
    .then((t) => console.log("private data:", t));
}

/* 12) Insecure WebSocket usage */

function connectWebSocket() {
  const ws = new WebSocket("ws://realtime.example.com/socket"); // not wss
  ws.onmessage = (e) => {
    document.getElementById("output").innerHTML = e.data; // XSS sink
  };
}

/* Optional auto-run hooks */
window.addEventListener("load", () => {
  // renderFromHash();
  // executeUserCode();
  // calculateExpression();
  // goNext();
});
