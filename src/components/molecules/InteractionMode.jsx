import { Icon } from '../atoms/Icon.jsx';

export function InteractionMode({ mode, onChange }) {
  return (
    <div
      className="interaction-mode"
      role="group"
      aria-label="Cell interaction mode"
    >
      <button
        type="button"
        aria-pressed={mode === 'reveal'}
        onClick={() => onChange('reveal')}
      >
        <Icon name="pointer" size={16} />
        Reveal
      </button>
      <button
        type="button"
        aria-pressed={mode === 'flag'}
        onClick={() => onChange('flag')}
      >
        <Icon name="flag" size={16} />
        Flag
      </button>
    </div>
  );
}
