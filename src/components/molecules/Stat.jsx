import { Icon } from '../atoms/Icon.jsx';

export function Stat({ icon, label, value, accent = false }) {
  return (
    <div className={`stat ${accent ? 'stat--accent' : ''}`}>
      <span className="stat__icon">
        <Icon name={icon} size={21} />
      </span>
      <div>
        <span className="stat__label">{label}</span>
        <span className="stat__value">{value}</span>
      </div>
    </div>
  );
}
