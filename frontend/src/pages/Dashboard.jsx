import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiBookmark, FiBriefcase, FiFileText, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ErrorMessage, Loading } from '../components/Feedback';
import { messageFrom } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    setError('');
    if (user?.role === 'user') {
      Promise.all([api.get('/applications/mine'), api.get('/saved')])
        .then(([apps, saved]) => setSummary({ applications: apps.data.items, saved: saved.data.items }))
        .catch(err => setError(messageFrom(err))).finally(() => setLoading(false));
    } else if (user?.role === 'employer') {
      api.get('/internships/mine').then(({ data }) => setSummary({ listings: data.items }))
        .catch(err => setError(messageFrom(err))).finally(() => setLoading(false));
    } else {
      api.get('/admin/stats').then(({ data }) => setSummary(data.stats))
        .catch(err => setError(messageFrom(err))).finally(() => setLoading(false));
    }
  }, [user]);
  if (loading) return <Loading label="Loading your dashboard…" />;
  if (error) return <section className="page-shell dashboard-page"><div className="eyebrow">YOUR LAUNCHPAD</div><h1>Something got <em>in the way.</em></h1><ErrorMessage>{error}</ErrorMessage><button className="button button-outline" onClick={() => window.location.reload()}>Try again</button></section>;
  if (!summary) return <section className="page-shell"><ErrorMessage>Dashboard information is unavailable.</ErrorMessage></section>;
  const employer = user?.role === 'employer';
  const admin = user?.role === 'admin';
  return <section className="page-shell dashboard-page"><div className="dashboard-welcome"><div><div className="eyebrow">{admin ? 'YOUR CONTROL ROOM' : employer ? 'YOUR EMPLOYER STUDIO' : 'YOUR LAUNCHPAD'}</div><h1>Hi, {user?.name?.split(' ')[0]}. <em>Good to see you.</em></h1><p>{employer ? 'Build a team, one good beginning at a time.' : admin ? 'A clear view of what’s happening across Launchpad.' : 'Your next chapter is taking shape. Keep going.'}</p></div><Link to={employer ? '/employer' : admin ? '/admin' : '/profile'} className="button button-dark">{employer ? 'Manage listings' : admin ? 'Open admin panel' : 'Edit profile'} <FiArrowUpRight /></Link></div>
    {employer ? <div className="dashboard-cards"><Link to="/employer" className="dashboard-card"><span className="dash-icon"><FiBriefcase /></span><strong>{summary.listings.length}</strong><small>Internship listings</small><span className="text-link">Manage opportunities <FiArrowUpRight /></span></Link><Link to="/employer" className="dashboard-card"><span className="dash-icon"><FiFileText /></span><strong>→</strong><small>Applicants are waiting</small><span className="text-link">Review applicants <FiArrowUpRight /></span></Link></div>
      : admin ? <div className="dashboard-cards">{Object.entries(summary).map(([key, value]) => <Link to="/admin" key={key} className="dashboard-card"><span className="dash-icon"><FiBriefcase /></span><strong>{value}</strong><small>{key[0].toUpperCase() + key.slice(1)}</small><span className="text-link">Manage <FiArrowUpRight /></span></Link>)}</div>
        : <><div className="dashboard-cards"><Link to="/applications" className="dashboard-card"><span className="dash-icon"><FiFileText /></span><strong>{summary.applications.length}</strong><small>Applications in motion</small><span className="text-link">Track your applications <FiArrowUpRight /></span></Link><Link to="/saved" className="dashboard-card"><span className="dash-icon"><FiBookmark /></span><strong>{summary.saved.length}</strong><small>Saved for later</small><span className="text-link">See your shortlist <FiArrowUpRight /></span></Link><Link to="/profile" className="dashboard-card"><span className="dash-icon"><FiUser /></span><strong>{user?.hasResume ? 'Ready' : 'A little more'}</strong><small>Profile and resume</small><span className="text-link">Make it yours <FiArrowUpRight /></span></Link></div>
          <div className="dashboard-next"><div><div className="eyebrow">A LITTLE MOMENTUM GOES A LONG WAY</div><h2>One more good<br /><em>thing is out there.</em></h2><p>Keep exploring. The right opportunity might be one click away.</p><Link className="button button-dark" to="/internships">Explore internships <FiArrowUpRight /></Link></div><div className="dashboard-sun">✳</div></div></>}
  </section>;
}
