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
