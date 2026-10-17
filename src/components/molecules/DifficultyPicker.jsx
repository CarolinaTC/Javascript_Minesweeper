import { DIFFICULTIES } from '../../game/engine.js';
import { Icon } from '../atoms/Icon.jsx';

export function DifficultyPicker({ value, onChange }) {
  return (
    <div className="difficulty">
      <label htmlFor="difficulty">Difficulty</label>
      <div className="difficulty__select">
        <span
          className={`difficulty__bars difficulty__bars--${value}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
        <select
          id="difficulty"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {Object.entries(DIFFICULTIES).map(([key, level]) => (
            <option key={key} value={key}>
              {level.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" size={16} />
      </div>
    </div>
  );
}
