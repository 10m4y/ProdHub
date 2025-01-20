package helpers


func Contains(collaborators []string, userID string) bool {
	for _, id := range collaborators {
		if id == userID {
			return true
		}
	}
	return false
}