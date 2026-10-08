import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { messageFrom } from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

export default function Saved() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/saved').then(({ data }) => setItems(data.items)).catch(err => setError(messageFrom(err))); }, []);
  return <section className="page-shell list-page"><div className="eyebrow">YOUR SHORTLIST</div><h1>Good ones, <em>saved.</em></h1><p className="page-intro">Keep the possibilities you want to come back to, all in one place.</p><ErrorMessage>{error}</ErrorMessage>{items === null ? <Loading /> : items.length ? <div className="internship-grid">{items.map(item => <InternshipCard key={item._id} internship={item} saved />)}</div> : <EmptyState title="A shortlist starts somewhere" text="Save an opportunity that catches your eye and it’ll be right here when you’re ready." action={<Link className="button button-dark" to="/internships">Explore opportunities</Link>} />}</section>;
}
