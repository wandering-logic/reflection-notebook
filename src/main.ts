import "./style.css";
import "prosemirror-view/style/prosemirror.css";
import * as Editor from "./editor/editor";
import * as Storage from "./storage/opfs";

// Current document state
let currentDocId: string | null = null;
let currentDocName = "Untitled";

function updateTitle() {
  document.title = `${currentDocName} - Notebook`;
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app not found");

app.innerHTML = `
  <div class="layout">
    <header class="menubar">
      <div class="menu">
        File
        <div class="menu-dropdown">
          <div class="menu-item" id="file-new">New</div>
          <div class="menu-item" id="file-open">Open...</div>
          <div class="menu-item" id="file-save-as">Save As...</div>
        </div>
      </div>
      <div class="menu">
        Edit
        <div class="menu-dropdown">
          <div class="menu-item" id="edit-undo">Undo</div>
          <div class="menu-item" id="edit-redo">Redo</div>
        </div>
      </div>
      <div class="menu">
        Format
        <div class="menu-dropdown">
          <div class="menu-item has-submenu">
            Text
            <div class="submenu">
              <div class="menu-item" id="format-strong">Strong</div>
              <div class="menu-item" id="format-em">Emphasis</div>
              <div class="menu-item" id="format-code">Code</div>
              <div class="menu-item" id="format-link">Link...</div>
            </div>
          </div>
          <div class="menu-item has-submenu">
            Paragraph
            <div class="submenu">
              <div class="menu-item" id="format-paragraph">Normal Text</div>
              <div class="menu-item" id="format-blockquote">Block Quote</div>
              <div class="menu-item" id="format-code-block">Code Block</div>
              <div class="menu-item" id="format-hr">Horizontal Rule</div>
              <div class="menu-item has-submenu">
                Headings
                <div class="submenu">
                  <div class="menu-item" id="format-h1">Heading 1</div>
                  <div class="menu-item" id="format-h2">Heading 2</div>
                  <div class="menu-item" id="format-h3">Heading 3</div>
                  <div class="menu-item" id="format-h4">Heading 4</div>
                  <div class="menu-item" id="format-h5">Heading 5</div>
                  <div class="menu-item" id="format-h6">Heading 6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="menu">View</div>
      <div class="menu">Preferences</div>
      <div class="menu">Help</div>
    </header>

    <div class="body">
      <aside class="sidebar hidden" id="sidebar">
        <div class="sidebar-title">Notebook</div>
      </aside>

      <main class="editor-host">
        <div id="editor"></div>
      </main>
    </div>
  </div>
`;

const editor = document.querySelector<HTMLDivElement>("#editor");
if (!editor) throw new Error("#editor not found");

const view = Editor.mountEditor(editor);
view.focus();

document.querySelector("#edit-undo")?.addEventListener("click", () => {
  Editor.doUndo(view);
  view.focus();
});

document.querySelector("#edit-redo")?.addEventListener("click", () => {
  Editor.doRedo(view);
  view.focus();
});

// Format menu - block types
document.querySelector("#format-paragraph")?.addEventListener("click", () => {
  Editor.setParagraph(view);
  view.focus();
});

for (let level = 1; level <= 6; level++) {
  document.querySelector(`#format-h${level}`)?.addEventListener("click", () => {
    Editor.setHeading(view, level);
    view.focus();
  });
}

document.querySelector("#format-code-block")?.addEventListener("click", () => {
  Editor.setCodeBlock(view);
  view.focus();
});

document.querySelector("#format-blockquote")?.addEventListener("click", () => {
  Editor.setBlockquote(view);
  view.focus();
});

document.querySelector("#format-hr")?.addEventListener("click", () => {
  Editor.insertHorizontalRule(view);
  view.focus();
});

// Format menu - marks
document.querySelector("#format-strong")?.addEventListener("click", () => {
  Editor.toggleStrong(view);
  view.focus();
});

document.querySelector("#format-em")?.addEventListener("click", () => {
  Editor.toggleEm(view);
  view.focus();
});

document.querySelector("#format-code")?.addEventListener("click", () => {
  Editor.toggleCode(view);
  view.focus();
});

document.querySelector("#format-link")?.addEventListener("click", () => {
  const href = prompt("Enter URL:");
  if (href) {
    Editor.toggleLink(view, href);
  }
  view.focus();
});

// File menu handlers
document.querySelector("#file-new")?.addEventListener("click", async () => {
  currentDocId = null;
  currentDocName = "Untitled";
  updateTitle();
  Editor.setContent(view, null);
  view.focus();
});

document.querySelector("#file-open")?.addEventListener("click", async () => {
  const docs = await Storage.listDocuments();
  if (docs.length === 0) {
    alert("No saved documents.");
    return;
  }

  const choices = docs.map((d, i) => `${i + 1}. ${d.name}`).join("\n");
  const choice = prompt(`Open document:\n${choices}\n\nEnter number:`);
  if (!choice) return;

  const index = parseInt(choice, 10) - 1;
  if (index < 0 || index >= docs.length) {
    alert("Invalid choice.");
    return;
  }

  const doc = docs[index];
  const data = await Storage.loadDocument(doc.id);
  if (data) {
    currentDocId = doc.id;
    currentDocName = doc.name;
    updateTitle();
    Editor.setContent(view, data.content);
  }
  view.focus();
});

document.querySelector("#file-save-as")?.addEventListener("click", async () => {
  const name = prompt("Document name:", currentDocName);
  if (!name) return;

  const id = currentDocId ?? Storage.generateId();
  const content = view.state.doc.toJSON();
  await Storage.saveDocument(id, name, content);

  currentDocId = id;
  currentDocName = name;
  updateTitle();
  view.focus();
});

// Autosave: save after changes, debounced
let autosaveTimeout: number | null = null;

function scheduleAutosave() {
  if (!currentDocId) return; // Don't autosave unsaved documents

  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }

  autosaveTimeout = window.setTimeout(async () => {
    if (currentDocId) {
      const content = view.state.doc.toJSON();
      await Storage.saveDocument(currentDocId, currentDocName, content);
    }
  }, 1000);
}

// Listen for editor changes
Editor.onChange(view, scheduleAutosave);

updateTitle();
