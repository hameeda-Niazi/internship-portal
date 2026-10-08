import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiClock, FiMapPin } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

const statusClass = status => `status-pill status-${status}`;
export default function Applications() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/applications/mine').then(({ data }) => setItems(data.items)).catch(err => setError(messageFrom(err))); }, []);
  return <section className="page-shell list-page"><div className="eyebrow">KEEP AN EYE ON YOUR NEXT</div><h1>My <em>applications.</em></h1><p className="page-intro">Every first step adds up. Here’s where yours are.</p><ErrorMessage>{error}</ErrorMessage>{items === null ? <Loading /> : items.length ? <div className="application-list">{items.map(application => <article className="application-row" key={application._id}><div className="company-avatar">{application.internship?.company?.[0] || '✳'}</div><div className="application-main"><span className="card-company">{application.internship?.company || 'Opportunity closed'}</span><h3>{application.internship?.title || 'Internship listing removed'}</h3><div className="application-meta">{application.internship && <><span><FiMapPin />{application.internship.location}</span><span><FiClock />{application.internship.duration}</span></>}<span>Applied {new Date(application.createdAt).toLocaleDateString()}</span></div></div><span className={statusClass(application.status)}>{application.status}</span>{application.internship && <Link className="row-arrow" to={`/internships/${application.internship._id}`} aria-label="View internship"><FiArrowUpRight /></Link>}</article>)}</div> : <EmptyState title="Your story starts with an application" text="Explore opportunities that feel right, then take that first step." action={<Link className="button button-dark" to="/internships">Browse internships <FiArrowUpRight /></Link>} />}</section>;
}
