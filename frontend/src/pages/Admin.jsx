import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiArrowUpRight, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api, { messageFrom } from '../services/api';
import { ErrorMessage, Loading } from '../components/Feedback';

const blankListing = {
  title: '', company: '', category: 'Software Development', location: '',
  type: 'Remote', duration: '', stipend: '', description: '',
  requirements: '', skills: '', deadline: ''
};
const statuses = ['submitted', 'reviewing', 'interview', 'accepted', 'rejected'];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: blankListing });

  async function loadStats() {
    const { data: result } = await api.get('/admin/stats');
    setStats(result.stats);
  }
  async function loadTab(name = tab) {
    setError('');
    setNotice('');
    const paths = {
      users: '/admin/users', internships: '/admin/internships',
      applications: '/admin/applications', messages: '/admin/messages'
    };
    try {
      if (name === 'overview') return await loadStats();
      const { data: result } = await api.get(paths[name]);
      setData(result.items);
    } catch (err) { setError(messageFrom(err)); }
  }
  useEffect(() => { loadStats().catch(err => setError(messageFrom(err))); }, []);
  useEffect(() => { if (tab !== 'overview') loadTab(tab); }, [tab]);

  async function remove(kind, id, label) {
    if (!window.confirm(`Permanently delete ${label}?`)) return;
    const paths = { users: `/admin/users/${id}`, internships: `/admin/internships/${id}`, messages: `/admin/messages/${id}` };
    try {
      await api.delete(paths[kind]);
      setNotice('Record deleted.');
      await loadTab(kind);
      await loadStats();
    } catch (err) { setError(messageFrom(err)); }
  }
  async function update(path, body) {
    try {
      await api.patch(path, body);
      setNotice('Changes saved.');
      await loadTab(tab);
      await loadStats();
    } catch (err) { setError(messageFrom(err)); }
  }
  function createListing() {
    reset(blankListing);
    setError('');
    setEditing('new');
  }
  function editListing(item) {
    reset({
      ...item,
      requirements: item.requirements?.join('\n') || '',
      skills: item.skills?.join(', ') || '',
      deadline: item.deadline ? item.deadline.slice(0, 10) : ''
    });
    setError('');
    setEditing(item._id);
  }
  async function saveListing(values) {
    const body = {
      ...values,
      requirements: values.requirements.split('\n').map(value => value.trim()).filter(Boolean),
      skills: values.skills.split(',').map(value => value.trim()).filter(Boolean)
    };
    if (!body.deadline) delete body.deadline;
    try {
      if (editing === 'new') await api.post('/admin/internships', body);
      else await api.patch(`/admin/internships/${editing}`, body);
      setEditing(null);
      setNotice('Internship listing saved.');
      await loadTab('internships');
      await loadStats();
    } catch (err) { setError(messageFrom(err)); }
  }

  const tabs = ['overview', 'users', 'internships', 'applications', 'messages'];
  return <section className="page-shell admin-page">
    <div className="eyebrow">A THOUGHTFUL VIEW OF THE WHOLE PICTURE</div>
    <h1>Admin <em>workspace.</em></h1>
    <p className="page-intro">Keep Launchpad useful, kind, and full of good opportunities.</p>
    <ErrorMessage>{error}</ErrorMessage>
    {notice && <div className="alert alert-success">{notice}</div>}
    <div className="admin-tabs">{tabs.map(item =>
      <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
        {item[0].toUpperCase() + item.slice(1)}
      </button>
    )}</div>
    {tab === 'overview' ? stats
      ? <div className="dashboard-cards admin-stats">{Object.entries(stats).map(([key, value]) =>
        <article key={key} className="dashboard-card"><span className="eyebrow">TOTAL {key.toUpperCase()}</span><strong>{value}</strong><small>{key}</small></article>
      )}</div> : <Loading />
      : data === null ? <Loading />
        : tab === 'users' ? <UsersTable data={data} onDelete={person => remove('users', person.id, person.name)} />
          : tab === 'internships' ? <InternshipTable data={data} onAdd={createListing} onEdit={editListing} onDelete={item => remove('internships', item._id, item.title)} />
            : tab === 'applications' ? <ApplicationsTable data={data} onUpdate={update} />
              : <MessagesList data={data} onUpdate={update} onDelete={item => remove('messages', item._id, item.subject)} />}
    {editing && <ListingModal
      editing={editing}
      register={register}
      handleSubmit={handleSubmit}
      saveListing={saveListing}
      isSubmitting={isSubmitting}
      error={error}
      onClose={() => setEditing(null)}
    />}
  </section>;
}

function UsersTable({ data, onDelete }) {
  return <div className="admin-table-wrap"><table className="admin-table">
    <thead><tr><th>Person</th><th>Role</th><th>Company</th><th>Joined</th><th /></tr></thead>
    <tbody>{data.map(person => <tr key={person.id}>
      <td><strong>{person.name}</strong><small>{person.email}</small></td>
      <td><span className="role-pill">{person.role}</span></td>
      <td>{person.company || '—'}</td><td>{new Date(person.createdAt).toLocaleDateString()}</td>
      <td><button className="icon-action danger-action" aria-label="Delete user" onClick={() => onDelete(person)}><FiTrash2 /></button></td>
    </tr>)}</tbody>
  </table>{!data.length && <p className="feedback">No accounts to show.</p>}</div>;
}

