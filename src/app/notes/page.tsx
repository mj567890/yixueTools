'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('yixue-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('yixue-notes', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    saveNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim()) return;
    const updated = notes.map((n) =>
      n.id === editingId
        ? { ...n, title: title.trim(), content: content.trim(), updatedAt: new Date().toISOString() }
        : n,
    );
    saveNotes(updated);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此笔记？')) {
      saveNotes(notes.filter((n) => n.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setTitle('');
        setContent('');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title text-2xl mb-2">我的笔记</h1>
      {/* text-sm→text-base(16px) */}
      <p className="text-base text-[var(--color-ink-light)] mb-6">
        所有笔记数据存储在本地浏览器中，不会上传服务器
      </p>

      {/* 编辑区 */}
      <div className="card-chinese p-5 mb-6">
        {/* text-sm→form-input(16px) */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="form-input w-full mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你的易学心得..."
          rows={5}
          className="form-input w-full mb-3 resize-y"
        />
        <div className="flex gap-2">
          {editingId ? (
            <>
              <button onClick={handleUpdate} className="btn-primary">保存修改</button>
              <button onClick={handleCancel} className="btn-outline">取消</button>
            </>
          ) : (
            <button onClick={handleAdd} className="btn-primary">添加笔记</button>
          )}
        </div>
      </div>

      {/* 笔记列表 */}
      {notes.length === 0 ? (
        <div className="card-chinese p-8 text-center">
          <span className="text-4xl mb-4 block">📒</span>
          <p className="text-base text-[var(--color-ink-light)]">暂无笔记，开始记录你的学习心得吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="card-chinese p-5">
              <h3
                className="text-[17px] font-bold mb-2"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
              >
                {note.title}
              </h3>
              {/* text-sm→text-base(16px) */}
              <p className="text-base text-[var(--color-ink-light)] whitespace-pre-wrap mb-3 line-clamp-4">
                {note.content}
              </p>
              <div className="flex items-center justify-between">
                {/* text-xs→text-sm(14px) */}
                <span className="text-sm text-[var(--color-ink-light)] opacity-60">
                  {new Date(note.updatedAt).toLocaleString('zh-CN')}
                </span>
                <div className="flex gap-3">
                  {/* text-xs→text-sm(14px) */}
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-cinnabar)] transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
