import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { 
  getClassByCode, 
  getParticipantsByClassId, 
  getQuestionsByClassId,
  getAnswersByParticipantId,
  getQuestionById 
} from '../utils/storage';
import { formatDate } from '../utils/helpers';
import { Class as QuizClass, Participant, Question, Answer } from '../types/quiz';
import { Trophy, User, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const ClassResults: React.FC = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<QuizClass | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [participantAnswers, setParticipantAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (classCode) {
      const classInfo = getClassByCode(classCode);
      if (classInfo) {
        setClassData(classInfo);
        
        const classParticipants = getParticipantsByClassId(classInfo.id);
        const finishedParticipants = classParticipants
          .filter(p => p.finishedAt && p.score !== undefined)
          .sort((a, b) => {
            // Sort by score (descending), then by time (ascending)
            if (a.score !== b.score) {
              return (b.score || 0) - (a.score || 0);
            }
            return (a.totalTimeMs || 0) - (b.totalTimeMs || 0);
          });
        
        setParticipants(finishedParticipants);
        
        const classQuestions = getQuestionsByClassId(classInfo.id);
        setQuestions(classQuestions);
      } else {
        navigate('/');
      }
    }
  }, [classCode, navigate]);

  const viewParticipantDetails = (participantId: string) => {
    setSelectedParticipant(participantId);
    const answers = getAnswersByParticipantId(participantId);
    setParticipantAnswers(answers);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-medium">{rank}</span>;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!classData) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (selectedParticipant) {
    const participant = participants.find(p => p.id === selectedParticipant);
    if (!participant) return null;

    return (
      <Layout title={`${participant.name}'s Answers`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => setSelectedParticipant(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rankings
            </Button>
          </div>

          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{participant.name}</h2>
                <p className="text-gray-600">
                  Score: {participant.score} / {questions.length} ({Math.round(((participant.score || 0) / questions.length) * 100)}%)
                </p>
              </div>
              <div className="text-right">
                {participant.totalTimeMs && (
                  <p className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {Math.round(participant.totalTimeMs / 1000)}s total
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Completed: {formatDate(participant.finishedAt!)}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            {participant.questionSequence.map((questionId, index) => {
              const question = getQuestionById(questionId);
              const answer = participantAnswers.find(a => a.questionId === questionId);
              
              if (!question || !answer) return null;

              return (
                <Card key={questionId}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-800">
                        Question {index + 1}
                      </h3>
                      <div className="flex items-center gap-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{question.text}</p>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = optIndex === question.correctIndex;
                      const isSelected = optIndex === answer.selectedIndex;
                      const wasNotAnswered = answer.selectedIndex === null;

                      let className = 'p-3 rounded-lg border-2 ';
                      
                      if (isCorrect) {
                        className += 'border-green-200 bg-green-50 text-green-800';
                      } else if (isSelected && !isCorrect) {
                        className += 'border-red-200 bg-red-50 text-red-800';
                      } else {
                        className += 'border-gray-200 bg-gray-50 text-gray-600';
                      }

                      return (
                        <div key={optIndex} className={className}>
                          <div className="flex items-center justify-between">
                            <span>
                              <strong>{String.fromCharCode(65 + optIndex)}.</strong> {option}
                            </span>
                            <div className="flex gap-2">
                              {isSelected && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Selected
                                </span>
                              )}
                              {isCorrect && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {answer.selectedIndex === null && (
                      <div className="p-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-500 text-center">
                        No answer selected (time expired)
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                    Time taken: {Math.round(answer.timeTakenMs / 1000)}s
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Results: ${classData.name}`}>
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{classData.name}</h2>
              {classData.description && (
                <p className="text-gray-600 mb-4">{classData.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Code: <strong className="text-primary">{classCode}</strong></span>
                <span>Questions: <strong>{questions.length}</strong></span>
                <span>Completed: <strong>{participants.length}</strong></span>
                <span>
                  Avg Score: <strong>
                    {participants.length > 0 
                      ? Math.round(participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length * 100) / 100
                      : 0
                    } / {questions.length}
                  </strong>
                </span>
              </div>
            </div>
            <div>
              <Button variant="secondary" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </Card>

        {participants.length === 0 ? (
          <Card className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Results Yet</h3>
            <p className="text-gray-500">
              Participants' results will appear here once they complete the quiz.
            </p>
          </Card>
        ) : (
          <Card title="Class Rankings" subtitle={`${participants.length} participants completed the quiz`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Score</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Percentage</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Time</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Completed</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participants.map((participant, index) => {
                    const rank = index + 1;
                    const score = participant.score || 0;
                    const percentage = Math.round((score / questions.length) * 100);
                    
                    return (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {getRankIcon(rank)}
                            <span className="ml-2 font-medium">{rank}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">{participant.name}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-semibold ${getScoreColor(score, questions.length)}`}>
                            {score} / {questions.length}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-medium ${getScoreColor(score, questions.length)}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {participant.totalTimeMs 
                            ? `${Math.round(participant.totalTimeMs / 1000)}s`
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {formatDate(participant.finishedAt!)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => viewParticipantDetails(participant.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {participants.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card title="Top Performer">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="font-semibold">{participants[0].name}</div>
                  <div className="text-sm text-gray-600">
                    {participants[0].score} / {questions.length} ({Math.round(((participants[0].score || 0) / questions.length) * 100)}%)
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Average Score">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length * 100) / 100}
                </div>
                <div className="text-sm text-gray-600">out of {questions.length}</div>
              </div>
            </Card>

            <Card title="Completion Rate">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((participants.length / classData.maxMembers) * 100)}%
                </div>
                <div className="text-sm text-gray-600">{participants.length} of {classData.maxMembers} max</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClassResults;