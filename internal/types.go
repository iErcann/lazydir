package internal

import "time"

// FileInfo represents a file/directory for JSON serialization
type FileInfo struct {
	Name      string    `json:"name"`
	Path      string    `json:"path"`
	Size      int64     `json:"size"`
	IsDir     bool      `json:"isDir"`
	Mode      string    `json:"mode"`
	Modified  time.Time `json:"modified"`
	Extension string    `json:"extension,omitempty"`
}

// DirectoryContents for listing directory
type DirectoryContents struct {
	Path       string     `json:"path"`
	Files      []FileInfo `json:"files"`
	Error      string     `json:"error,omitempty"`
	Total      int        `json:"total"`
	Dirs       int        `json:"dirs"`
	FilesCount int        `json:"filesCount"`
}
