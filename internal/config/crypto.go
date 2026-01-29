package config

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"io"

	"golang.org/x/crypto/hkdf"
)

const BuildID = "v0.0.1"

var masterKey = []byte("hardcoded-random-master-key")

// deriveKey generates a 32-byte key using HKDF-SHA256
func deriveKey() ([]byte, error) {
	h := hkdf.New(sha256.New, masterKey, []byte(BuildID), []byte("chronolock"))
	key := make([]byte, 32)
	_, err := io.ReadFull(h, key)
	return key, err
}

// encryptBlob wraps the logic for AES-256-GCM encryption
func encryptBlob(plaintext []byte) ([]byte, error) {
	key, err := deriveKey()
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

// decryptBlob unwraps the logic for AES-256-GCM decryption
func decryptBlob(data []byte) ([]byte, error) {
	key, err := deriveKey()
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, io.ErrUnexpectedEOF
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	return gcm.Open(nil, nonce, ciphertext, nil)
}
