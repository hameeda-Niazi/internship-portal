import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowUpRight, FiEdit2, FiFileText, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';

const blank = { title: '', company: '', category: 'Software Development', location: '', type: 'Remote', duration: '', stipend: '', description: '', requirements: '', skills: '', deadline: '', companyWebsite: '' };
export default function Employer() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [applicantsFor, setApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: blank });
  async function load() { try { const { data } = await api.get('/internships/mine'); setItems(data.items); } catch (err) { setError(messageFrom(err)); } }
  useEffect(() => { load(); }, []);
  function startCreate() { setEditing('new'); reset(blank); setError(''); }
  function startEdit(item) {
    setEditing(item._id);
    reset({ ...item, requirements: item.requirements?.join('\n') || '', skills: item.skills?.join(', ') || '', deadline: item.deadline ? item.deadline.slice(0, 10) : '' });
    setError('');
  }
  async function submit(values) {
    setError('');
    const body = { ...values, requirements: values.requirements.split('\n').map(x => x.trim()).filter(Boolean), skills: values.skills.split(',').map(x => x.trim()).filter(Boolean) };
    if (!body.deadline) delete body.deadline;
    try {
      if (editing === 'new') await api.post('/internships', body);
      else await api.patch(`/internships/${editing}`, body);
      setEditing(null); setNotice('Your opportunity has been saved.'); await load();
    } catch (err) { setError(messageFrom(err)); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete "${item.title}" and its applications?`)) return;
    try { await api.delete(`/internships/${item._id}`); setNotice('Listing deleted.'); await load(); }
    catch (err) { setError(messageFrom(err)); }
  }
  async function showApplicants(item) {
    setError('');
    try { const { data } = await api.get(`/applications/internship/${item._id}`); setApplicants(data.items); setApplicantsFor(item); }
    catch (err) { setError(messageFrom(err)); }
  }
  async function updateStatus(id, status) {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setApplicants(current => current.map(item => item._id === id ? { ...item, status } : item));
    } catch (err) { setError(messageFrom(err)); }
  }
  if (!items && !error) return <section className="page-shell"><Loading /></section>;
  if (!items) return <section className="page-shell"><ErrorMessage>{error}</ErrorMessage><button className="button button-outline" onClick={() => { setError(''); load(); }}>Try again</button></section>;
  return <section className="page-shell employer-page"><div className="dashboard-welcome"><div><div className="eyebrow">EMPLOYER STUDIO</div><h1>Make room for <em>new talent.</em></h1><p>Manage your listings and meet the people excited to grow with you.</p></div><button className="button button-dark" onClick={startCreate}><FiPlus /> Post an internship</button></div><ErrorMessage>{error}</ErrorMessage>{notice && <div className="alert alert-success">{notice}</div>}
    {items.length ? <div className="employer-list">{items.map(item => <article className="employer-row" key={item._id}><div className="company-avatar">{item.company?.[0]}</div><div className="employer-row-main"><span className="card-company">{item.company} · {item.type}</span><h3>{item.title}</h3><span className="muted">{item.location} · {item.duration} · {item.stipend}</span></div><div className="employer-actions"><button className="button button-outline button-small" onClick={() => showApplicants(item)}><FiFileText /> Applicants</button><button className="icon-action" title="Edit listing" onClick={() => startEdit(item)}><FiEdit2 /></button><button className="icon-action danger-action" title="Delete listing" onClick={() => remove(item)}><FiTrash2 /></button></div></article>)}</div> : <EmptyState title="Your first listing is a big deal" text="Create an opportunity and meet people ready to learn alongside your team." action={<button className="button button-dark" onClick={startCreate}>Post an internship</button>} />}
    {editing && <div className="modal-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setEditing(null); }}><div className="modal-panel"><div className="modal-head"><div><div className="eyebrow">{editing === 'new' ? 'A NEW BEGINNING' : 'MAKE IT EVEN BETTER'}</div><h2>{editing === 'new' ? 'Post an opportunity' : 'Edit your listing'}</h2></div><button className="icon-action" onClick={() => setEditing(null)}><FiX /></button></div><ErrorMessage>{error}</ErrorMessage><form className="listing-form" onSubmit={handleSubmit(submit)}><div className="field-grid"><label className="field-label">Role title<input {...register('title', { required: true })} required maxLength="140" /></label><label className="field-label">Company<input {...register('company', { required: true })} required maxLength="120" /></label><label className="field-label">Category<input {...register('category', { required: true })} required /></label><label className="field-label">Location<input {...register('location', { required: true })} required /></label><label className="field-label">Type<select {...register('type')}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label><label className="field-label">Duration<input {...register('duration', { required: true })} required placeholder="3 months" /></label><label className="field-label">Stipend<input {...register('stipend')} placeholder="₹15,000 / month" /></label><label className="field-label">Application deadline<input type="date" {...register('deadline')} /></label></div><label className="field-label">Description<textarea {...register('description', { required: true })} required rows="5" maxLength="10000" /></label><label className="field-label">Requirements <small>One per line</small><textarea {...register('requirements')} rows="3" /></label><label className="field-label">Skills <small>Comma-separated</small><input {...register('skills')} /></label><label className="field-label">Company website<input type="url" {...register('companyWebsite')} /></label><div className="modal-footer"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button disabled={isSubmitting} className="button button-dark">{isSubmitting ? 'Saving…' : 'Save opportunity'} <FiArrowUpRight /></button></div></form></div></div>}
    {applicantsFor && <div className="modal-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setApplicantsFor(null); }}><div className="modal-panel"><div className="modal-head"><div><div className="eyebrow">PEOPLE WHO RAISED THEIR HAND</div><h2>Applicants · {applicantsFor.title}</h2></div><button className="icon-action" onClick={() => setApplicantsFor(null)}><FiX /></button></div>{applicants.length ? <div className="applicant-list">{applicants.map(app => <article className="applicant-card" key={app._id}><div className="applicant-heading"><div><h3>{app.applicant?.name}</h3><a href={`mailto:${app.applicant?.email}`}>{app.applicant?.email}</a></div><select aria-label={`Status for ${app.applicant?.name}`} value={app.status} onChange={event => updateStatus(app._id, event.target.value)}>{['submitted', 'reviewing', 'interview', 'accepted', 'rejected'].map(status => <option key={status}>{status}</option>)}</select></div>{app.applicant?.headline && <p>{app.applicant.headline}</p>}{app.applicant?.bio && <p>{app.applicant.bio}</p>}{app.coverLetter && <blockquote>{app.coverLetter}</blockquote>}{app.applicant?.skills?.length > 0 && <div className="skill-list">{app.applicant.skills.map(skill => <span key={skill}>{skill}</span>)}</div>}<small>Applied {new Date(app.createdAt).toLocaleDateString()}</small><a className="text-link" href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${app.applicant?._id}/resume`} onClick={event => { event.preventDefault(); api.get(`/users/${app.applicant?._id}/resume`, { responseType: 'blob' }).then(({ data }) => { const link = document.createElement('a'); link.href = URL.createObjectURL(data); link.download = 'applicant-resume'; link.click(); URL.revokeObjectURL(link.href); }).catch(err => setError(messageFrom(err))); }}>Download resume <FiArrowUpRight /></a></article>)}</div> : <EmptyState title="The right people will find you" text="No applications just yet. Share your listing to help it find its people." />}</div></div>}
  </section>;
}
