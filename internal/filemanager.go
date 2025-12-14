package internal

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// FileManagerService is a service for managing files
type FileManagerService struct{}

// ListDirectory lists the contents of a directory.
func (f *FileManagerService) ListDirectory(dirPath string) Result[DirectoryContents] {
	if dirPath == "" {
		dirPath = "."
	}

	absPath, err := filepath.Abs(dirPath)
	if err != nil {
		return Result[DirectoryContents]{Error: &AppError{Code: ResolvePathError, Message: fmt.Sprintf("resolve path error: %v", err), InnerError: err}}
	}

	entries, err := os.ReadDir(absPath)
	if err != nil {
		return Result[DirectoryContents]{Error: &AppError{Code: ReadDirectoryError, Message: fmt.Sprintf("read directory error: %v", err), InnerError: err}}
	}

	var (
		files     []FileInfo
		dirCount  int
		fileCount int
	)

	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return Result[DirectoryContents]{Error: &AppError{Code: FileInfoError, Message: fmt.Sprintf("get info for %q: %v", entry.Name(), err), InnerError: err}}
		}

		files = append(files, FileInfo{
			Name:      entry.Name(),
			Path:      filepath.Join(absPath, entry.Name()),
			Size:      info.Size(),
			IsDir:     entry.IsDir(),
			Mode:      info.Mode().String(),
			Modified:  info.ModTime(),
			Extension: filepath.Ext(entry.Name()),
		})

		if entry.IsDir() {
			dirCount++
		} else {
			fileCount++
		}
	}

	return Result[DirectoryContents]{
		Data: &DirectoryContents{
			Path:       absPath,
			Files:      files,
			Total:      len(files),
			Dirs:       dirCount,
			FilesCount: fileCount,
		},
	}
}

func (f *FileManagerService) OpenFileWithDefaultApp(filePath string) Result[string] {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", filePath)
	case "darwin":
		cmd = exec.Command("open", filePath)
	default: // Linux, FreeBSD, etc.
		cmd = exec.Command("xdg-open", filePath)
	}

	if err := cmd.Start(); err != nil {
		return Result[string]{
			Error: &AppError{
				Code:    FileOpenWithDefaultAppError,
				Message: fmt.Sprintf("failed to open file %s: %v", filePath, err),
			},
		}
	}

	msg := fmt.Sprintf("Opened %s", filePath)
	return Result[string]{Data: &msg}
}

// GetOperatingSystem simply returns the OS as a string.
// https://stackoverflow.com/questions/20728767/all-possible-goos-value
func (f *FileManagerService) GetOperatingSystem() Result[OperatingSystem] {
	os := OperatingSystem(runtime.GOOS)
	return Result[OperatingSystem]{Data: &os}
}
