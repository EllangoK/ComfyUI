import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Comfy.UndoRedo",
    init() {
        class UndoRedoManager {
            constructor(app) {
                this.app = app;
                this.undoStack = [];
                this.redoStack = [];

                this.keybindListener = this.keybindListener.bind(this);
                this.onBeforeChange = this.onBeforeChange.bind(this);
            }

            onBeforeChange() {
                console.log("onBeforeChange");
                const json = JSON.stringify(this.app.graph.serialize(), null, 2);
                this.undoStack.push(json);
                this.redoStack = [];
            }

            keybindListener(event) {
                const modifierPressed = event.ctrlKey || event.metaKey;
                if (!modifierPressed) return;

                if (modifierPressed && (event.key === "z" || event.keyCode === 90)) {
                    if (this.undoStack.length) {
                        this.redoStack.push(JSON.stringify(this.app.graph.serialize(), null, 2));
                        const json = this.undoStack.pop();
                        this.app.graph.configure(JSON.parse(json));
                        this.app.graph.setDirtyCanvas(true, true);
                    }
                    event.preventDefault();
                    console.log("redostack", this.redoStack);
                    return;
                }

                if (modifierPressed && (event.key === "y" || event.keyCode === 89)) {
                    console.log("redo", this.redoStack);
                    if (this.redoStack.length) {
                        this.undoStack.push(JSON.stringify(this.app.graph.serialize(), null, 2));
                        const json = this.redoStack.pop();
                        this.app.graph.configure(JSON.parse(json));
                        this.app.graph.setDirtyCanvas(true, true);
                    }
                    event.preventDefault();
                    return;
                }
            }

        }

        let undoRedoManager = new UndoRedoManager(app);

        app.canvas.onBeforeChange = undoRedoManager.onBeforeChange;
        window.addEventListener("keydown", undoRedoManager.keybindListener);
    }
});
