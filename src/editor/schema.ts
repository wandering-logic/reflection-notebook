import { Schema } from "prosemirror-model";
import { marks, nodes } from "prosemirror-schema-basic";

export const schema = new Schema({
  nodes: {
    doc: {
      content: "title subtitle block+",
    },
    title: {
      content: "inline*",
      marks: "",
      parseDOM: [{ tag: "h1" }],
      toDOM() {
        return ["h1", 0];
      },
    },
    subtitle: {
      content: "inline*",
      marks: "em",
      parseDOM: [{ tag: "h2" }],
      toDOM() {
        return ["h2", 0];
      },
    },
    // Section headings: level 1=Section (h3), 2=Subsection (h4), 3=Subsubsection (h5)
    section: {
      attrs: { level: { default: 1, validate: "number" } },
      content: "inline*",
      group: "block",
      defining: true,
      parseDOM: [
        { tag: "h3", attrs: { level: 1 } },
        { tag: "h4", attrs: { level: 2 } },
        { tag: "h5", attrs: { level: 3 } },
      ],
      toDOM(node) {
        return [`h${node.attrs.level + 2}`, 0];
      },
    },
    paragraph: {
      ...nodes.paragraph,
      group: "block",
    },
    code_block: {
      ...nodes.code_block,
      group: "block",
    },
    blockquote: {
      ...nodes.blockquote,
      group: "block",
    },
    horizontal_rule: {
      ...nodes.horizontal_rule,
      group: "block",
    },
    text: nodes.text,
    // image: add later
    // bullet_list, ordered_list, list_item: add later
  },
  marks: {
    strong: marks.strong,
    em: marks.em,
    code: marks.code,
    link: marks.link,
    // strikethrough: add later
  },
});
