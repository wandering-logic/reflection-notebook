import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

import { undo, redo } from "prosemirror-history";

export function mountEditor(host: HTMLElement): EditorView {
  const state = EditorState.create({
    schema,
    plugins: [history(), keymap(baseKeymap)],
  });

  const view = new EditorView(host, { state });
  return view;
}

export function doUndo(view: EditorView): boolean {
  return undo(view.state, view.dispatch);
}

export function doRedo(view: EditorView): boolean {
  return redo(view.state, view.dispatch);
}
