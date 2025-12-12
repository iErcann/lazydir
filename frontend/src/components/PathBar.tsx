import type { Pane } from "../types";

export function PathBar({ pane }: { pane: Pane }) {
    // Texbox showing current path
    return (
        <div className="p-2 bg-gray-900 text-white">
            <input
                type="text"
                value={pane.path}
                readOnly
                className="w-full bg-gray-800 text-white px-2 py-1 rounded"
            />
        </div>
    );  
}