import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowUpRight, FiBookmark, FiClock, FiMapPin } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage, Loading } from '../components/Feedback';

export default function Details() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  useEffect(() => { api.get(`/internships/${id}`).then(({ data }) => setItem(data.internship)).catch(err => setError(messageFrom(err))); }, [id]);
  async function save() {
    if (!user) return setError('Please sign in to save internships.');
    try { const { data } = await api.put(`/saved/${id}`); setSaved(data.saved); } catch (err) { setError(messageFrom(err)); }
  }
  async function apply(event) {
    event.preventDefault(); setError(''); setNotice('');
    const note = coverLetter.trim();
    if (!note) { setError('Please add a short note before submitting your application.'); return; }
    if (note.length > 5000) { setError('Your note must be 5,000 characters or fewer.'); return; }
    setApplying(true);
    try {
      await api.post(`/applications/${id}`, { coverLetter: note });
      setApplied(true);
      setNotice('Application submitted successfully. You can follow its progress in My applications.');
    } catch (err) {
      setError(messageFrom(err));
      if (err.response?.status === 409) setApplied(true);
    } finally { setApplying(false); }
  }
  if (!item && !error) return <Loading label="Loading opportunity…" />;
  if (!item) return <section className="page-shell"><ErrorMessage>{error}</ErrorMessage><Link className="text-link" to="/internships"><FiArrowLeft /> Back to internships</Link></section>;
  return <section className="page-shell detail-page"><Link className="back-link" to="/internships"><FiArrowLeft /> All internships</Link><div className="detail-layout"><article className="detail-main"><div className="detail-company"><div className="company-avatar avatar-large">{item.company[0]}</div><div><span className="eyebrow">{item.company}</span><p>{item.location}</p></div></div><h1>{item.title}</h1><div className="detail-tags"><span>{item.category}</span><span>{item.type}</span></div><div className="detail-meta"><span><FiMapPin />{item.location}</span><span><FiClock />{item.duration}</span><strong>{item.stipend}</strong></div><hr /><h2>About this opportunity</h2><p className="detail-description">{item.description}</p>{item.requirements?.length > 0 && <><h2>What you’ll bring</h2><ul className="requirements">{item.requirements.map(text => <li key={text}>{text}</li>)}</ul></>}{item.skills?.length > 0 && <><h2>Skills you’ll use</h2><div className="skill-list">{item.skills.map(skill => <span key={skill}>{skill}</span>)}</div></>}</article><aside className="apply-card"><span className="apply-kicker">A GOOD PLACE TO START</span><h3>Could this be your next thing?</h3><p>Take the first step and tell the team a little about yourself.</p><ErrorMessage>{error}</ErrorMessage>{notice && <div className="alert alert-success">{notice}</div>}{user?.role === 'user' ? applied ? <Link className="button button-dark button-full" to="/applications">View my applications <FiArrowUpRight /></Link> : <form onSubmit={apply}><label className="field-label">A short note <textarea required rows="5" maxLength="5000" placeholder="What interests you about this opportunity?" value={coverLetter} onChange={event => setCoverLetter(event.target.value)} /></label><button type="button" onClick={apply} disabled={applying} className="button button-dark button-full">{applying ? 'Submitting…' : 'Apply now'} <FiArrowUpRight /></button></form> : user ? <p className="muted">Sign in with a candidate account to apply.</p> : <Link to="/login" className="button button-dark button-full">Sign in to apply <FiArrowUpRight /></Link>}<button type="button" className="button button-outline button-full save-detail" onClick={save}><FiBookmark /> {saved ? 'Saved' : 'Save for later'}</button><small>Posted {new Date(item.createdAt).toLocaleDateString()}</small></aside></div></section>;
}
