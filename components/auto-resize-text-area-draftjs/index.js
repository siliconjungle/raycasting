import React from 'react'
import { Editor, EditorState } from 'draft-js'
import 'draft-js/dist/Draft.css'

const AutoResizeTextAreaDraftJs = () => {
  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  )

  return (
      <Editor editorState={editorState} onChange={setEditorState} style={{ width: '100%', backgroundColor: 'magenta' }} />
  )
}

export default AutoResizeTextAreaDraftJs
