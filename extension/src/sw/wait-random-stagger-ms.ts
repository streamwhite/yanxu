import { waitMs } from "../content/wait-ms.js";
import { computeRandomStaggerMs } from "./compute-random-stagger-ms.js";

export async function waitRandomStaggerMs(): Promise<void> {
	await waitMs(computeRandomStaggerMs());
}
