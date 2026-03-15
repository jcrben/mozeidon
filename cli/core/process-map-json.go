package core

import (
	"encoding/json"
	"fmt"
)

func (a *App) ProcessMapJson() {
	channel := a.ProcessMapGet()
	pm := <-channel
	out, _ := json.Marshal(pm)
	fmt.Println(string(out))
	<-channel
}
