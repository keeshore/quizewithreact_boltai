import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { BookOpen, Users, Trophy, Clock, CheckCircle, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to Quiz Tester
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create engaging quizzes, join classes, and test your knowledge in real-time. 
            Perfect for educators, trainers, and students looking for an interactive learning experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/register')}
              className="px-8 py-4"
            >
              Get Started Free
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="px-8 py-4"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <BookOpen className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Classes</h3>
            <p className="text-gray-600">
              Set up quiz classes with custom questions, timers, and participant limits. 
              Share join codes with your students.
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Users className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Join & Participate</h3>
            <p className="text-gray-600">
              Enter class codes to join quizzes. Take timed tests with shuffled questions 
              and see your results instantly.
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Track Results</h3>
            <p className="text-gray-600">
              View real-time rankings, detailed analytics, and participant performance 
              with comprehensive scoring systems.
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Clock className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Timed Quizzes</h3>
            <p className="text-gray-600">
              30-second timers per question keep participants engaged and test 
              knowledge under time pressure.
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Anti-Cheat</h3>
            <p className="text-gray-600">
              Built-in measures prevent copying, including disabled text selection 
              and randomized question orders.
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy Management</h3>
            <p className="text-gray-600">
              Manage all your classes, view participant history, and access 
              detailed reports from your personal dashboard.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up & Create</h3>
              <p className="text-gray-600">
                Create your free account and set up quiz classes with custom questions. 
                Generate unique join codes for your students.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Share & Participate</h3>
              <p className="text-gray-600">
                Students join using class codes and passwords. Take timed quizzes 
                with randomized questions for fair assessment.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Track & Analyze</h3>
              <p className="text-gray-600">
                View real-time results, class rankings, and detailed performance 
                analytics. Monitor progress over time.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators and students using Quiz Tester for interactive learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4"
            >
              Create Free Account
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-primary-dark hover:bg-primary border-white px-8 py-4"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;