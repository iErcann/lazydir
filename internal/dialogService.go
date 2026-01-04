package internal

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

type DialogService struct {
	App *application.App
}

func (d *DialogService) ShowInfoDialog(title, message string) {
	d.App.Dialog.Info().SetTitle(title).SetMessage(message).Show()
}

func (d *DialogService) ShowErrorDialog(title, message string) {
	d.App.Dialog.Error().SetTitle(title).SetMessage(message).Show()
}

func (d *DialogService) ShowWarningDialog(title, message string) {
	d.App.Dialog.Warning().SetTitle(title).SetMessage(message).Show()
}

func (d *DialogService) ShowQuestionDialog(title, message string, buttons []string, defaultButton string) string {
	resultChan := make(chan string, 1)

	dialog := d.App.Dialog.Question().
		SetTitle(title).
		SetMessage(message)

	// Add buttons with callbacks
	var defaultBtn *application.Button
	for _, buttonLabel := range buttons {
		btn := dialog.AddButton(buttonLabel)

		// Capture the label in the closure
		label := buttonLabel
		btn.OnClick(func() {
			resultChan <- label
		})

		// Track default button
		if buttonLabel == defaultButton {
			defaultBtn = btn
		}
	}

	// Set default button if specified
	if defaultBtn != nil {
		dialog.SetDefaultButton(defaultBtn)
	}

	// Show the dialog
	dialog.Show()

	// TODO: Check for cancellation scenario
	// Wait for result
	result := <-resultChan
	return result
}
