package utility

import (
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

func GenerateID() (string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		err = errors.Wrap(err, "failed to generate UUID")
		return "", err
	}
	return id.String(), nil
}
