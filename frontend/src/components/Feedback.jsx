export function Loading({ label = 'Loading…' }) { return <div className="feedback">{label}</div>; }
export function ErrorMessage({ children }) { return children ? <div className="alert alert-error" role="alert">{children}</div> : null; }
export function EmptyState({ title, text, action }) { return <div className="empty-state"><span className="empty-icon">✳</span><h3>{title}</h3><p>{text}</p>{action}</div>; }
