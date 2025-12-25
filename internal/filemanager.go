package internal

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/adrg/xdg"
)

// FileManagerService is a service for managing files
type FileManagerService struct{}

// ListDirectory lists the contents of a directory.
func (f *FileManagerService) ListDirectory(dirPath string) Result[DirectoryContents] {
	pathResult := canonicalPath(dirPath)
	if pathResult.Error != nil {
		return Result[DirectoryContents]{Error: pathResult.Error}
	}
	absPath := *pathResult.Data
	entries, err := os.ReadDir(absPath)
	if err != nil {
		return Result[DirectoryContents]{Error: &AppError{Code: ReadDirectoryError, Message: fmt.Sprintf("read directory error: %v", err), InnerError: err}}
	}

	var (
		files           []FileInfo
		dirCount        int
		fileCount       int
		directSizeBytes int64 // important for big files
	)

	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return Result[DirectoryContents]{Error: &AppError{Code: FileInfoError, Message: fmt.Sprintf("get info for %q: %v", entry.Name(), err), InnerError: err}}
		}

		// Clean path for cross-platform consistency
		path := filepath.Join(absPath, entry.Name())
		path = filepath.Clean(path)

		files = append(files, FileInfo{
			Name:      entry.Name(),
			Path:      path,
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
			directSizeBytes += info.Size()
		}
	}

	return Result[DirectoryContents]{
		Data: &DirectoryContents{
			Path:            absPath,
			Files:           files,
			DirCount:        dirCount,
			FileCount:       fileCount,
			DirectSizeBytes: directSizeBytes,
		},
	}
}

