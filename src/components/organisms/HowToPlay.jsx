import { Icon } from '../atoms/Icon.jsx';

export function HowToPlay() {
  return (
    <>
      <div className="mini-board" aria-hidden="true">
        {['', '', '', '', '1', '1', '', '1', 'flag'].map((value, index) => (
          <span key={index} className={value ? 'mini-board__open' : ''}>
            {value === 'flag' ? <Icon name="flag" size={22} /> : value}
          </span>
        ))}
      </div>
      <span className="eyebrow">THE FIELD MANUAL</span>
      <h2>
        One cell
        <br />
        at a time.
      </h2>
      <p className="how-to__intro">
        A little logic.
        <br />A touch of intuition.
      </p>
      <ol className="rules-list">
        <li>
          <span className="rule-icon">
            <Icon name="pointer" />
          </span>
          <div>
            <h3>Explore the field</h3>
            <p>Click a cell to uncover it. Your first click is always safe.</p>
          </div>
        </li>
        <li>
          <span className="rule-icon rule-icon--number">1</span>
          <div>
            <h3>Read the numbers</h3>
            <p>
              Each number tells you how many mines are in the 8 surrounding
              cells.
            </p>
          </div>
        </li>
        <li>
          <span className="rule-icon">
            <Icon name="flag" />
          </span>
          <div>
            <h3>Trust the clues</h3>
            <p>Right-click to flag mines. Uncover every safe cell to win.</p>
          </div>
        </li>
      </ol>
    </>
  );
}
