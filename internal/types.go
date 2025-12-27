package internal

import (
	"fmt"
	"time"
)

// FileInfo represents a file/directory for JSON serialization
type FileInfo struct {
	Name      string    `json:"name"`
	Path      string    `json:"path"` // normalized absolute path
	Size      int64     `json:"size"` // size in bytes
	IsDir     bool      `json:"isDir"`
	Mode      string    `json:"mode"`
	Modified  time.Time `json:"modified"`
	Extension string    `json:"extension,omitempty"`
}

type PathInfo struct {
	FullPath  string   `json:"fullPath"`  // normalized absolute path
	Parts     []string `json:"parts"`     // split segments for breadcrumb
	Root      string   `json:"root"`      // e.g., "C:\" on Windows, "/" on Linux
	Separator string   `json:"separator"` // OS-specific path separator
}

// DirectoryContents for listing directory
type DirectoryContents struct {
	Path  string     `json:"path"`
	Files []FileInfo `json:"files"`

	DirCount        int   `json:"dirCount"`        // Direct children only
	FileCount       int   `json:"fileCount"`       // Direct children only
	DirectSizeBytes int64 `json:"directSizeBytes"` // Direct files size in bytes
}

type AppError struct {
	Code       ErrorCode `json:"code"`
	Message    string    `json:"message"`
	InnerError error     `json:"-"`
}

type ErrorCode string

const (
	ResolvePathError            ErrorCode = "ResolvePathError"
	ReadDirectoryError          ErrorCode = "ReadDirectoryError"
	FileInfoError               ErrorCode = "FileInfoError"
	FileOpenWithDefaultAppError ErrorCode = "FileOpenWithDefaultAppError"
	InvalidPathIndex            ErrorCode = "InvalidPathIndex"
	FileMoveError               ErrorCode = "FileMoveError"
	FileCopyError               ErrorCode = "FileCopyError"
)

// AppError implements error.
func (a *AppError) Error() string {
	if a.InnerError != nil {
		return fmt.Sprintf("%s: %v", a.Message, a.InnerError)
	}
	return a.Message
}

func (a *AppError) Unwrap() error {
	return a.InnerError
}

// omitempty = omit this field if it's empty
type Result[T any] struct {
	Data  *T        `json:"data,omitempty"`
	Error *AppError `json:"error,omitempty"`
}

type OperatingSystem string

const (
	OSWindows OperatingSystem = "windows"
	OSMac     OperatingSystem = "darwin"
	OSLinux   OperatingSystem = "linux"
)

type ShortcutLogo string

const (
	ShortcutLogoDefault   ShortcutLogo = "default"
	ShortcutLogoFolder    ShortcutLogo = "folder"
	ShortcutLogoDrive     ShortcutLogo = "drive"
	ShortcutLogoHome      ShortcutLogo = "home"
	ShortcutLogoDocs      ShortcutLogo = "documents"
	ShortcutLogoMusic     ShortcutLogo = "music"
	ShortcutLogoPics      ShortcutLogo = "pictures"
	ShortcutLogoVideos    ShortcutLogo = "videos"
	ShortcutLogoDesktop   ShortcutLogo = "desktop"
	ShortcutLogoDownloads ShortcutLogo = "downloads"
)

type Shortcut struct {
	Name string       `json:"name"`
	Path string       `json:"path"`
	Logo ShortcutLogo `json:"logo"`
}
