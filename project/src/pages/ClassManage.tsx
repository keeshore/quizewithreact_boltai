import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { getClassByCode, saveQuestion, getQuestionsByClassId, getParticipantsByClassId } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { Question, Class as QuizClass } from '../types/quiz';
import { Plus, Copy, Users, BarChart } from 'lucide-react';

const ClassManage: React.FC = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const classPassword = location.state?.classPassword;

  const [classData, setClassData] = useState<QuizClass | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', ''],
    correctIndex: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classCode) {
      const classInfo = getClassByCode(classCode);
      if (classInfo) {
        setClassData(classInfo);
        const classQuestions = getQuestionsByClassId(classInfo.id);
        setQuestions(classQuestions);
        const classParticipants = getParticipantsByClassId(classInfo.id);
        setParticipants(classParticipants);
      } else {
        navigate('/');
      }
    }
  }, [classCode, navigate]);

  const joinUrl = `${window.location.origin}/join/${classCode}`;

  const copyJoinInfo = async () => {
    const info = `Quiz Class: ${classData?.name}\nJoin URL: ${joinUrl}\nClass Code: ${classCode}\nPassword: ${classPassword || '[Ask instructor]'}`;
    try {
      await navigator.clipboard.writeText(info);
      alert('Class information copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const addOption = () => {
    if (newQuestion.options.length < 5) {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 2) {
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        correctIndex: prev.correctIndex >= index && prev.correctIndex > 0 
          ? prev.correctIndex - 1 
          : prev.correctIndex
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const validateQuestion = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newQuestion.text.trim()) {
      newErrors.text = 'Question text is required';
    }

    const validOptions = newQuestion.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    if (!newQuestion.options[newQuestion.correctIndex]?.trim()) {
      newErrors.correctIndex = 'Please select a valid correct answer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveNewQuestion = () => {
    if (!validateQuestion() || !classData) return;

    const question: Question = {
      id: generateId(),
      classId: classData.id,
      text: newQuestion.text.trim(),
      options: newQuestion.options.filter(opt => opt.trim()),
      correctIndex: newQuestion.correctIndex,
      orderIndex: questions.length,
      createdAt: new Date().toISOString(),
    };

    saveQuestion(question);
    setQuestions(prev => [...prev, question]);
    setNewQuestion({ text: '', options: ['', ''], correctIndex: 0 });
    setShowAddQuestion(false);
  };

  if (!classData) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout title={`Manage: ${classData.name}`}>
      <div className="max-w-6xl mx-auto">
        {/* Class Info Card */}
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{classData.name}</h2>
              {classData.description && (
                <p className="text-gray-600 mb-4">{classData.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Code: <strong className="text-primary">{classCode}</strong></span>
                <span>Max Members: <strong>{classData.maxMembers}</strong></span>
                <span>Current: <strong>{participants.length}</strong></span>
                <span>Questions: <strong>{questions.length}</strong></span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={copyJoinInfo}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Join Info
              </Button>
              <Button variant="primary" onClick={() => navigate(`/class/${classCode}/results`)}>
                <BarChart className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </div>
          </div>
        </Card>

        {/* Join Information */}
        <Card className="mb-8" title="Share with Students">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <strong>Join URL:</strong>
              <div className="mt-1 p-2 bg-white border rounded text-sm break-all">
                {joinUrl}
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <strong>Class Code:</strong> <span className="font-mono text-primary">{classCode}</span>
              </div>
              {classPassword && (
                <div>
                  <strong>Password:</strong> <span className="font-mono">{classPassword}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Participants */}
        {participants.length > 0 && (
          <Card className="mb-8" title={`Participants (${participants.length})`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((participant: any) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{participant.name}</span>
                  {participant.score !== undefined && (
                    <span className="ml-auto text-sm text-primary font-semibold">
                      {participant.score}/{questions.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Questions Management */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Questions List */}
          <Card 
            title={`Questions (${questions.length})`}
            subtitle="Manage your quiz questions"
          >
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Q{index + 1}</h4>
                  </div>
                  <p className="text-gray-700 mb-3">{question.text}</p>
                  <div className="space-y-1">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`text-sm p-2 rounded ${
                          optIndex === question.correctIndex 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === question.correctIndex && (
                          <span className="ml-2 text-xs font-medium">(Correct)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet.</p>
                  <p className="text-sm">Add your first question to get started!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Add Question */}
          <div className="space-y-6">
            {!showAddQuestion ? (
              <Card>
                <div className="text-center py-8">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Add New Question</h3>
                  <p className="text-gray-600 mb-4">
                    Create multiple choice questions for your quiz
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddQuestion(true)}
                  >
                    Add Question
                  </Button>
                </div>
              </Card>
            ) : (
              <Card title="Add New Question">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={3}
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter your question..."
                    />
                    {errors.text && <p className="text-red-600 text-sm mt-1">{errors.text}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={index === newQuestion.correctIndex}
                            onChange={() => setNewQuestion(prev => ({ ...prev, correctIndex: index }))}
                            className="text-primary"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          {newQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.options && <p className="text-red-600 text-sm mt-1">{errors.options}</p>}
                    {errors.correctIndex && <p className="text-red-600 text-sm mt-1">{errors.correctIndex}</p>}
                    
                    {newQuestion.options.length < 5 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addOption}
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAddQuestion(false);
                        setNewQuestion({ text: '', options: ['', ''], correctIndex: 0 });
                        setErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={saveNewQuestion}
                    >
                      Save Question
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassManage;