import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Timer from '../components/Timer';
import Card from '../components/Card';
import { getParticipantByToken, getQuestionById, saveAnswer, updateParticipant, getAnswersByParticipantId } from '../utils/storage';
import { generateId, disableTextSelection, enableTextSelection } from '../utils/helpers';
import { Participant, Question, Answer } from '../types/quiz';
import { AlertTriangle } from 'lucide-react';

const Quiz: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showAntiCopyWarning, setShowAntiCopyWarning] = useState(true);

  // Load participant and setup quiz
  useEffect(() => {
    if (!token) return;

    // Verify token from sessionStorage for security
    const storedToken = sessionStorage.getItem('participantToken');
    if (storedToken !== token) {
      navigate('/');
      return;
    }

    const participantData = getParticipantByToken(token);
    if (!participantData) {
      navigate('/');
      return;
    }

    setParticipant(participantData);

    // Check if quiz is already completed
    if (participantData.finishedAt) {
      setQuizCompleted(true);
      return;
    }

    // Check if quiz was already in progress
    const existingAnswers = getAnswersByParticipantId(participantData.id);
    const answeredQuestionIds = existingAnswers.map(a => a.questionId);
    const unansweredQuestions = participantData.questionSequence.filter(
      qId => !answeredQuestionIds.includes(qId)
    );

    if (unansweredQuestions.length === 0) {
      // All questions answered, complete quiz
      completeQuiz(participantData, existingAnswers);
      return;
    }

    // Load current question
    const currentIndex = participantData.questionSequence.length - unansweredQuestions.length;
    setCurrentQuestionIndex(currentIndex);
    loadQuestion(unansweredQuestions[0]);
  }, [token, navigate]);

  // Enable anti-copy measures when quiz starts
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      disableTextSelection();
      return () => enableTextSelection();
    }
  }, [quizStarted, quizCompleted]);

  const loadQuestion = (questionId: string) => {
    const question = getQuestionById(questionId);
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setShowAntiCopyWarning(false);
    if (participant && participant.questionSequence.length > 0) {
      loadQuestion(participant.questionSequence[0]);
    }
  };

  const submitAnswer = (timeExpired: boolean = false) => {
    if (!participant || !currentQuestion) return;

    setIsLoading(true);

    const timeTaken = Date.now() - questionStartTime;
    const finalSelectedAnswer = timeExpired ? null : selectedAnswer;
    const isCorrect = finalSelectedAnswer === currentQuestion.correctIndex;

    const answer: Answer = {
      id: generateId(),
      participantId: participant.id,
      questionId: currentQuestion.id,
      selectedIndex: finalSelectedAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
      timeTakenMs: timeTaken,
    };

    saveAnswer(answer);

    // Move to next question or complete quiz
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= participant.questionSequence.length) {
      // Quiz completed
      const allAnswers = [...getAnswersByParticipantId(participant.id), answer];
      completeQuiz(participant, allAnswers);
    } else {
      // Next question
      setCurrentQuestionIndex(nextIndex);
      loadQuestion(participant.questionSequence[nextIndex]);
    }

    setIsLoading(false);
  };

  const completeQuiz = (participantData: Participant, allAnswers: Answer[]) => {
    const score = allAnswers.filter(a => a.isCorrect).length;
    const totalTime = allAnswers.reduce((sum, a) => sum + a.timeTakenMs, 0);

    const updatedParticipant: Participant = {
      ...participantData,
      score,
      totalTimeMs: totalTime,
      finishedAt: new Date().toISOString(),
    };

    updateParticipant(updatedParticipant);
    setParticipant(updatedParticipant);
    setQuizCompleted(true);
  };

  const handleTimeUp = () => {
    submitAnswer(true);
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    submitAnswer(false);
  };

  if (!participant) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (quizCompleted && participant.score !== undefined) {
    return (
      <Layout title="Quiz Completed">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
              <p className="text-gray-600">Great job, {participant.name}!</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {participant.score}
                  </div>
                  <div className="text-gray-600">Correct Answers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-700 mb-2">
                    {participant.questionSequence.length}
                  </div>
                  <div className="text-gray-600">Total Questions</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-lg font-semibold text-gray-700">
                  Final Score: {Math.round((participant.score / participant.questionSequence.length) * 100)}%
                </div>
                {participant.totalTimeMs && (
                  <div className="text-sm text-gray-500 mt-1">
                    Total time: {Math.round(participant.totalTimeMs / 1000)}s
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/class/${participant.classId}/results`)}
              >
                View Class Rankings
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  sessionStorage.removeItem('participantToken');
                  navigate('/');
                }}
              >
                Take Another Quiz
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showAntiCopyWarning) {
    return (
      <Layout title="Quiz Rules">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Rules & Guidelines</h2>
              <p className="text-gray-600">Please read carefully before starting</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-3">Important Notice:</h3>
              <ul className="text-yellow-800 space-y-2 text-sm">
                <li>• Each question has a 30-second timer</li>
                <li>• Questions are presented in random order</li>
                <li>• You cannot go back to previous questions</li>
                <li>• Copying, pasting, and text selection are disabled</li>
                <li>• Right-click and keyboard shortcuts are blocked</li>
                <li>• Your answers are automatically saved</li>
                <li>• The quiz must be completed in one session</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">Academic Integrity:</h3>
              <p className="text-red-800 text-sm">
                By starting this quiz, you agree to complete it honestly without external assistance, 
                cheating, or sharing content with others. Violations may result in disqualification.
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Ready to begin? You have {participant.questionSequence.length} questions to complete.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={startQuiz}
              >
                I Understand - Start Quiz
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!quizStarted || !currentQuestion) {
    return <Layout><div>Loading quiz...</div></Layout>;
  }

  return (
    <Layout title={`Question ${currentQuestionIndex + 1} of ${participant.questionSequence.length}`}>
      <div className="max-w-4xl mx-auto">
        <Card>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-600">
                {currentQuestionIndex + 1} / {participant.questionSequence.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentQuestionIndex + 1) / participant.questionSequence.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Timer */}
          <Timer
            duration={30}
            onTimeUp={handleTimeUp}
            isActive={!isLoading}
          />

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-primary bg-blue-50 text-primary font-medium'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isLoading}
            >
              {isLoading ? 'Submitting...' : 
               currentQuestionIndex === participant.questionSequence.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>

          {/* Anti-copy reminder */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Copying and pasting are disabled. Focus on the question and select your best answer.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Quiz;