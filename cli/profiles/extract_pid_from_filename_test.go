package profiles

import "testing"

func TestExtractPidFromFilename(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		filename string
		want     int
	}{
		{"basic", "12345_firefox-abc.json", 12345},
		{"single segment", "999.json", 999},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := extractPidFromFilename(tt.filename)
			if err != nil {
				t.Fatalf("extractPidFromFilename: %v", err)
			}
			if got != tt.want {
				t.Fatalf("pid: want %d got %d", tt.want, got)
			}
		})
	}
}

func TestExtractPidFromFilenameErrors(t *testing.T) {
	t.Parallel()

	_, err := extractPidFromFilename("notapid_rest.json")
	if err == nil {
		t.Fatal("expected error for non-numeric pid prefix")
	}
}
