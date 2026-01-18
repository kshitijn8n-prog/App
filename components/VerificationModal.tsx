import React, { useState } from 'react';
import { X, ShieldCheck, GraduationCap, Building2, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (user: User) => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    licenseNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name is too short';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (role === 'student' && !formData.university.trim()) {
      newErrors.university = 'University name is required';
    }

    if (role === 'landlord' && !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Simulate API Verification Check
    setTimeout(() => {
      setLoading(false);
      onVerify({
        name: formData.name,
        email: formData.email,
        type: role,
        isVerified: true,
        university: role === 'student' ? formData.university : undefined,
        licenseNumber: role === 'landlord' ? formData.licenseNumber : undefined
      });
      setStep(3); // Success state
      setTimeout(() => {
        onClose();
        setStep(1); // Reset for next time
        setFormData({ name: '', email: '', university: '', licenseNumber: '' });
        setErrors({});
      }, 2000);
    }, 2000);
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
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h3>
            <p className="text-slate-600">Your identity has been confirmed. Welcome to the trusted community.</p>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 bg-slate-50 border-b border-slate-100 text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Identity Verification</h2>
              <p className="text-sm text-slate-500 mt-1">Build trust by verifying your status.</p>
            </div>

            <div className="p-8">
              {step === 1 ? (
                <div className="space-y-4">
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
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                    <input
                      required
                      type="text"
                      className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {role === 'student' ? 'University Email' : 'Business Email'}
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                      placeholder={role === 'student' ? "name@university.ac.uk" : "name@property.com"}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  {role === 'student' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">University Name</label>
                      <input
                        required
                        type="text"
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                        placeholder="e.g. Imperial College London"
                        value={formData.university}
                        onChange={e => setFormData({ ...formData, university: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Property License / Registration</label>
                      <input
                        required
                        type="text"
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                        placeholder="e.g. PR-123456"
                        value={formData.licenseNumber}
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
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
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Identity'}
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