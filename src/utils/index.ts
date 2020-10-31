
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export const getRandomCharactersCode = (length = 5): string => {
  let code = "";
  let i = 0;

  while (i < length) {
    const letterIndex = Math.floor(Math.random() * letters.length);
    const letter = letters[letterIndex];
    code += letter;
    i++;
  }

  return code
}