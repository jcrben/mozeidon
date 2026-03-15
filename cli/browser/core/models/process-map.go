package models

type ProcessMapEntry struct {
	OsPid  int   `json:"osPid"`
	TabIds []int `json:"tabIds"`
}

type ProcessMap struct {
	Items []ProcessMapEntry `json:"data"`
}
