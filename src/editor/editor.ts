import {
  baseKeymap,
  setBlockType,
  toggleMark,
  wrapIn,
} from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Node } from "prosemirror-model";
import { EditorState, Selection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";

const markKeymap = keymap({
  "Mod-b": toggleMark(schema.marks.strong),
  "Mod-i": toggleMark(schema.marks.em),
});

const plugins = [history(), markKeymap, keymap(baseKeymap)];

// Change listeners per view
const changeListeners = new WeakMap<EditorView, () => void>();

export function mountEditor(host: HTMLElement): EditorView {
  const state = EditorState.create({ schema, plugins });

  const view = new EditorView(host, {
    state,
    dispatchTransaction(tr) {
      const newState = view.state.apply(tr);
      view.updateState(newState);

      if (tr.docChanged) {
        const listener = changeListeners.get(view);
        if (listener) listener();
      }
    },
  });
  return view;
}

export function setContent(view: EditorView, content: unknown): void {
  const doc = content
    ? Node.fromJSON(schema, content)
    : schema.topNodeType.createAndFill();
  if (!doc) throw new Error("Failed to create empty document");
  const state = EditorState.create({ schema, plugins, doc });
  view.updateState(state);
}

export function onChange(view: EditorView, callback: () => void): void {
  changeListeners.set(view, callback);
}

export function focusAtEnd(view: EditorView): void {
  const end = view.state.doc.content.size;
  view.dispatch(
    view.state.tr.setSelection(Selection.near(view.state.doc.resolve(end))),
  );
  view.focus();
}

export function doUndo(view: EditorView): boolean {
  return undo(view.state, view.dispatch);
}

export function doRedo(view: EditorView): boolean {
  return redo(view.state, view.dispatch);
}

// Block type commands
export function setParagraph(view: EditorView): boolean {
  return setBlockType(schema.nodes.paragraph)(view.state, view.dispatch);
}

export function setSection(view: EditorView, level: number): boolean {
  return setBlockType(schema.nodes.section, { level })(
    view.state,
    view.dispatch,
  );
}

export function setCodeBlock(view: EditorView): boolean {
  return setBlockType(schema.nodes.code_block)(view.state, view.dispatch);
}

export function setBlockquote(view: EditorView): boolean {
  return wrapIn(schema.nodes.blockquote)(view.state, view.dispatch);
}

export function insertHorizontalRule(view: EditorView): boolean {
  const { state, dispatch } = view;
  const hr = schema.nodes.horizontal_rule.create();
  dispatch(state.tr.replaceSelectionWith(hr));
  return true;
}

// Mark commands
export function toggleStrong(view: EditorView): boolean {
  return toggleMark(schema.marks.strong)(view.state, view.dispatch);
}

export function toggleEm(view: EditorView): boolean {
  return toggleMark(schema.marks.em)(view.state, view.dispatch);
}

export function toggleCode(view: EditorView): boolean {
  return toggleMark(schema.marks.code)(view.state, view.dispatch);
}

export function toggleLink(view: EditorView, href: string): boolean {
  return toggleMark(schema.marks.link, { href })(view.state, view.dispatch);
}
