export function scoreQuiz(quiz, selectedIndices) {
  const results = quiz.map((question, index) => ({
    correct: selectedIndices[index] === question.answerIndex,
    explanation: question.explanation,
  }));
  const correct = results.filter((result) => result.correct).length;
  const total = results.length;

  return {
    correct,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    results,
  };
}
