import { App, Notice, normalizePath, TFile } from "obsidian";
import { slugFromName } from "./schema";
import { buildCalendarTemplate } from "./template";

export async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const path = normalizePath(folderPath);
	if (!path) return;
	const parts = path.split("/").filter(Boolean);
	let current = "";
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		const existing = app.vault.getAbstractFileByPath(current);
		if (!existing) {
			await app.vault.createFolder(current);
		}
	}
}

function uniquePath(app: App, folder: string, baseName: string): string {
	const safe = baseName.replace(/[\\/:#?[\]]/g, "-").trim() || "Calendar";
	let path = normalizePath(`${folder}/${safe}.md`);
	let n = 2;
	while (app.vault.getAbstractFileByPath(path)) {
		path = normalizePath(`${folder}/${safe} ${n}.md`);
		n++;
	}
	return path;
}

export async function createCalendarNote(
	app: App,
	calendarsFolder: string,
	displayName: string,
): Promise<TFile | null> {
	const name = displayName.trim() || "New Calendar";
	const id = slugFromName(name);
	const folder = normalizePath(calendarsFolder.trim() || "Epoch Calendars");
	await ensureFolder(app, folder);
	const path = uniquePath(app, folder, name);
	const body = buildCalendarTemplate({ id, name });
	try {
		const file = await app.vault.create(path, body);
		new Notice(`Created calendar “${name}”`);
		return file;
	} catch (err) {
		console.error(err);
		new Notice("Could not create calendar note");
		return null;
	}
}
