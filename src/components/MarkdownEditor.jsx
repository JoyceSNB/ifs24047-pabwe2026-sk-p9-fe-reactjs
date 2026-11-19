import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value, onChange, height, placeholder }) {
  const editorElRef = useRef(null)
  const editorInstanceRef = useRef(null)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')

    editorInstanceRef.current = new Editor({
      el: editorElRef.current,
      height,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      initialValue: value,
      placeholder,
      usageStatistics: false,
      theme: isDark ? 'dark' : 'light',
      events: {
        change: () => onChange(editorInstanceRef.current.getMarkdown()),
      },
    })

    return () => {
      editorInstanceRef.current.destroy()
    }
  }, [])

  useEffect(() => {
    if (value !== editorInstanceRef.current.getMarkdown()) {
      editorInstanceRef.current.setMarkdown(value, false)
    }
  }, [value])

  return (
    <div
      className="toastui-editor-container w-full border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white text-slate-800"
      data-testid="markdown-editor"
    >
      <div ref={editorElRef} />
    </div>
  )
}