func canonicalPath(p string) Result[string] {
	if p == "" {
		return Result[string]{Error: &AppError{Code: ResolvePathError, Message: "empty path"}}
	}

	// Convert slashes to OS-native
	p = filepath.FromSlash(p)

	// Expand drive root: C: → C:\
	if runtime.GOOS == "windows" {
		if len(p) == 2 && p[1] == ':' {
			p += `\`
		}
	}

	// Make absolute
	abs, err := filepath.Abs(p)
	if err != nil {
		return Result[string]{Error: &AppError{Code: ResolvePathError, Message: fmt.Sprintf("failed to get absolute path for %s: %v", p, err), InnerError: err}}
	}

	// Clean (. .. double separators)
	clean := filepath.Clean(abs)

	return Result[string]{Data: &clean}
}

func (f *FileManagerService) OpenFileWithDefaultApp(filePath string) Result[string] {
	pathResult := canonicalPath(filePath)
	if pathResult.Error != nil {
		return Result[string]{
			Error: &AppError{
				Code:    ResolvePathError,
				Message: fmt.Sprintf("failed to resolve path %s: %v", filePath, pathResult.Error),
			},
		}
	}
	absPath := *pathResult.Data

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", absPath)
	case "darwin":
		cmd = exec.Command("open", absPath)
	default: // Linux, FreeBSD, etc.
		cmd = exec.Command("xdg-open", absPath)
	}

	if err := cmd.Start(); err != nil {
		return Result[string]{
			Error: &AppError{
				Code:    FileOpenWithDefaultAppError,
				Message: fmt.Sprintf("failed to open file %s: %v", absPath, err),
			},
		}
	}

	msg := fmt.Sprintf("Opened %s", absPath)
	return Result[string]{Data: &msg}
}

func (f *FileManagerService) GetPathInfo(p string) Result[PathInfo] {
	pathResult := canonicalPath(p)
	if pathResult.Error != nil {
		return Result[PathInfo]{Error: pathResult.Error}
	}
	abs := *pathResult.Data

	volume := filepath.VolumeName(abs) // e.g., "C:" or "\\server\share"
	rest := strings.TrimPrefix(abs, volume)
	rest = strings.TrimPrefix(rest, string(os.PathSeparator))

	parts := []string{}
	if volume != "" {
		parts = append(parts, volume) // include root as first part (Windows drive or UNC share)
	} else {
		parts = append(parts, string(os.PathSeparator))
	}

	if rest != "" {
		parts = append(parts, strings.Split(rest, string(os.PathSeparator))...)
	}

	return Result[PathInfo]{
		Data: &PathInfo{
			FullPath:  abs,
			Parts:     parts,
			Root:      volume,
			Separator: string(os.PathSeparator),
		},
	}
}

// GetPathAtIndex returns the absolute path corresponding to a breadcrumb index
func (f *FileManagerService) GetPathAtIndex(fullPath string, index int) Result[string] {
	pathInfoResult := f.GetPathInfo(fullPath)
	if pathInfoResult.Error != nil {
		return Result[string]{Error: pathInfoResult.Error}
	}
	pathInfo := pathInfoResult.Data

	if index < 0 || index >= len(pathInfo.Parts) {
		return Result[string]{Error: &AppError{
			Code:    InvalidPathIndex,
			Message: fmt.Sprintf("breadcrumb index %d out of bounds", index),
		}}
	}

	// Slice parts up to the clicked index
	selectedParts := pathInfo.Parts[:index+1]

	// Fix the root to always end with a separator
	root := pathInfo.Root
	if root != "" && !strings.HasSuffix(root, string(os.PathSeparator)) {
		root += string(os.PathSeparator)
	}

	// If the first part is the root itself, skip it (avoid duplication)
	restParts := selectedParts
	if len(selectedParts) > 0 && selectedParts[0] == pathInfo.Root {
		restParts = selectedParts[1:]
	}

	// Join root + rest
	absPath := filepath.Join(append([]string{root}, restParts...)...)

	return Result[string]{Data: &absPath}
}

// GetOperatingSystem simply returns the OS as a string.
// https://stackoverflow.com/questions/20728767/all-possible-goos-value
func (f *FileManagerService) GetOperatingSystem() Result[OperatingSystem] {
	os := OperatingSystem(runtime.GOOS)
	return Result[OperatingSystem]{Data: &os}
}

func (f *FileManagerService) GetInitialPath() Result[string] {
	// 1. Try user home
	home, err := os.UserHomeDir()
	if err == nil && home != "" {
		return canonicalPath(home)
	}

	// 2. OS-specific fallback
	switch runtime.GOOS {
	case "windows":
		// Prefer system drive root
		drive := os.Getenv("SystemDrive")
		if drive == "" {
			drive = "C:"
		}
		return canonicalPath(drive)
	default:
		// Unix-like root
		return canonicalPath(string(os.PathSeparator))
	}
}

// Sidebar Shortcuts
func (f *FileManagerService) GetShortcuts() Result[[]Shortcut] {
	home, err := os.UserHomeDir()
	if err != nil {
		return Result[[]Shortcut]{
			Error: &AppError{
				Code:       ResolvePathError,
				Message:    fmt.Sprintf("failed to get user home directory: %v", err),
				InnerError: err,
			},
		}
	}

	// Prepare shortcuts with best-effort cross-platform paths
	shortcuts := []Shortcut{
		{
			Name: "Home",
			Path: home,
			Logo: ShortcutLogoHome,
		},
	}

	// Helper to add only if path exists and is useful
	addIfExists := func(name string, path string, logo ShortcutLogo) {
		if path == "" {
			return
		}
		// Optional: check existence
		if _, err := os.Stat(path); err == nil {
			shortcuts = append(shortcuts, Shortcut{
				Name: name,
				Path: path,
				Logo: logo,
			})
		}
	}
	// THX : https://github.com/adrg/xdg?tab=readme-ov-file#xdg-base-directory
	// XDG library gives us good defaults on all major platforms
	addIfExists("Desktop", xdg.UserDirs.Desktop, ShortcutLogoDesktop)
	addIfExists("Downloads", xdg.UserDirs.Download, ShortcutLogoDownloads)
	addIfExists("Documents", xdg.UserDirs.Documents, ShortcutLogoDocs)
	addIfExists("Music", xdg.UserDirs.Music, ShortcutLogoMusic)
	addIfExists("Pictures", xdg.UserDirs.Pictures, ShortcutLogoPics)
	addIfExists("Videos", xdg.UserDirs.Videos, ShortcutLogoVideos)

	return Result[[]Shortcut]{Data: &shortcuts}
}
