import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

export function mountEditor(host: HTMLElement): EditorView {
  const state = EditorState.create({
    schema,
    plugins: [history(), keymap(baseKeymap)],
  });

  const view = new EditorView(host, { state });
  return view;
}
