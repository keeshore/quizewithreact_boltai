import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { getClassByCode, saveParticipant, getParticipantsByClassId } from '../utils/storage';
import { verifyPassword, generateId, generateParticipantToken, shuffleArray } from '../utils/helpers';
import { Participant } from '../types/quiz';

const JoinClass: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classCode: urlClassCode } = useParams();
  const [formData, setFormData] = useState({
    classCode: urlClassCode || '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);

  React.useEffect(() => {
    if (urlClassCode) {
      const classData = getClassByCode(urlClassCode);
      if (classData) {
        setClassInfo(classData);
      } else {
        setErrors({ classCode: 'Class not found' });
      }
    }
  }, [urlClassCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.classCode.trim()) {
      newErrors.classCode = 'Class code is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Class password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsLoading(true);

    try {
      const classData = getClassByCode(formData.classCode.trim().toUpperCase());
      
      if (!classData) {
        setErrors({ classCode: 'Class not found. Please check the class code.' });
        setIsLoading(false);
        return;
      }

      // Check if password is correct
      const isPasswordValid = await verifyPassword(formData.password, classData.passwordHash);
      if (!isPasswordValid) {
        setErrors({ password: 'Invalid class password' });
        setIsLoading(false);
        return;
      }

      // Check if class is full
      const existingParticipants = getParticipantsByClassId(classData.id);
      if (existingParticipants.length >= classData.maxMembers) {
        setErrors({ submit: 'This class is full. Maximum participants reached.' });
        setIsLoading(false);
        return;
      }

      // Check if user already joined this class
      const userAlreadyJoined = existingParticipants.some(p => p.userId === user.id);
      if (userAlreadyJoined) {
        setErrors({ submit: 'You have already joined this class.' });
        setIsLoading(false);
        return;
      }

      // Get questions and shuffle them for this participant
      const questions = JSON.parse(localStorage.getItem('quiz_questions') || '[]')
        .filter((q: any) => q.classId === classData.id);
      
      const shuffledQuestionIds = shuffleArray(questions.map((q: any) => q.id));

      const participant: Participant = {
        id: generateId(),
        classId: classData.id,
        name: user.name,
        userId: user.id, // Link to logged-in user
        joinedAt: new Date().toISOString(),
        questionSequence: shuffledQuestionIds,
        token: generateParticipantToken(),
      };

      saveParticipant(participant);
      
      // Store participant token in sessionStorage for security
      sessionStorage.setItem('participantToken', participant.token);
      
      navigate(`/quiz/${participant.token}`);
    } catch (error) {
      console.error('Error joining class:', error);
      setErrors({ submit: 'Failed to join class. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'classCode' ? e.target.value.toUpperCase() : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Load class info when class code changes
    if (field === 'classCode' && value.length === 6) {
      const classData = getClassByCode(value);
      setClassInfo(classData);
      if (!classData) {
        setErrors(prev => ({ ...prev, classCode: 'Class not found' }));
      }
    }
  };

  if (!user) {
    return (
      <Layout title="Join Class">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to join a quiz class.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="secondary" onClick={() => navigate('/register')}>
                Create Account
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Join Class">
      <div className="max-w-2xl mx-auto">
        <Card 
          title="Join a Quiz Class" 
          subtitle={`Welcome ${user.name}! Enter the class details to participate`}
        >
          {classInfo && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">{classInfo.name}</h3>
              {classInfo.description && (
                <p className="text-blue-800 text-sm mt-1">{classInfo.description}</p>
              )}
              <p className="text-blue-700 text-sm mt-2">
                Max participants: {classInfo.maxMembers} | 
                Current: {getParticipantsByClassId(classInfo.id).length}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Class Code *"
              type="text"
              value={formData.classCode}
              onChange={handleInputChange('classCode')}
              error={errors.classCode}
              placeholder="e.g., ABC123"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />

            <Input
              label="Class Password *"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              placeholder="Enter the class password"
            />

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Joining...' : 'Join Class'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 bg-yellow-50 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Quiz Rules</h3>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• Each question has a 30-second timer</li>
            <li>• Questions are presented one at a time in random order</li>
            <li>• Copying or pasting content is disabled during the quiz</li>
            <li>• You cannot go back to previous questions</li>
            <li>• Your answers are saved automatically</li>
            <li>• Results and rankings are shown after completion</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default JoinClass;