import { DirectoryContents } from "../../bindings/lazydir/internal";
import { FileItem } from "./FileItem";

export function FileGrid({
  contents,
}: {
  contents: DirectoryContents;
}) {
  return (
    <div className="grid grid-cols-8 gap-4 p-4">
      {contents.files.map((file) => (
        <FileItem key={file.path} file={file} isSelected={false} />
      ))}
    </div>
  );
}
