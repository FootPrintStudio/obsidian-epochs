import { App, Component, PluginSettingTab, Setting } from "obsidian";
import { createCalendarNote } from "./createCalendar";
import { CreateCalendarModal } from "./createModal";
import type EpochsPlugin from "./main";
import {
	renderGuidePanel,
	renderReadmePanel,
	renderSettingsTabBar,
	type PluginSettingsTabId,
} from "./readmeTab";
import { DEFAULT_SETTINGS } from "./types";

export class EpochsSettingTab extends PluginSettingTab {
	plugin: EpochsPlugin;
	private activeTab: PluginSettingsTabId = "settings";
	private docComponent = new Component();

	constructor(app: App, plugin: EpochsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	hide(): void {
		this.docComponent.unload();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		this.docComponent.unload();
		this.docComponent = new Component();

		containerEl.createEl("h2", { text: "Epochs" });

		const tabBar = containerEl.createDiv();
		renderSettingsTabBar(tabBar, this.activeTab, (tab) => {
			this.activeTab = tab;
			this.display();
		}, "epochs");

		const content = containerEl.createDiv({ cls: "epochs-settings-content" });
		const pluginDir =
			this.plugin.manifest.dir ??
			`${this.app.vault.configDir}/plugins/${this.plugin.manifest.id}`;

		if (this.activeTab === "readme") {
			renderReadmePanel(this.app, content, this.docComponent, "epochs-readme-panel", pluginDir);
			return;
		}

		if (this.activeTab === "guide") {
			renderGuidePanel(this.app, content, this.docComponent, "epochs-guide-panel", pluginDir);
			return;
		}

		this.displaySettings(content);
	}

	private displaySettings(containerEl: HTMLElement): void {
		containerEl.createEl("p", {
			text: "Define fictional calendars as notes, then format them with Grimoire date functions.",
		});

		new Setting(containerEl)
			.setName("Calendars folder")
			.setDesc(
				"Vault folder for calendar notes. Changing this does not move existing notes.",
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.calendarsFolder)
					.setValue(this.plugin.settings.calendarsFolder)
					.onChange(async (value) => {
						this.plugin.settings.calendarsFolder =
							value.trim() || DEFAULT_SETTINGS.calendarsFolder;
						await this.plugin.saveSettings();
						await this.plugin.rebuildIndex();
					}),
			);

		new Setting(containerEl)
			.setName("Default calendar id")
			.setDesc("Optional. Reserved for future ambiguous parses.")
			.addText((text) =>
				text.setValue(this.plugin.settings.defaultCalendarId).onChange(async (value) => {
					this.plugin.settings.defaultCalendarId = value.trim();
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Create calendar")
			.setDesc(
				"Creates a new note in the calendars folder with every field prefilled.",
			)
			.addButton((btn) =>
				btn.setButtonText("Create…").setCta().onClick(() => {
					new CreateCalendarModal(this.app, async (name) => {
						const file = await createCalendarNote(
							this.app,
							this.plugin.settings.calendarsFolder,
							name,
						);
						if (file) {
							await this.plugin.rebuildIndex();
							await this.app.workspace.getLeaf(true).openFile(file);
						}
					}).open();
				}),
			);

		const listed = this.plugin.api.listCalendars();
		containerEl.createEl("h3", { text: "Loaded calendars" });
		if (listed.length === 0) {
			containerEl.createEl("p", {
				text: "None yet — create a calendar or add notes with epochs: calendar in the folder.",
			});
		} else {
			for (const cal of listed) {
				containerEl.createEl("p", {
					text: `${cal.name} (id: ${cal.id}) — ${cal.path}`,
				});
			}
		}
	}
}
