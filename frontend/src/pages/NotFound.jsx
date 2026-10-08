import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
export default function NotFound() {
  return <section className="page-shell not-found"><span>404 · A LITTLE DETOUR</span><h1>This page took<br /><em>another path.</em></h1><p>Let’s get you somewhere good.</p><Link to="/" className="button button-dark"><FiArrowLeft /> Back to the beginning</Link></section>;
}
