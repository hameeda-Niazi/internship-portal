import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import InternshipCard from '../components/InternshipCard';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(Number(params.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const { user } = useAuth();
  const [draft, setDraft] = useState({ q: params.get('q') || '', category: params.get('category') || '', location: '', duration: '', type: '', sort: 'newest' });
  async function load(next = draft, currentPage = page) {
    setLoading(true); setError('');
    try {
      const query = { ...Object.fromEntries(Object.entries(next).filter(([, value]) => value)), page: currentPage };
      const { data } = await api.get('/internships', { params: query });
      setItems(data.items); setPagination(data.pagination);
    } catch (err) { setError(messageFrom(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    const initial = {
      q: params.get('q') || '',
      category: params.get('category') || '',
      location: params.get('location') || '',
      duration: params.get('duration') || '',
      type: params.get('type') || '',
      sort: params.get('sort') || 'newest'
    };
    const currentPage = Math.max(1, Number(params.get('page')) || 1);
    setDraft(initial);
    setPage(currentPage);
    load(initial, currentPage);
  }, [params]);
  useEffect(() => {
    if (user?.role !== 'user') { setSavedIds(new Set()); return; }
    api.get('/saved').then(({ data }) => setSavedIds(new Set(data.items.map(item => item._id))))
      .catch(err => setError(messageFrom(err)));
  }, [user]);
  function change(event) { setDraft({ ...draft, [event.target.name]: event.target.value }); }
  function submit(event) { event.preventDefault(); setParams(Object.fromEntries(Object.entries(draft).filter(([, v]) => v))); }
  function clearFilters() {
    setDraft({ q: '', category: '', location: '', duration: '', type: '', sort: 'newest' });
    setParams({});
  }
  function goToPage(nextPage) {
    const values = Object.fromEntries(Object.entries(draft).filter(([, value]) => value));
    if (nextPage > 1) values.page = String(nextPage);
    setParams(values);
  }
  return <section className="page-shell browse-page"><div className="browse-head"><div><div className="eyebrow">YOUR NEXT THING IS OUT THERE</div><h1>Find a place to <em>begin.</em></h1><p>Real opportunities for people ready to learn by doing.</p></div><div className="browse-count">{pagination?.total ?? '—'} <span>open roles</span></div></div>
    <form className="filter-panel" onSubmit={submit}><label className="filter-search"><FiSearch /><input name="q" placeholder="Try a role, skill, or company" value={draft.q} onChange={change} /></label><label><span>Category</span><select name="category" value={draft.category} onChange={change}><option value="">All categories</option>{['Software Development', 'Web Development', 'Design', 'Data & AI', 'Marketing'].map(item => <option key={item}>{item}</option>)}</select></label><label><span>Location</span><input name="location" placeholder="Anywhere" value={draft.location} onChange={change} /></label><label><span>Type</span><select name="type" value={draft.type} onChange={change}><option value="">Any type</option>{['Remote', 'Hybrid', 'On-site'].map(item => <option key={item}>{item}</option>)}</select></label><label><span>Duration</span><input name="duration" placeholder="e.g. 3 months" value={draft.duration} onChange={change} /></label><label><span>Sort by</span><select name="sort" value={draft.sort} onChange={change}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><button className="button button-dark filter-submit"><FiSliders /> Apply filters</button></form>
    {['q', 'category', 'location', 'duration', 'type'].some(key => params.get(key)) && <button type="button" className="text-link clear-filters" onClick={clearFilters}>Clear filters</button>}
    <ErrorMessage>{error}</ErrorMessage>{loading ? <Loading label="Finding your next opportunity…" /> : items.length ? <><div className="internship-grid browse-grid">{items.map(item => <InternshipCard key={item._id} internship={item} saved={savedIds.has(item._id)} />)}</div><div className="pagination"><p>Showing {items.length} of {pagination?.total} opportunities</p>{pagination?.pages > 1 && <div><button className="button button-outline button-small" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</button><span>Page {page} of {pagination.pages}</span><button className="button button-outline button-small" disabled={page >= pagination.pages} onClick={() => goToPage(page + 1)}>Next</button></div>}</div></> : <EmptyState title="Nothing quite fits yet" text="Try widening your search or clearing a filter to see more opportunities." action={<button className="button button-outline" onClick={clearFilters}>Clear filters</button>} />}</section>;
}
