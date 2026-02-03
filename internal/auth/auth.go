package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

func ValidTimePassword(input []byte, base string) bool {
	now := time.Now()
	for _, d := range []int{-1, 0, 1} {
		if string(input) == timePassword(base, now.Add(time.Minute*time.Duration(d))) {
			return true
		}
	}
	return false
}

func timePassword(base string, t time.Time) string {
	return fmt.Sprintf("%s%d%s%s",
		base,
		t.Day(),
		strings.ToLower(t.Month().String()[:1]),
		t.Format("1504"),
	)
}

func NewSession() []byte {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	dst := make([]byte, hex.EncodedLen(len(b)))
	hex.Encode(dst, b)
	return dst
}

func dayToken(t time.Time) string {
	weekday := strings.ToLower(t.Weekday().String()[:1])
	day := t.Day()
	return fmt.Sprintf("%s%d", weekday, day)
}

func ValidDailySecret(input, session []byte) bool {
	inStr := string(input)
	sessStr := string(session)

	inStr = strings.TrimSpace(inStr)
	sessStr = strings.TrimSpace(sessStr)

	return inStr == sessStr+dayToken(time.Now())+sessStr
}
