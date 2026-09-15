import { Plugin, TFile } from "obsidian";
import { EpochsApi } from "./api";
import { createCalendarNote } from "./createCalendar";
import { CreateCalendarModal } from "./createModal";
import { CalendarIndex } from "./index";
import { EpochsSettingTab } from "./settings";
import { DEFAULT_SETTINGS, type EpochsSettings } from "./types";

export default class EpochsPlugin extends Plugin {
	settings: EpochsSettings = { ...DEFAULT_SETTINGS };
	index = new CalendarIndex(this.app, () => this.settings.calendarsFolder);
	api = new EpochsApi(this.index);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new EpochsSettingTab(this.app, this));

		this.addCommand({
			id: "create-calendar",
			name: "Create calendar",
			callback: () => {
				new CreateCalendarModal(this.app, async (name) => {
					const file = await createCalendarNote(
						this.app,
						this.settings.calendarsFolder,
						name,
					);
					if (file) {
						await this.rebuildIndex();
						await this.app.workspace.getLeaf(true).openFile(file);
					}
				}).open();
			},
		});

		this.addCommand({
			id: "rebuild-calendar-index",
			name: "Rebuild calendar index",
			callback: () => void this.rebuildIndex(),
		});

		this.app.workspace.onLayoutReady(() => void this.rebuildIndex());

		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				if (file instanceof TFile) void this.index.ingestFile(file);
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				if (file instanceof TFile) this.index.removeFile(file.path);
			}),
		);
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (file instanceof TFile) {
					this.index.removeFile(oldPath);
					void this.index.ingestFile(file);
				}
			}),
		);
	}

	async rebuildIndex(): Promise<void> {
		await this.index.rebuild();
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<EpochsSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
		if (!this.settings.calendarsFolder?.trim()) {
			this.settings.calendarsFolder = DEFAULT_SETTINGS.calendarsFolder;
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
