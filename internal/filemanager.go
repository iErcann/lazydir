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
func (f *FileManagerService) ListDirectory(dirPath string) DirectoryContents {
	if dirPath == "" {
		dirPath = "."
	}

	absPath, err := filepath.Abs(dirPath)
	if err != nil {
		return DirectoryContents{
			Path:  dirPath,
			Error: fmt.Sprintf("Invalid path: %v", err),
		}
	}

	entries, err := os.ReadDir(absPath)
	if err != nil {
		return DirectoryContents{
			Path:  absPath,
			Error: fmt.Sprintf("Error reading directory: %v", err),
		}
	}

	var files []FileInfo
	dirCount := 0
	fileCount := 0

	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		fileInfo := FileInfo{
			Name:      entry.Name(),
			Path:      filepath.Join(absPath, entry.Name()),
			Size:      info.Size(),
			IsDir:     entry.IsDir(),
			Mode:      info.Mode().String(),
			Modified:  info.ModTime(),
			Extension: filepath.Ext(entry.Name()),
		}

		files = append(files, fileInfo)

		if entry.IsDir() {
			dirCount++
		} else {
			fileCount++
		}
	}

	return DirectoryContents{
		Path:       absPath,
		Files:      files,
		Total:      len(files),
		Dirs:       dirCount,
		FilesCount: fileCount,
	}
}

// OpenFileWithDefaultApp opens a file with the default application.
func (f *FileManagerService) OpenFileWithDefaultApp(filePath string) (string, error) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", filePath)
	case "darwin":
		cmd = exec.Command("open", filePath)
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = exec.Command("xdg-open", filePath)
	}
	err := cmd.Start()
	if err != nil {
		return "", err
	}
	return "Opened " + filePath, nil
}
