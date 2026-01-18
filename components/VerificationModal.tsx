import React, { useState } from 'react';
import { X, ShieldCheck, GraduationCap, Building2, Upload, Loader2, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (user: User) => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    licenseNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register' && !formData.name.trim()) newErrors.name = 'Full name is required';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (mode === 'register') {
      if (role === 'student' && !formData.university.trim()) {
        newErrors.university = 'University name is required';
      }
      if (role === 'landlord' && !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password.trim()
          })
        });
        const data = await res.json();

        if (res.ok) {
          onVerify(data);
          setStep(3);
          setTimeout(() => {
            onClose();
            setStep(1);
            setErrors({});
          }, 1500);
        } else {
          setErrors({ form: data.error || 'Login failed' });
        }
      } else {
        // Simple simulation for registration for now
        setTimeout(() => {
          onVerify({
            name: formData.name,
            email: formData.email,
            type: role,
            isVerified: true,
            university: role === 'student' ? formData.university : undefined,
            licenseNumber: role === 'landlord' ? formData.licenseNumber : undefined
          });
          setStep(3);
          setTimeout(() => {
            onClose();
            setStep(1);
            setErrors({});
          }, 1500);
        }, 1500);
      }
    } catch (err) {
      setErrors({ form: 'Check your internet connection' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        {step === 3 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{mode === 'login' ? 'Welcome Back!' : 'Verified!'}</h3>
            <p className="text-slate-600">{mode === 'login' ? 'Successfully logged in.' : 'Your identity has been confirmed.'}</p>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 bg-slate-50 border-b border-slate-100 text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{mode === 'login' ? 'Sign In' : 'Identity Verification'}</h2>
              <p className="text-sm text-slate-500 mt-1">{mode === 'login' ? 'Access your account' : 'Build trust by verifying your status.'}</p>
            </div>

            <div className="p-8">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                    <button
                      onClick={() => setMode('login')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <LogIn size={16} /> Login
                    </button>
                    <button
                      onClick={() => setMode('register')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <UserPlus size={16} /> Register
                    </button>
                  </div>

                  {mode === 'register' ? (
                    <>
                      <p className="text-sm font-medium text-slate-700 mb-4 block">I am a...</p>
                      <button
                        onClick={() => { setRole('student'); setStep(2); }}
                        className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition flex items-center gap-4 group text-left"
                      >
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">Student</span>
                          <span className="text-xs text-slate-500">I need accommodation for my studies</span>
                        </div>
                      </button>

                      <button
                        onClick={() => { setRole('landlord'); setStep(2); }}
                        className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition flex items-center gap-4 group text-left"
                      >
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">Landlord</span>
                          <span className="text-xs text-slate-500">I own or manage properties</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {errors.form && <div className="p-3 bg-rose-50 text-rose-500 text-xs rounded-lg border border-rose-100 flex items-center gap-2"><LogIn size={14} /> {errors.form}</div>}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                          placeholder="e.g. student@test.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                        <input
                          type="password"
                          className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.password ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        {errors.password && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.password}</p>}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-lg shadow-brand-100"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Log In'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {role === 'student' ? 'University Email' : 'Business Email'}
                    </label>
                    <input
                      type="email"
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                      placeholder={role === 'student' ? "name@university.ac.uk" : "name@property.com"}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                    <input
                      type="password"
                      className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.password ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.password}</p>}
                  </div>

                  {role === 'student' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">University Name</label>
                      <input
                        type="text"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.university ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                        placeholder="e.g. Imperial College London"
                        value={formData.university}
                        onChange={e => setFormData({ ...formData, university: e.target.value })}
                      />
                      {errors.university && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.university}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Property License / Registration</label>
                      <input
                        type="text"
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-colors ${errors.licenseNumber ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                        placeholder="e.g. PR-123456"
                        value={formData.licenseNumber}
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                      {errors.licenseNumber && <p className="text-rose-500 text-[10px] mt-1 font-medium">{errors.licenseNumber}</p>}
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        Upload {role === 'student' ? 'Student ID Card' : 'Property Deeds / ID'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, PDF</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Register & Verify'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
