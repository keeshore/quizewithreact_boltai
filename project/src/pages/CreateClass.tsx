import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { generateId, generateClassCode, hashPassword } from '../utils/helpers';
import { saveClass } from '../utils/storage';
import { Class } from '../types/quiz';

const CreateClass: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: '',
    maxMembers: 40,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (formData.maxMembers < 1 || formData.maxMembers > 40) {
      newErrors.maxMembers = 'Max members must be between 1 and 40';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsLoading(true);

    try {
      const passwordHash = await hashPassword(formData.password);
      const classCode = generateClassCode();
      
      const newClass: Class = {
        id: generateId(),
        classCode,
        name: formData.name.trim(),
        description: formData.description.trim(),
        passwordHash,
        maxMembers: formData.maxMembers,
        createdAt: new Date().toISOString(),
        creatorId: user.id, // Link to logged-in user
      };

      saveClass(newClass);
      navigate(`/class/${classCode}/manage`, { 
        state: { classPassword: formData.password } 
      });
    } catch (error) {
      console.error('Error creating class:', error);
      setErrors({ submit: 'Failed to create class. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return (
      <Layout title="Create Class">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to create a quiz class.
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
    <Layout title="Create Class">
      <div className="max-w-2xl mx-auto">
        <Card 
          title="Create a New Quiz Class" 
          subtitle={`Welcome ${user.name}! Set up your class and start adding questions`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Class Name *"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              placeholder="e.g., Biology Quiz, Math Test"
              maxLength={100}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Brief description of your quiz..."
                maxLength={500}
              />
            </div>

            <Input
              label="Class Password *"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              helpText="Students will need this password to join your class"
              minLength={4}
              maxLength={50}
            />

            <Input
              label="Maximum Members"
              type="number"
              value={formData.maxMembers}
              onChange={handleInputChange('maxMembers')}
              error={errors.maxMembers}
              helpText="Maximum number of students who can join (1-40)"
              min={1}
              max={40}
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
                {isLoading ? 'Creating...' : 'Create Class'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• You'll get a unique class code and join link</li>
            <li>• Add questions to your quiz</li>
            <li>• Share the join link and password with students</li>
            <li>• Monitor results and rankings in real-time</li>
            <li>• Access your class history anytime from your dashboard</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CreateClass;