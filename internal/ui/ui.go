package ui

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"

	"golang.org/x/term"
)

func Clear(msg string) {
	cmd := exec.Command("clear")
	cmd.Stdout = os.Stdout
	cmd.Run()
	if msg != "" {
		fmt.Println(msg)
	}
}

func ReadHidden(prompt string) ([]byte, error) {
	fmt.Print(prompt)
	bytePassword, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Println()
	return bytePassword, err
}

func Zero(b []byte) {
	for i := range b {
		b[i] = 0
	}
}

func SelectSecret(secrets map[string]string, statusMsg string) (string, bool, error) {
	keys := make([]string, 0, len(secrets))
	for k := range secrets {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	Clear(statusMsg)
	fmt.Println("Available Secrets:")
	for i, key := range keys {
		fmt.Printf("[%d] %s\n", i+1, key)
	}

	exitIndex := len(keys) + 1
	fmt.Printf("[%d] Exit\n", exitIndex)

	fmt.Printf("\nSelect (1-%d): ", exitIndex)

	reader := bufio.NewReader(os.Stdin)
	input, err := reader.ReadString('\n')
	if err != nil {
		return "", false, err
	}

	input = strings.TrimSpace(input)
	index, err := strconv.Atoi(input)
	if err != nil || index < 1 || index > exitIndex {
		return "", false, fmt.Errorf("invalid selection")
	}

	if index == exitIndex {
		return "", true, nil
	}

	return keys[index-1], false, nil
}
