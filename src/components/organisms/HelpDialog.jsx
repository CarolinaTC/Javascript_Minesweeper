import { useEffect, useRef } from 'react';
import { Button } from '../atoms/Button.jsx';
import { Icon } from '../atoms/Icon.jsx';

export function HelpDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="help-dialog"
      aria-labelledby="help-title"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = ref.current.querySelectorAll('button');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="help-dialog__content">
        <Button
          variant="icon"
          aria-label="Close help"
          className="help-dialog__close"
          onClick={onClose}
        >
          <Icon name="close" />
        </Button>
        <span className="eyebrow">THE RULES OF THE GAME</span>
        <h2 id="help-title">
          Follow the clues.
          <br />
          Avoid the mines.
        </h2>
        <p>
          Uncover every cell that does not contain a mine. Flags help you keep
          track, but you do not need to place them all to win.
        </p>
        <ul className="help-list">
          <li>
            <strong>Click or tap</strong>
            <span>
              Uncover a cell. Your first click always opens a safe area.
            </span>
          </li>
          <li>
            <strong>Right-click or F</strong>
            <span>
              Place or remove a flag. On mobile, choose Flag before tapping a
              cell.
            </span>
          </li>
          <li>
            <strong>Click a revealed number</strong>
            <span>
              Open the surrounding cells when the number of adjacent flags
              matches the clue. An incorrect flag can cost you the game!
            </span>
          </li>
          <li>
            <strong>Arrow keys</strong>
            <span>
              Move around the board. Press Enter or Space to reveal a cell and F
              to toggle a flag.
            </span>
          </li>
        </ul>
        <div className="help-note">
          <Icon name="shield" />
          <span>
            The timer starts with your first reveal and stops when you win or
            lose. Your best times are saved in this browser.
          </span>
        </div>
        <Button onClick={onClose}>
          Let’s play <Icon name="arrow" size={17} />
        </Button>
      </div>
    </dialog>
  );
}
