import { baseKeymap, toggleMark } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { schema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

const markKeymap = keymap({
  "Mod-b": toggleMark(schema.marks.strong),
  "Mod-i": toggleMark(schema.marks.em),
});

export function mountEditor(host: HTMLElement): EditorView {
  const state = EditorState.create({
    schema,
    plugins: [history(), markKeymap, keymap(baseKeymap)],
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
