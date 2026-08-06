import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); // Token saving & Redirecting to Dashboard
      }
    } catch (err) {
      console.error("Auth Failed:", err);
      setErrorMsg(err.response?.data?.message || 'Login failed! Server check karo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to DevPulse' : 'Create Account'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg('');
          }}
          className="w-full mt-4 text-sm text-gray-400 hover:text-white text-center"
        >
          {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
        </button>
      </div>
    </div>
  );
};

export default Auth;