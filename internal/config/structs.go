package config

type PlaintextInput struct {
	Password string            `json:"basePassword"`
	Secrets  map[string]string `json:"secrets"`
}

type Config struct {
	BasePassword string
	Secrets      map[string]string
}

type EncryptedStore struct {
	Data []byte `json:"data"`
}
