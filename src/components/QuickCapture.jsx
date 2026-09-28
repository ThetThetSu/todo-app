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
        Tip: add <code>!h</code> for priority, <code>#work</code> for a tag, <code>@friday</code> for a due date.
      </div>
    </div>
  );
});

export default QuickCapture;
