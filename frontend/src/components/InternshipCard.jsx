import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiBookmark, FiMapPin, FiClock } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InternshipCard({ internship, saved: initialSaved = false }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState('');
  useEffect(() => setSaved(initialSaved), [initialSaved, internship._id]);
  async function toggle() {
    if (!user) { window.location.href = '/login'; return; }
    if (user.role !== 'user') { setError('Only candidate accounts can save internships.'); return; }
    try { const { data } = await api.put(`/saved/${internship._id}`); setSaved(data.saved); setError(''); }
    catch (err) { setError(messageFrom(err)); }
  }
  return <article className="internship-card">
    <div className="card-top"><div className="company-avatar">{internship.company?.slice(0, 1).toUpperCase() || '✳'}</div><span className="posted">{new Date(internship.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><button className={`save-button ${saved ? 'is-saved' : ''}`} onClick={toggle} aria-label={saved ? 'Unsave internship' : 'Save internship'}><FiBookmark fill={saved ? 'currentColor' : 'none'} /></button></div>
    <p className="card-company">{internship.company}</p>
    <h3><Link to={`/internships/${internship._id}`}>{internship.title}</Link></h3>
    <div className="card-tags"><span>{internship.category}</span><span>{internship.type}</span></div>
    <div className="card-meta"><span><FiMapPin />{internship.location}</span><span><FiClock />{internship.duration}</span></div>
    <div className="card-bottom"><strong>{internship.stipend || 'Compensation discussed'}</strong><Link className="card-link" to={`/internships/${internship._id}`}>Details <FiArrowUpRight /></Link></div>
    {error && <p className="inline-error">{error}</p>}
  </article>;
}
