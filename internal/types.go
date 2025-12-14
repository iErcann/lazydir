package internal

import (
	"fmt"
	"time"
)

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
	Total      int        `json:"total"`
	Dirs       int        `json:"dirs"`
	FilesCount int        `json:"filesCount"`
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
	OSMac     OperatingSystem = "mac"
	OSLinux   OperatingSystem = "linux"
)
