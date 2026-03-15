package core

import (
	"encoding/json"
	"os"

	"github.com/egovelox/mozeidon/browser/core/models"
)

func (a *App) ProcessMapGet() <-chan models.ProcessMap {
	channel := make(chan models.ProcessMap)

	go func() {
		defer close(channel)
		returnCode := 0
		for result := range a.browser.Send(
			models.Command{
				Command: "get-process-map",
				Args:    "",
			},
		) {
			if checkForError(result.Data) {
				returnCode = 1
				continue
			}
			pm := models.ProcessMap{}
			json.Unmarshal(result.Data, &pm)
			channel <- pm
		}
		if returnCode != 0 {
			os.Exit(1)
		}
	}()

	return channel
}
