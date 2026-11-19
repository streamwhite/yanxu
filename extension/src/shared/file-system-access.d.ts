type FilePickerAcceptType = {
	description?: string;
	accept: Record<string, string | string[]>;
};

type FileSystemPickerOptions = {
	multiple?: boolean;
	excludeAcceptAllOption?: boolean;
	types?: FilePickerAcceptType[];
	id?: string;
};

type FileSystemDirectoryPickerOptions = {
	id?: string;
	mode?: "read" | "readwrite";
};

interface Window {
	showOpenFilePicker?: (
		options?: FileSystemPickerOptions,
	) => Promise<FileSystemFileHandle[]>;
	showDirectoryPicker?: (
		options?: FileSystemDirectoryPickerOptions,
	) => Promise<FileSystemDirectoryHandle>;
}
