const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('cyber-security-secret-key'));

// Simple in-memory session store (simulation)
const sessions = new Map();

// Helper to check if user is logged in
function getLoggedInUser(req) {
  const sessionId = req.cookies.session_id;
  return sessions.get(sessionId);
}

// Global security mode toggler (stored in cookie so it persists across requests)
function getSecurityMode(req) {
  return req.cookies.security_mode === 'Secure' ? 'Secure' : 'Vulnerable';
}

// Common template wrapper to keep pages clean and responsive
function renderPage(content, title, req) {
  const user = getLoggedInUser(req);
  const mode = getSecurityMode(req);
  const modeBadge = mode === 'Secure' 
    ? '<span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">Shield Enabled</span>' 
    : '<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill">Shield Disabled</span>';

  const toggleBtn = mode === 'Secure'
    ? `<a href="/toggle-mode?mode=Vulnerable" class="btn btn-outline-danger btn-sm rounded-pill px-3">Disable Redirect Shield</a>`
    : `<a href="/toggle-mode?mode=Secure" class="btn btn-outline-success btn-sm rounded-pill px-3">Enable Redirect Shield</a>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | ApexPortal</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { background-color: #f3f4f6; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; }
        .navbar { background-color: #111827 !important; border-bottom: 1px solid #1f2937; }
        .navbar-brand { font-weight: 700; letter-spacing: -0.5px; }
        .card { border-radius: 16px; border: none; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); }
        .btn-primary { background-color: #4f46e5; border-color: #4f46e5; font-weight: 500; }
        .btn-primary:hover { background-color: #4338ca; border-color: #4338ca; }
        .form-control:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25); }
      </style>
    </head>
    <body>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-5 py-3">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center" href="/">
            <span class="fs-4 me-2">🌐</span> ApexPortal
          </a>
          <div class="collapse navbar-collapse justify-content-end">
            <span class="navbar-text me-3">${modeBadge}</span>
            ${toggleBtn}
            ${user ? `<a href="/logout?redirect=/" class="btn btn-outline-light btn-sm ms-3 rounded-pill px-3">Logout</a>` : ''}
          </div>
        </div>
      </nav>
      <div class="container">
        ${content}
      </div>
      <footer class="text-center text-muted py-5 mt-5">
        <p class="small">© 2026 ApexPortal. All rights reserved. Enterprise Gateway & Identity Provider.</p>
      </footer>
    </body>
    </html>
  `;
}

