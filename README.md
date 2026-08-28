# ApexPortal — Open Redirect Vulnerability & Remediation Demo
Welcome to **ApexPortal**, an enterprise single sign-on (SSO) identity portal simulator designed to showcase the impact of untrusted redirection vulnerabilities and how to successfully prevent them using secure URL validation techniques.

---

## 📌 Vulnerability Overview: What is an Open Redirect?
An **Open Redirect** vulnerability occurs when a web application accepts a user-controlled URL as input (often through query parameters like `?redirect=...` or `?next=...`) and redirects the user's browser to that URL without proper sanitization.

### Why it is Dangerous:
1. **Phishing Campaigns:** Attackers craft links starting with the trusted domain name (e.g., `https://trustedportal.com/login?redirect=http://evil-attacker.com`). Because the URL starts with a trusted site, victims feel safe clicking it. After they authenticate, they are redirected to a look-alike phishing page that harvests their credentials.
2. **Bypassing Protections:** It can bypass OAuth callback restrictions if the identity provider is used to route tokens to untrusted third-party hosts.

---

## 🛠️ Project Structure
* **[`server.js`](file:///c:/Users/joshi/cyber_security/open-redirect-app/server.js):** The Express server containing routing, mock authentication, session storage, a simulated phishing page, and the security shield configuration.
* **`package.json`:** Project metadata and dependencies.

---

## 🚀 How to Setup and Run the Application

### Prerequisites:
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation Steps:
1. **Navigate to the project directory:**
   ```bash
   cd open-redirect-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the application server:**
   ```bash
   npm start
   ```
4. **Open your browser and navigate to:**  
   [http://localhost:3000](http://localhost:3000)

---

## 🎮 Live Demonstration Guide

ApexPortal contains an interactive **Redirect Shield Toggle** at the top right header (`Enable Redirect Shield` / `Disable Redirect Shield`). You can toggle this state live to demonstrate both vulnerable and secure behaviors.

### Step 1: Demonstrate Vulnerable Redirect (The Exploit)
1. Ensure the shield is disabled: **Shield Disabled** (red badge).
2. Go to the Home Page and click **Sign In (External redirect)**.
   * Notice the URL parameter in your browser address bar: `?redirect=https://google.com` (or change this value to `/phishing-page`).
3. Login using the default credentials:
   * **Username:** `user`
   * **Password:** `password`
4. Click **Authenticate**.
5. **Result:** The application authenticates the user and immediately redirects them to the external target (like `/phishing-page`).

### Step 2: Demonstrate Secure Redirect (The Defense)
1. Return to the homepage and click **Enable Redirect Shield** (green badge).
2. Attempt the exact same action by selecting a sign-in link with an external redirect query parameter (e.g., `?redirect=/phishing-page`).
3. Log in with the same credentials.
4. **Result:** The portal validates the redirect target. Because it is not a safe local path, the shield blocks it. You are safely routed to the secure dashboard with an alert message: *"An external redirection query parameter was identified and neutralized. You were safely returned to the main panel."*

---

## 💻 Code Walkthrough

### Vulnerable Code (`server.js`)
In the vulnerable implementation, the application accepts the `redirect` query parameter from the POST body and blindly forwards it to Express’s redirect engine:
```javascript
// Blind redirection based on user input without validation
return res.redirect(redirect);
```

### Secure Code (`server.js`)
In the secure implementation, we validate that the destination is a relative local path:
```javascript
const isSafeRedirect = (url) => {
  if (!url) return false;
  // Ensure the target redirect URL is relative, beginning with '/' 
  // and not a protocol-relative link (e.g. starting with '//' or '/\')
  return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
};

if (isSafeRedirect(redirect)) {
  return res.redirect(redirect);
} else {
  // Block and fallback to a safe internal URL
  return res.redirect('/dashboard?info=unsafe_redirect_blocked');
}
```
