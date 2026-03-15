package tabs

import (
	"github.com/spf13/cobra"

	"github.com/egovelox/mozeidon/cmd/flags"
	"github.com/egovelox/mozeidon/core"
)

var ProcessMapCmd = &cobra.Command{
	Use:   "process-map",
	Short: "Get OS PID → tab ID mapping (requires Firefox Nightly with processes permission)",
	Long: "Get OS PID → tab ID mapping using browser.processes.getProcessInfo().\n\n" +
		"Requires the mozeidon extension running in Firefox Nightly with the 'processes' permission.\n\n" +
		"Output: {\"data\": [{\"osPid\": 12345, \"tabIds\": [1, 2]}, ...]}\n",
	Run: func(_ *cobra.Command, _ []string) {
		app, err := core.NewAppWithProfile(flags.ProfileID)
		if err != nil {
			core.PrintError(err.Error())
			return
		}
		app.ProcessMapJson()
	},
}
