import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useIsMobile from '../../hooks/useIsMobile';
import { showGlobalToast } from '../../utils/toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WebLogin from './WebLogin';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword: React.FC = () => {
  const isMobile = useIsMobile();
  const query = useQuery();
  const ftp = query.get('ftp') || '';
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/common/forgot-pass-update/', { new_password: newPassword, ftp });
      const msg = res?.data?.message || 'Password updated successfully!';
      showGlobalToast(msg, 4000);
      if (isMobile) {
        navigate('/login');
      } else {
        setShowLoginModal(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to reset password.';
      setError(msg);
      showGlobalToast(msg, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Desktop modal with home background
  if (!isMobile) {
    return (
      <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: 'url(/assets/images/home-bg.jpg)' }}>
        <div className="bg-white rounded-lg shadow-lg px-8 py-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Confirm new password"
              />
            </div>
            {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold text-base shadow gradient-btn-equal"
              style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <WebLogin onClose={() => setShowLoginModal(false)} />
          </div>
        )}
      </div>
    );
  }

  // Mobile full-page form
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <div className="flex-1 flex flex-col justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Enter new password"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Confirm new password"
            />
          </div>
          {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold text-base shadow gradient-btn-equal"
            style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword; 