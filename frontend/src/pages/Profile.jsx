import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowUpRight, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api, { messageFrom } from '../services/api';
import { ErrorMessage } from '../components/Feedback';

export default function Profile() {
  const { user, refresh } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { ...user, skills: (user?.skills || []).join(', ') } });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  async function save(values) {
    setError(''); setNotice('');
    try { await api.patch('/users/me', { ...values, skills: values.skills.split(',').map(skill => skill.trim()).filter(Boolean) }); await refresh(); setNotice('Your profile has been updated.'); }
    catch (err) { setError(messageFrom(err)); }
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(''); setNotice('');
    const body = new FormData(); body.append('resume', file);
    try { await api.post('/users/me/resume', body); await refresh(); setNotice('Resume uploaded successfully.'); }
    catch (err) { setError(messageFrom(err)); }
    finally { setUploading(false); event.target.value = ''; }
  }
  return <section className="page-shell profile-page"><div className="eyebrow">A LITTLE MORE YOU</div><h1>Your profile, <em>your story.</em></h1><p className="page-intro">Help great teams understand what makes you, you.</p><div className="profile-layout"><form className="profile-form" onSubmit={handleSubmit(save)}><ErrorMessage>{error}</ErrorMessage>{notice && <div className="alert alert-success">{notice}</div>}<h2>About you</h2><div className="field-grid"><label className="field-label">Full name<input {...register('name', { required: true })} required maxLength="100" /></label><label className="field-label">Email address<input value={user?.email || ''} disabled /></label><label className="field-label">Headline<input {...register('headline')} placeholder="Aspiring frontend developer" maxLength="160" /></label><label className="field-label">Location<input {...register('location')} placeholder="Bengaluru, India" maxLength="120" /></label><label className="field-label">Phone number<input {...register('phone')} placeholder="+91 98765 43210" maxLength="30" /></label><label className="field-label">Skills <small>Separate with commas</small><input {...register('skills')} placeholder="React, Figma, Python…" /></label></div><label className="field-label">A little about you<textarea {...register('bio')} rows="5" placeholder="What are you curious about? What do you hope to learn?" maxLength="2000" /></label>{user?.role === 'employer' && <label className="field-label">Company name<input {...register('company')} /></label>}<button className="button button-dark" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save profile'} <FiArrowUpRight /></button></form><aside className="resume-panel"><span className="resume-icon"><FiUpload /></span><div className="eyebrow">YOUR RESUME</div><h3>{user?.hasResume ? 'Your resume is ready.' : 'Add your resume.'}</h3><p>Upload a PDF or Word document (up to 5 MB). We’ll share it only with teams you apply to.</p><label className="button button-outline upload-button">{uploading ? 'Uploading…' : user?.hasResume ? 'Replace resume' : 'Choose a file'}<input type="file" accept=".pdf,.doc,.docx" onChange={upload} disabled={uploading} hidden /></label>{user?.hasResume && <small className="resume-confirm">✓ Resume saved to your profile</small>}</aside></div></section>;
}
