import { Schema } from "prosemirror-model";
import { marks, nodes } from "prosemirror-schema-basic";

export const schema = new Schema({
  nodes: {
    doc: nodes.doc,
    paragraph: nodes.paragraph,
    heading: nodes.heading,
    code_block: nodes.code_block,
    blockquote: nodes.blockquote,
    horizontal_rule: nodes.horizontal_rule,
    text: nodes.text,
    // hard_break omitted
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
