import { App, Modal, Setting } from "obsidian";

export class CreateCalendarModal extends Modal {
	private nameValue = "New Calendar";
	private onSubmit: (name: string) => void;

	constructor(app: App, onSubmit: (name: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Create calendar" });
		contentEl.createEl("p", {
			text: "Creates a note in your Epoch Calendars folder with every field prefilled.",
		});

		new Setting(contentEl).setName("Name").addText((text) => {
			text.setValue(this.nameValue).onChange((v) => {
				this.nameValue = v;
			});
			text.inputEl.addEventListener("keydown", (ev) => {
				if (ev.key === "Enter") {
					ev.preventDefault();
					this.submit();
				}
			});
			window.setTimeout(() => text.inputEl.focus(), 20);
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close()),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Create")
					.setCta()
					.onClick(() => this.submit()),
			);
	}

	private submit(): void {
		const name = this.nameValue.trim() || "New Calendar";
		this.close();
		this.onSubmit(name);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
