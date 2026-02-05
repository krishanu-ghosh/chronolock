package main

import (
	"fmt"
	"os"
	"time"

	"chronolock/internal/auth"
	"chronolock/internal/clipboard"
	"chronolock/internal/config"
	"chronolock/internal/ui"
)

const BuildId = "v0.0.1"

func main() {
	if len(os.Args) == 3 && os.Args[1] == "--setup" {
		if os.Args[2] == "" {
			ui.Clear("Usage: chronolock --setup [path-of-keys-file]")
			os.Exit(1)
		}
		if err := config.Setup(os.Args[2]); err != nil {
			fmt.Printf("Setup failed: %v\n", err)
			os.Exit(1)
		}
		return
	}
	configPath, err := config.GetConfigPath()
	cfg, err := config.Load(configPath)
	if err != nil {
		ui.Clear("Access denied.")
		os.Exit(1)
	}

	fmt.Println("Chronolock", config.BuildID)

	pass, err := ui.ReadHidden("Pass: ")
	if err != nil || !auth.ValidTimePassword(pass, cfg.BasePassword) {
		ui.Clear("Wrong password.")
		os.Exit(1)
	}
	ui.Zero(pass)

	session := auth.NewSession()
	if err := clipboard.Copy(session); err != nil {
		ui.Clear("Clipboard error.")
		os.Exit(1)
	}

	secret, err := ui.ReadHidden("Secret: ")
	if err != nil || !auth.ValidDailySecret(secret, session) {
		ui.Clear("Wrong secret.")
		os.Exit(1)
	}
	ui.Zero(secret)

	go func() {
		time.Sleep(120 * time.Second)
		ui.Clear("Session timed out.")
		os.Exit(0)
	}()

	status := "Authenticated."

	for {
		choiceKey, shouldExit, err := ui.SelectSecret(cfg.Secrets, status)

		if err != nil {
			status = fmt.Sprintf("Error: %v", err)
			continue
		}

		if shouldExit {
			ui.Clear("Bye.")
			break
		}

		tokenValue := cfg.Secrets[choiceKey]
		if err := clipboard.Copy([]byte(tokenValue)); err != nil {
			status = "Clipboard error."
		} else {
			status = fmt.Sprintf("COPIED: '%s' (Ready to paste)", choiceKey)
		}
	}
}
