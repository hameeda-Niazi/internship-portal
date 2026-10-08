import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowUpRight, FiMail, FiMapPin } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { ErrorMessage } from '../components/Feedback';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function submit(values) {
    setError(''); setSuccess('');
    try { const { data } = await api.post('/contact', values); setSuccess(data.message); reset(); }
    catch (err) { setError(messageFrom(err)); }
  }
  return <section className="page-shell contact-page"><div className="contact-intro"><div className="eyebrow">WE’RE REAL PEOPLE, TOO</div><h1>Let’s <em>talk.</em></h1><p>Questions, ideas, a story to share? We’d love to hear from you.</p><div className="contact-detail"><FiMail /><span><b>Drop us a note</b><small>Use the message form and our team will follow up.</small></span></div><div className="contact-detail"><FiMapPin /><span><b>Made for everywhere</b><small>Rooted in community, open to the world</small></span></div><div className="contact-scribble">✳</div></div><form className="contact-form" onSubmit={handleSubmit(submit)}><h2>Send us a note</h2><p>We usually get back within two business days.</p><ErrorMessage>{error}</ErrorMessage>{success && <div className="alert alert-success">{success}</div>}<label className="field-label">Your name<input {...register('name', { required: true })} required maxLength="100" /></label><label className="field-label">Email address<input type="email" {...register('email', { required: true })} required /></label><label className="field-label">Subject<input {...register('subject', { required: true })} required maxLength="160" /></label><label className="field-label">What’s on your mind?<textarea rows="6" {...register('message', { required: true })} required maxLength="5000" /></label><button disabled={isSubmitting} className="button button-dark">{isSubmitting ? 'Sending…' : 'Send your note'} <FiArrowUpRight /></button></form></section>;
}
