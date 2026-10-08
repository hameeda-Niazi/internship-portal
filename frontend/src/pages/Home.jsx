import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight, FiSearch, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';
import api from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { ErrorMessage, Loading } from '../components/Feedback';
import { messageFrom } from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  ['✳', 'Engineering', 'Build the future'], ['◒', 'Design', 'Make it meaningful'],
  ['↗', 'Marketing', 'Tell better stories'], ['⌘', 'Data & AI', 'Find the signal']
];
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedError, setSavedError] = useState('');
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    api.get('/internships/featured')
      .then(({ data }) => setFeatured(data.items))
      .catch(err => setError(messageFrom(err)))
      .finally(() => setLoading(false));
    api.get('/internships/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);
  useEffect(() => {
    if (user?.role !== 'user') { setSavedIds(new Set()); return; }
    api.get('/saved').then(({ data }) => setSavedIds(new Set(data.items.map(item => item._id))))
      .catch(err => setSavedError(messageFrom(err)));
  }, [user]);
  function search(event) { event.preventDefault(); navigate(`/internships?q=${encodeURIComponent(query)}`); }
  return <>
    <section className="hero"><div className="hero-inner"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> GOOD THINGS START SOMEWHERE</div><h1>Your first step<br />starts <em>right here.</em></h1><p>Find an internship that gives your ambition somewhere to grow. Real teams, real work, real beginnings.</p>
      <form className="hero-search" onSubmit={search}><FiSearch /><input aria-label="Search internships" placeholder="Role, company, or skill" value={query} onChange={event => setQuery(event.target.value)} /><button className="button button-dark">Find your fit <FiArrowUpRight /></button></form>
      <div className="hero-proof"><div className="avatar-stack"><i>A</i><i>M</i><i>S</i><i>+</i></div><span><strong>{stats?.openRoles ?? '—'}</strong> open opportunities</span></div></div>
      <div className="hero-art"><div className="hero-blob"><span className="sparkle">✳</span><div className="floating-note note-one"><span>✦</span><div><b>Good match!</b><small>Based on your skills</small></div></div><div className="floating-note note-two"><div className="mini-company">B</div><div><b>Product Design Intern</b><small>Brightside Labs · Remote</small></div><span className="note-arrow"><FiArrowUpRight /></span></div><div className="sun-shape" /><div className="plant-shape">✺</div><span className="art-caption">make room for what’s next</span></div></div>
    </div><a className="hero-scroll" href="#explore"><FiArrowDownRight /> SCROLL TO EXPLORE</a></section>
    <section className="section section-categories" id="explore"><div className="section-heading"><div><div className="eyebrow">A PLACE TO BEGIN</div><h2>Find your kind<br />of <em>opportunity.</em></h2></div><Link className="text-link" to="/internships">Explore all internships <FiArrowUpRight /></Link></div><div className="category-grid">{categories.map(([icon, name, caption]) => <Link className="category-card" key={name} to={`/internships?category=${encodeURIComponent(name === 'Engineering' ? 'Software Development' : name)}`}><span className="category-icon">{icon}</span><h3>{name}</h3><p>{caption}</p><FiArrowUpRight className="category-arrow" /></Link>)}</div></section>
    <section className="section featured-section"><div className="section-heading"><div><div className="eyebrow">FRESH OPPORTUNITIES</div><h2>A few good places<br />to <em>get started.</em></h2></div><Link className="text-link" to="/internships">See every role <FiArrowUpRight /></Link></div><ErrorMessage>{error || savedError}</ErrorMessage>{loading ? <Loading label="Finding fresh opportunities…" /> : featured.length ? <div className="internship-grid">{featured.slice(0, 3).map(item => <InternshipCard key={item._id} internship={item} saved={savedIds.has(item._id)} />)}</div> : !error && <p className="feedback">New opportunities are on the way. Check back soon.</p>}</section>
    <section className="process-section"><div className="section process-wrap"><div className="process-intro"><div className="eyebrow">NO SECRET HANDSHAKE REQUIRED</div><h2>Three small steps.<br /><em>Big possibilities.</em></h2><p>Getting started shouldn’t feel like a job in itself. We make it simple to find a place where you can do your best learning.</p><Link className="button button-dark" to="/register">Start your journey <FiArrowUpRight /></Link></div><div className="steps"><article><span>01</span><div><h3>Find your thing</h3><p>Explore thoughtful opportunities that meet you where you are.</p></div><FiSearch /></article><article><span>02</span><div><h3>Put yourself out there</h3><p>Build your profile, share your story, and apply in a few clicks.</p></div><FiUsers /></article><article><span>03</span><div><h3>Make it happen</h3><p>Connect with teams who are excited to help you grow.</p></div><FiTrendingUp /></article></div></div></section>
    <section className="why-section"><div className="section why-wrap"><div className="why-art"><div className="why-disc">YOUR NEXT<br />CHAPTER<br /><b>↗</b></div><span>Curiosity looks good on you.</span></div><div><div className="eyebrow">A BETTER WAY TO BEGIN</div><h2>First steps,<br /><em>without the noise.</em></h2><p className="section-copy">We believe early careers deserve more than endless applications and vague promises. Launchpad brings people and teams together around the things that matter: learning, doing, and growing.</p><div className="why-points"><span><FiZap /> Opportunities from real teams</span><span><FiZap /> Clear details, no guesswork</span><span><FiZap /> A little more human, always</span></div><Link className="text-link" to="/about">More about us <FiArrowUpRight /></Link></div></div></section>
    <section className="stat-strip"><div><strong>{stats?.openRoles ?? '—'}</strong><small>Open opportunities</small></div><div><strong>{stats?.hiringTeams ?? '—'}</strong><small>Teams hiring</small></div><div><strong>{stats?.applications ?? '—'}</strong><small>Applications sent</small></div><div><strong>{stats?.categories ?? '—'}</strong><small>Fields to explore</small></div></section>
    <section className="cta-section"><div className="cta-card"><div><div className="eyebrow">YOUR NEXT CHAPTER IS OUT THERE</div><h2>Ready when<br />you <em>are.</em></h2><p>One profile. A world of possibilities. Your first step is closer than you think.</p><Link className="button button-light" to="/register">Let’s get started <FiArrowUpRight /></Link></div><div className="cta-mark">✳</div></div></section>
  </>;
}
