
// Utility functions for Assistant context

// Clean text for speech synthesis (remove markdown symbols)
export function cleanTextForSpeech(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n\n/g, '. ')
    .replace(/\n/g, ' ');
}
