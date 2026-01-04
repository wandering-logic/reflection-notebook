import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app not found");

app.innerHTML = `
  <div class="layout">
    <header class="menubar">
      <div class="menu">File</div>
      <div class="menu">Edit</div>
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
editor.textContent = "ProseMirror will mount here.";
