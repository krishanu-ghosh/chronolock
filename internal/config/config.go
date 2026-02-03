package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
)

// Setup reads plaintext input, encrypts it, and overwrites keys.json
func Setup(inputPath string) error {
	raw, err := os.ReadFile(inputPath)
	if err != nil {
		return err
	}

	var input PlaintextInput
	if err := json.Unmarshal(raw, &input); err != nil {
		return errors.New("invalid data.json format")
	}

	if len(input.Secrets) == 0 {
		return errors.New("invalid keys.json file or already encrypted")
	}

	cfgData := Config{
		BasePassword: input.Password,
		Secrets:      input.Secrets,
	}

	payload, err := json.Marshal(cfgData)
	if err != nil {
		return err
	}

	encryptedData, err := encryptBlob(payload)
	if err != nil {
		return errors.New("encryption failed")
	}

	store := EncryptedStore{Data: encryptedData}
	output, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return err
	}

	if err := os.WriteFile("keys.json", output, 0400); err != nil {
		return fmt.Errorf("failed to write keys.json: %v", err)
	}

	if err := setImmutable("keys.json"); err != nil {
		// TODO: We don't fail the whole setup, but we warn the user, will do the refinement later.
		fmt.Printf("Warning: Could not set elevate security (requires sudo). File is Read-Only but deletable.\nError: %v\n", err)
	} else {
		fmt.Println("Security: 'keys.json' has been locked.")
	}

	return nil
}

func Load(path string) (*Config, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var store EncryptedStore
	if err := json.Unmarshal(raw, &store); err != nil {
		return nil, errors.New("corrupted keys.json structure")
	}

	plaintext, err := decryptBlob(store.Data)
	if err != nil {
		return nil, errors.New("decryption failed or invalid key")
	}

	var cfg Config
	if err := json.Unmarshal(plaintext, &cfg); err != nil {
		return nil, errors.New("malformed configuration data")
	}

	return &cfg, nil
}

func setImmutable(path string) error {
	pathCmd, err := exec.LookPath("chattr")
	if err != nil {
		return errors.New("chattr command not found")
	}

	cmd := exec.Command(pathCmd, "+i", path)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("%s: %v", string(output), err)
	}
	return nil
}