function InternshipTable({ data, onAdd, onEdit, onDelete }) {
  return <>
    <div className="admin-list-toolbar"><span>{data.length} listings</span><button className="button button-dark button-small" onClick={onAdd}><FiPlus /> Add internship</button></div>
    <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Opportunity</th><th>Company</th><th>Type</th><th>Posted</th><th>Actions</th></tr></thead>
      <tbody>{data.map(item => <tr key={item._id}>
        <td><strong>{item.title}</strong><small>{item.category}</small></td>
        <td>{item.company}</td><td>{item.type}</td><td>{new Date(item.createdAt).toLocaleDateString()}</td>
        <td className="admin-row-actions">
          <button className="icon-action" title="Edit internship" onClick={() => onEdit(item)}><FiEdit2 /></button>
          <button className="icon-action danger-action" aria-label="Delete internship" onClick={() => onDelete(item)}><FiTrash2 /></button>
        </td>
      </tr>)}</tbody>
    </table>{!data.length && <p className="feedback">No internships to show.</p>}</div>
  </>;
}

function ApplicationsTable({ data, onUpdate }) {
  return <div className="admin-table-wrap"><table className="admin-table">
    <thead><tr><th>Applicant</th><th>Opportunity</th><th>Company</th><th>Status</th><th>Applied</th></tr></thead>
    <tbody>{data.map(app => <tr key={app._id}>
      <td><strong>{app.applicant?.name}</strong><small>{app.applicant?.email}</small></td>
      <td>{app.internship?.title || 'Removed listing'}</td><td>{app.internship?.company || '—'}</td>
      <td><select value={app.status} onChange={event => onUpdate(`/admin/applications/${app._id}/status`, { status: event.target.value })}>
        {statuses.map(status => <option key={status}>{status}</option>)}
      </select></td>
      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
    </tr>)}</tbody>
  </table>{!data.length && <p className="feedback">No applications to show.</p>}</div>;
}

function MessagesList({ data, onUpdate, onDelete }) {
  return <div className="message-list">{data.map(item => <article className="message-card" key={item._id}>
    <div className="message-top"><div>
      <div className="eyebrow">{item.email} · {new Date(item.createdAt).toLocaleDateString()}</div>
      <h3>{item.subject}</h3><span>From {item.name}</span>
    </div><select value={item.status} onChange={event => onUpdate(`/admin/messages/${item._id}`, { status: event.target.value })}>
      {['new', 'read', 'resolved'].map(status => <option key={status}>{status}</option>)}
    </select></div>
    <p>{item.message}</p>
    <div className="message-actions">
      <a className="text-link" href={`mailto:${item.email}?subject=${encodeURIComponent('Re: ' + item.subject)}`}>Reply by email <FiArrowUpRight /></a>
      <button className="icon-action danger-action" title="Delete message" onClick={() => onDelete(item)}><FiTrash2 /></button>
    </div>
  </article>)}{!data.length && <p className="feedback">Your inbox is clear.</p>}</div>;
}

function ListingModal({ editing, register, handleSubmit, saveListing, isSubmitting, error, onClose }) {
  return <div className="modal-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-panel"><div className="modal-head">
      <div><div className="eyebrow">ADMINISTRATION</div><h2>{editing === 'new' ? 'Add internship' : 'Edit internship'}</h2></div>
      <button className="icon-action" onClick={onClose}><FiX /></button>
    </div>
      <ErrorMessage>{error}</ErrorMessage>
      <form className="listing-form" onSubmit={handleSubmit(saveListing)}>
        <div className="field-grid">
          <label className="field-label">Role title<input {...register('title', { required: true })} required maxLength="140" /></label>
          <label className="field-label">Company<input {...register('company', { required: true })} required maxLength="120" /></label>
          <label className="field-label">Category<input {...register('category', { required: true })} required /></label>
          <label className="field-label">Location<input {...register('location', { required: true })} required /></label>
          <label className="field-label">Type<select {...register('type')}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
          <label className="field-label">Duration<input {...register('duration', { required: true })} required /></label>
          <label className="field-label">Stipend<input {...register('stipend')} /></label>
          <label className="field-label">Deadline<input type="date" {...register('deadline')} /></label>
        </div>
        <label className="field-label">Description<textarea {...register('description', { required: true })} required rows="4" maxLength="10000" /></label>
        <label className="field-label">Requirements <small>One per line</small><textarea {...register('requirements')} rows="3" /></label>
        <label className="field-label">Skills <small>Comma-separated</small><input {...register('skills')} /></label>
        <div className="modal-footer">
          <button type="button" className="button button-outline" onClick={onClose}>Cancel</button>
          <button className="button button-dark" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save listing'} <FiArrowUpRight /></button>
        </div>
      </form>
    </div>
  </div>;
}
