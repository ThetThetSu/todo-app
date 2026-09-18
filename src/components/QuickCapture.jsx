import { forwardRef, useState } from 'react';
import { parseQuickCapture } from '../utils/quickParse';

const QuickCapture = forwardRef(function QuickCapture({ onAdd }, ref) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    const parsed = parseQuickCapture(text);
    if (!parsed.title) return;
    onAdd(parsed);
    setText('');
  }

  return (
    <div>
      <form className="quick-capture glass" onSubmit={submit}>
        <span className="plus">+</span>
        <input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task… try “Ship deck !h #work @friday”"
        />
        <button type="submit" className={`submit ${text.trim() ? 'ready' : ''}`}>
          Add
        </button>
      </form>
      <div className="quick-capture-hint">
        <code>!h</code>/<code>!m</code>/<code>!l</code> priority · <code>#tag</code> category ·{' '}
        <code>@tomorrow</code> due date
      </div>
    </div>
  );
});

export default QuickCapture;
