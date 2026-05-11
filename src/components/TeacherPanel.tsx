// 老師請注意：學習角落的文字內容請至
// src/data/teachingNotes.ts 修改。

import { TEACHING_NOTES } from '../data/teachingNotes';
import './TeacherPanel.css';

export function TeacherPanel() {
  return (
    <section className="teacher-panel" aria-label="學習角落">
      <header className="teacher-panel-header">
        <h2 className="teacher-panel-title">📚 學習角落</h2>
        <p className="teacher-panel-intro">
          點擊下方任何問題查看答案，非常適合課堂討論！
        </p>
      </header>

      <div className="teacher-notes">
        {TEACHING_NOTES.map((note, i) => (
          <details key={i} className="teacher-note">
            <summary className="teacher-note-summary">
              <span className="teacher-note-icon" aria-hidden="true">
                {note.icon}
              </span>
              <span className="teacher-note-heading">{note.title}</span>
            </summary>

            <div className="teacher-note-body">
              <p className="teacher-note-text">{note.body}</p>
              {note.funFact && (
                <p className="teacher-note-fact">
                  <span aria-hidden="true">💡</span>
                  <span>{note.funFact}</span>
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
