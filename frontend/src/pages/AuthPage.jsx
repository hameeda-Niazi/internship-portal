import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowUpRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/Feedback';
import { messageFrom } from '../services/api';

export default function AuthPage({ register = false }) {
  const { user, login, register: createAccount } = useAuth();
  const { register: field, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'employer' ? '/employer' : '/dashboard'} replace />;
  async function submit(values) {
    setError('');
    try {
      const account = register ? await createAccount(values) : await login(values);
      navigate(account.role === 'admin' ? '/admin' : account.role === 'employer' ? '/employer' : '/dashboard');
    } catch (err) { setError(messageFrom(err)); }
  }
  return <section className="auth-page"><div className="auth-visual"><span className="auth-spark">✳</span><div className="eyebrow">A LITTLE CLOSER TO WHAT’S NEXT</div><h2>{register ? <>Good things<br />start with <em>you.</em></> : <>Welcome back<br />to your <em>next.</em></>}</h2><p>{register ? 'Make a profile, meet great teams, and find work that helps you grow.' : 'Your next chapter is still waiting. Pick up where you left off.'}</p><div className="auth-quote">“The best place to begin is the one that believes in you.”</div></div><div className="auth-form-wrap"><div className="auth-form-heading"><div className="eyebrow">{register ? 'MAKE YOURSELF AT HOME' : 'GOOD TO SEE YOU AGAIN'}</div><h1>{register ? 'Create your account' : 'Sign in'}</h1><p>{register ? 'A few details, then you’re on your way.' : 'Let’s get you back to the good stuff.'}</p></div><ErrorMessage>{error}</ErrorMessage><form className="auth-form" onSubmit={handleSubmit(submit)}>{register && <><label className="field-label">I’m here as<select {...field('role')} defaultValue="user"><option value="user">Looking for an internship</option><option value="employer">Hiring / representing a company</option></select></label><label className="field-label">Your name<input {...field('name', { required: 'Please enter your name.' })} placeholder="Jordan Lee" />{errors.name && <small className="field-error">{errors.name.message}</small>}</label>{watch('role') === 'employer' && <label className="field-label">Company name<input {...field('company', { required: 'Company name is required.' })} placeholder="Your company" />{errors.company && <small className="field-error">{errors.company.message}</small>}</label>}</>}<label className="field-label">Email address<input type="email" autoComplete="email" {...field('email', { required: 'Please enter your email.' })} placeholder="you@example.com" />{errors.email && <small className="field-error">{errors.email.message}</small>}</label><label className="field-label">Password<div className="password-wrap"><input type={show ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} {...field('password', { required: 'Please enter your password.', minLength: register ? { value: 8, message: 'Use at least 8 characters.' } : undefined })} placeholder="At least 8 characters" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)}>{show ? <FiEyeOff /> : <FiEye />}</button></div>{errors.password && <small className="field-error">{errors.password.message}</small>}</label><button disabled={isSubmitting} className="button button-dark button-full">{isSubmitting ? 'One moment…' : register ? 'Create account' : 'Sign in'} <FiArrowUpRight /></button></form><p className="auth-switch">{register ? 'Already have an account?' : 'New around here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p></div></section>;
}