// 1. Home / Landing Route
app.get('/', (req, res) => {
  const user = getLoggedInUser(req);
  let htmlContent = '';

  if (user) {
    htmlContent = `
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card p-5 text-center bg-white">
            <h1 class="mb-3 fw-bold">Welcome Back, ${user.username}!</h1>
            <p class="text-muted fs-5 mb-4">Access your applications, security logs, and profile records from your secure control center.</p>
            <div>
              <a href="/dashboard" class="btn btn-primary btn-lg rounded-pill px-4">Open Workspace Dashboard</a>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    htmlContent = `
      <div class="row align-items-center py-5">
        <div class="col-md-6 mb-4 mb-md-0">
          <h1 class="display-4 fw-bold mb-3" style="letter-spacing: -1px;">Next-Gen Enterprise Single Sign-On</h1>
          <p class="lead text-muted mb-4">ApexPortal simplifies secure access to all corporate resources. Safe, responsive, and identity-protected.</p>
          <div class="d-flex gap-3">
            <a href="/login?redirect=/dashboard" class="btn btn-primary btn-lg rounded-pill px-4">Sign In Now</a>
            <a href="/login?redirect=https://google.com" class="btn btn-outline-secondary btn-lg rounded-pill px-4">Sign In (External redirect)</a>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-white p-4 p-md-5">
            <h4 class="fw-bold mb-3">Redirection Sandbox</h4>
            <p class="text-muted small">Test how identity systems handle redirect parameters. Toggle the safety shield at the top to simulate the vulnerability vs mitigation.</p>
            <div class="border-start border-3 border-indigo ps-3">
              <span class="badge bg-light text-dark mb-2">Simulated Phishing Link</span>
              <a href="/login?redirect=/phishing-page" class="d-block text-truncate text-indigo font-monospace small">/login?redirect=/phishing-page</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  res.send(renderPage(htmlContent, 'Home', req));
});

// 2. Login Page Route
app.get('/login', (req, res) => {
  if (getLoggedInUser(req)) {
    return res.redirect('/dashboard');
  }

  // Preserve the redirect query parameter
  const redirectTarget = req.query.redirect || '/dashboard';

  const htmlContent = `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card p-4 p-md-5 bg-white">
          <h3 class="fw-bold text-center mb-2">Account Login</h3>
          <p class="text-muted text-center small mb-4">Enter credentials to securely authenticate your session</p>
          
          <div class="alert alert-info py-2 rounded-3 text-center mb-4" role="alert">
            <small>Credentials: <strong>user</strong> / <strong>password</strong></small>
          </div>
          
          <form action="/login" method="POST">
            <!-- Hidden field to carry redirect URL -->
            <input type="hidden" name="redirect" value="${redirectTarget}">
            
            <div class="mb-3">
              <label for="username" class="form-label font-monospace small">Username</label>
              <input type="text" class="form-control rounded-3" id="username" name="username" required autocomplete="off" placeholder="user">
            </div>
            <div class="mb-4">
              <label for="password" class="form-label font-monospace small">Password</label>
              <input type="password" class="form-control rounded-3" id="password" name="password" required placeholder="••••••••">
            </div>
            
            <div class="card bg-light p-3 mb-4 rounded-3 border-start border-primary border-3">
              <small class="text-muted d-block mb-1">Callback Destination Parameter:</small>
              <code class="text-break small">${redirectTarget}</code>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-3 rounded-pill">Authenticate</button>
          </form>
        </div>
      </div>
    </div>
  `;
  res.send(renderPage(htmlContent, 'Login', req));
});

// 3. Login POST handler
app.post('/login', (req, res) => {
  const { username, password, redirect } = req.body;
  const mode = getSecurityMode(req);

  // Authentication check
  if (username === 'user' && password === 'password') {
    // Set mock session
    const sessionId = Math.random().toString(36).substring(2);
    sessions.set(sessionId, { username });
    res.cookie('session_id', sessionId, { httpOnly: true });

    // Handle redirection based on Mode
    if (mode === 'Secure') {
      const isSafeRedirect = (url) => {
        if (!url) return false;
        return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
      };

      if (isSafeRedirect(redirect)) {
        console.log(`[Secure Mode] Safe local redirect allowed to: ${redirect}`);
        return res.redirect(redirect);
      } else {
        console.warn(`[Secure Mode] Blocked unsafe redirect request to: ${redirect}`);
        return res.redirect('/dashboard?info=unsafe_redirect_blocked');
      }
    } else {
      console.log(`[Vulnerable Mode] Blindly redirecting to: ${redirect}`);
      return res.redirect(redirect);
    }
  } else {
    // Bad credentials
    const redirectParam = encodeURIComponent(redirect || '/dashboard');
    return res.send(renderPage(`
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="alert alert-danger text-center rounded-3">
            Invalid username or password credentials.
          </div>
          <div class="text-center">
            <a href="/login?redirect=${redirectParam}" class="btn btn-secondary rounded-pill px-4">Try Again</a>
          </div>
        </div>
      </div>
    `, 'Login Error', req));
  }
});

// 4. Dashboard Route
app.get('/dashboard', (req, res) => {
  const user = getLoggedInUser(req);
  if (!user) {
    return res.redirect('/login?redirect=/dashboard');
  }

  const alertMsg = req.query.info === 'unsafe_redirect_blocked'
    ? `<div class="alert alert-warning alert-dismissible fade show rounded-3 mb-4" role="alert">
        <strong>Redirect Shield:</strong> An external redirection query parameter was identified and neutralized. You were safely returned to the main panel.
       </div>`
    : '';

  const htmlContent = `
    ${alertMsg}
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card p-5 bg-white mb-4">
          <h2 class="fw-bold mb-4">Workspace Dashboard</h2>
          <p class="text-muted">Welcome to your secure identity console. Below are your account details and integration statistics.</p>
          <hr class="my-4">
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="p-3 bg-light rounded-3">
                <span class="text-muted small">Authenticated User</span>
                <h5 class="fw-bold mb-0">${user.username}</h5>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="p-3 bg-light rounded-3">
                <span class="text-muted small">Role / Tier</span>
                <h5 class="fw-bold mb-0 text-indigo">Platform Administrator</h5>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <h5 class="fw-bold mb-3">Quick Navigation Sandbox</h5>
            <div class="list-group">
              <a href="/logout?redirect=/" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Sign Out (Safely return to landing page)
                <span class="badge bg-secondary rounded-pill">Local Redirect</span>
              </a>
              <a href="/logout?redirect=/phishing-page" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-danger">
                Sign Out (Trigger vulnerable external redirect payload)
                <span class="badge bg-danger rounded-pill">Unsafe Redirect</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  res.send(renderPage(htmlContent, 'Dashboard', req));
});

// 5. Logout Route (also has optional redirection)
app.get('/logout', (req, res) => {
  const sessionId = req.cookies.session_id;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.clearCookie('session_id');

  const redirect = req.query.redirect || '/';
  const mode = getSecurityMode(req);

  if (mode === 'Secure') {
    const isSafeRedirect = (url) => {
      return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
    };
    if (isSafeRedirect(redirect)) {
      return res.redirect(redirect);
    }
    return res.redirect('/');
  } else {
    // Vulnerable redirect
    return res.redirect(redirect);
  }
});

// 6. Security Mode Toggle Helper Route
app.get('/toggle-mode', (req, res) => {
  const nextMode = req.query.mode === 'Secure' ? 'Secure' : 'Vulnerable';
  res.cookie('security_mode', nextMode, { maxAge: 900000, httpOnly: true });
  
  // Go back to referrer if possible, or home
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

// 7. Simulated Attacker Phishing Page
// This simulates a different, malicious domain harvesting credentials.
app.get('/phishing-page', (req, res) => {
  const htmlContent = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card border-danger border-2 p-5 text-center">
          <div class="text-danger mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <h2 class="text-danger mb-3">⚠️ Phishing Page Simulated!</h2>
          <p class="lead">You have been redirected to an external untrusted server (e.g. <code>evil-attacker-site.com</code>).</p>
          <div class="alert alert-warning text-start">
            <strong>How the attack worked:</strong>
            <ol class="mb-0 mt-2">
              <li>The victim clicked a trusted link starting with <code>http://localhost:3000/...</code>.</li>
              <li>Because the application did not validate the redirect target, it forwarded the victim here.</li>
              <li>A real attacker would show a clone of the real login page, tricking the victim into entering credentials.</li>
            </ol>
          </div>
          <div class="mt-4">
            <a href="/" class="btn btn-primary">Back to Safe Home</a>
          </div>
        </div>
      </div>
    </div>
  `;
  res.send(renderPage(htmlContent, 'Warning: Phishing Site', req));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cyber Security Assignment 2 - Open Redirect App`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   Vulnerable/Secure Toggle state resides on cookies.`);
  console.log(`=======================================================`);
});
