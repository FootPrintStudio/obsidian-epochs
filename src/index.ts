import { App, TFile, normalizePath } from "obsidian";
import { parseCalendarFrontmatter } from "./schema";
import type { CalendarDef } from "./types";

export class CalendarIndex {
	private byId = new Map<string, CalendarDef>();
	private errors = new Map<string, string[]>();

	constructor(
		private app: App,
		private getFolder: () => string,
	) {}

	get(id: string): CalendarDef | null {
		return this.byId.get(id) ?? null;
	}

	list(): CalendarDef[] {
		return [...this.byId.values()].sort((a, b) => a.id.localeCompare(b.id));
	}

	getErrors(path: string): string[] {
		return this.errors.get(path) ?? [];
	}

	async rebuild(): Promise<void> {
		this.byId.clear();
		this.errors.clear();
		const folder = normalizePath(this.getFolder().trim() || "Epoch Calendars");
		const files = this.app.vault.getMarkdownFiles().filter((f) => {
			const p = f.path;
			return p === folder || p.startsWith(folder + "/");
		});

		for (const file of files) {
			await this.ingestFile(file);
		}
	}

	async ingestFile(file: TFile): Promise<void> {
		const folder = normalizePath(this.getFolder().trim() || "Epoch Calendars");
		if (!(file.path === folder || file.path.startsWith(folder + "/"))) {
			return;
		}
		const cache = this.app.metadataCache.getFileCache(file);
		const fm = (cache?.frontmatter ?? {}) as Record<string, unknown>;
		if (fm.epochs !== "calendar" && fm.epochs !== true) {
			this.byId.forEach((cal, id) => {
				if (cal.path === file.path) this.byId.delete(id);
			});
			this.errors.delete(file.path);
			return;
		}
		const { calendar, errors } = parseCalendarFrontmatter(fm, file.path);
		if (errors.length) this.errors.set(file.path, errors);
		else this.errors.delete(file.path);

		// Drop previous id for this path
		for (const [id, cal] of [...this.byId.entries()]) {
			if (cal.path === file.path) this.byId.delete(id);
		}

		if (calendar) {
			if (this.byId.has(calendar.id) && this.byId.get(calendar.id)!.path !== file.path) {
				this.errors.set(file.path, [
					...(this.errors.get(file.path) ?? []),
					`Duplicate calendar id “${calendar.id}”`,
				]);
			}
			this.byId.set(calendar.id, calendar);
		}
	}

	removeFile(path: string): void {
		for (const [id, cal] of [...this.byId.entries()]) {
			if (cal.path === path) this.byId.delete(id);
		}
		this.errors.delete(path);
	}
}
