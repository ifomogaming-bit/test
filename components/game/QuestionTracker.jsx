// Track questions used in current game session to prevent repeats
class QuestionTracker {
  constructor() {
    this.usedQuestions = new Set();
  }

  hasBeenUsed(questionText) {
    return this.usedQuestions.has(questionText);
  }

  markAsUsed(questionText) {
    this.usedQuestions.add(questionText);
  }

  reset() {
    this.usedQuestions.clear();
  }

  getSize() {
    return this.usedQuestions.size;
  }
}

export default new QuestionTracker();