'use client';

import { useState } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:8080';

export default function RbacDemoPage() {
  // Signup State
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('manager');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Current Session State
  const [token, setToken] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Response / Status States
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  // 1. SIGNUP HANDLER
  const handleSignup = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await axios.post(`${BACKEND}/auth/signup`, {
        id: 0,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
      });
      setStatusMsg(`✅ Account created successfully as [${signupRole.toUpperCase()}]! Ab login karein.`);
      setLoginEmail(signupEmail);
      setLoginPassword(signupPassword);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Signup failed!');
    }
  };

  // 2. LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    setRouteResult(null);
    try {
      const res = await axios.post(`${BACKEND}/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      const userToken = res.data.token;
      setToken(userToken);

      // Decode JWT token to get Role & Email
      const payloadBase64 = userToken.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));

      setLoggedInUser({
        email: decoded.sub,
        role: decoded.role,
      });

      setStatusMsg(`🎉 Logged in as: ${decoded.sub} (Role: ${decoded.role.toUpperCase()})`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Login failed! Invalid credentials.');
    }
  };

  // 3. TEST MANAGER ROUTE (/manager/dashboard)
  const testManagerRoute = async () => {
    setRouteResult(null);
    try {
      const res = await axios.get(`${BACKEND}/manager/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRouteResult({ success: true, text: res.data });
    } catch (err) {
      setRouteResult({
        success: false,
        text: err.response?.data || 'Access Denied! You do not have the manager role.',
      });
    }
  };

  // 4. TEST EDITOR ROUTE (/editor/dashboard)
  const testEditorRoute = async () => {
    setRouteResult(null);
    try {
      const res = await axios.get(`${BACKEND}/editor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRouteResult({ success: true, text: res.data });
    } catch (err) {
      setRouteResult({
        success: false,
        text: err.response?.data || 'Access Denied! You do not have the editor role.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 font-sans">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-indigo-600">
          🛡️ Flexible RBAC (Role-Based Access Control)
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Don Framework Custom Guards (ManagerGuard vs EditorGuard) + Next.js
        </p>
      </div>

      {/* Notifications */}
      {statusMsg && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-xl mb-6 text-sm font-semibold">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl mb-6 text-sm font-semibold">
          🛑 {errorMsg}
        </div>
      )}

      {/* Current Session Bar */}
      {loggedInUser && (
        <div className="bg-slate-900 text-white p-4 rounded-xl mb-8 flex justify-between items-center shadow-lg">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Active Session:</span>
            <span className="font-bold text-emerald-400">{loggedInUser.email}</span>
            <span className="ml-3 text-xs bg-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase">
              Role: {loggedInUser.role}
            </span>
          </div>
          <button
            onClick={() => {
              setToken('');
              setLoggedInUser(null);
              setRouteResult(null);
            }}
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-bold transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* Top Section: Signup & Login Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Form 1: Signup with Role Selection */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-lg font-bold text-gray-800 mb-4">1. Register with Role</h2>
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g. boss@corp.com"
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Password</label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Select Role</label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="manager">Manager</option>
                <option value="editor">Editor</option>
                <option value="user">Normal User</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Form 2: Login */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-lg font-bold text-gray-800 mb-4">2. Login to Get Token</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. boss@corp.com"
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="pt-7">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition"
              >
                Log In
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Bottom Section: Test Protected Routes */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-lg font-bold text-gray-800 mb-2">3. Test Protected Endpoints</h2>
        <p className="text-xs text-gray-500 mb-6">
          Neechay diye gaye buttons par click karein aur dekhein ke Rust ka `DonGuard` kis tarah unauthorized roles ko block karta hai:
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={testManagerRoute}
            disabled={!token}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow flex items-center justify-center gap-2"
          >
            📊 Test /manager/dashboard
          </button>
          <button
            onClick={testEditorRoute}
            disabled={!token}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow flex items-center justify-center gap-2"
          >
            📝 Test /editor/dashboard
          </button>
        </div>

        {/* Route Execution Result */}
        {routeResult && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold border ${
              routeResult.success
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
          >
            <p className="text-xs uppercase tracking-wider font-bold mb-1">
              {routeResult.success ? '✅ Status: 200 OK (Access Granted)' : '🛑 Status: 403 Forbidden (Blocked)'}
            </p>
            <p className="font-mono">{routeResult.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}