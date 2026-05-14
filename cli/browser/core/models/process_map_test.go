package models

import (
	"encoding/json"
	"testing"
)

func TestProcessMapJSONRoundTrip(t *testing.T) {
	t.Parallel()

	pm := ProcessMap{
		Items: []ProcessMapEntry{
			{OsPid: 12345, TabIds: []int{1, 2}},
			{OsPid: 67890, TabIds: []int{3}},
		},
	}

	encoded, err := json.Marshal(pm)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var decoded ProcessMap
	if err := json.Unmarshal(encoded, &decoded); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if len(decoded.Items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(decoded.Items))
	}
	if decoded.Items[0].OsPid != 12345 || len(decoded.Items[0].TabIds) != 2 {
		t.Fatalf("first entry mismatch: %#v", decoded.Items[0])
	}
	if decoded.Items[1].OsPid != 67890 || len(decoded.Items[1].TabIds) != 1 {
		t.Fatalf("second entry mismatch: %#v", decoded.Items[1])
	}
}

func TestProcessMapUnmarshalFromExtensionShape(t *testing.T) {
	t.Parallel()

	// CLI prints ProcessMap as JSON; extension payload uses {"data":[...]}.
	const payload = `{"data":[{"osPid":42,"tabIds":[7,8]}]}`

	var pm ProcessMap
	if err := json.Unmarshal([]byte(payload), &pm); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(pm.Items) != 1 || pm.Items[0].OsPid != 42 {
		t.Fatalf("unexpected decode: %#v", pm.Items)
	}
	if len(pm.Items[0].TabIds) != 2 || pm.Items[0].TabIds[0] != 7 || pm.Items[0].TabIds[1] != 8 {
		t.Fatalf("unexpected tab ids: %#v", pm.Items[0].TabIds)
	}
}
