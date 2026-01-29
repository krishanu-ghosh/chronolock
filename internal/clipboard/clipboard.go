package clipboard

import (
	"bytes"
	"errors"
	"os/exec"
	"runtime"
)

func Copy(data []byte) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("pbcopy")
	case "linux":
		cmd = exec.Command("xsel", "--clipboard", "--input")
	default:
		return errors.New("unsupported OS")
	}

	cmd.Stdin = bytes.NewReader(data)
	return cmd.Run()
}
