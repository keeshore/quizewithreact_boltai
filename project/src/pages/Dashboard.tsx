import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { 
  getFromStorage, 
  getClassByCode, 
  getParticipantsByClassId, 
  getQuestionsByClassId 
} from '../utils/storage';
import { formatDate } from '../utils/helpers';
import { Class, Participant } from '../types/quiz';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Clock, 
  Plus, 
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [createdClasses, setCreatedClasses] = useState<Class[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<{ class: Class; participant: Participant }[]>([]);
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalJoined: 0,
    totalParticipants: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Load created classes
    const allClasses = getFromStorage<Class>('quiz_classes');
    const userCreatedClasses = allClasses.filter(c => c.creatorId === user.id);
    setCreatedClasses(userCreatedClasses);

    // Load joined classes
    const allParticipants = getFromStorage<Participant>('quiz_participants');
    const userParticipants = allParticipants.filter(p => p.name.includes(user.name) || p.id.includes(user.id));
    
    const joinedClassesData = userParticipants
      .map(participant => {
        const classData = getClassByCode(allClasses.find(c => c.id === participant.classId)?.classCode || '');
        return classData ? { class: classData, participant } : null;
      })
      .filter(item => item !== null) as { class: Class; participant: Participant }[];
    
    setJoinedClasses(joinedClassesData);

    // Calculate stats
    const totalParticipants = userCreatedClasses.reduce((sum, cls) => {
      return sum + getParticipantsByClassId(cls.id).length;
    }, 0);

    const finishedParticipants = userParticipants.filter(p => p.finishedAt && p.score !== undefined);
    const averageScore = finishedParticipants.length > 0 
      ? finishedParticipants.reduce((sum, p) => sum + (p.score || 0), 0) / finishedParticipants.length
      : 0;

    setStats({
      totalCreated: userCreatedClasses.length,
      totalJoined: joinedClassesData.length,
      totalParticipants,
      averageScore,
    });
  }, [user]);

  if (!user) return null;

  return (
    <Layout title={`Welcome, ${user.name}`}>
      <div className="max-w-6xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalCreated}</div>
            <div className="text-sm text-gray-600">Classes Created</div>
          </Card>
          
          <Card className="text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalJoined}</div>
            <div className="text-sm text-gray-600">Classes Joined</div>
          </Card>
          
          <Card className="text-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalParticipants}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </Card>
          
          <Card className="text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8" title="Quick Actions">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/create-class')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Class
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/join-class')}
            >
              <Users className="w-5 h-5 mr-2" />
              Join a Class
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Created Classes */}
          <Card 
            title="My Classes" 
            subtitle={`${createdClasses.length} classes created`}
          >
            {createdClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't created any classes yet</p>
                <Button variant="primary" onClick={() => navigate('/create-class')}>
                  Create Your First Class
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {createdClasses.slice(0, 5).map(cls => {
                  const participants = getParticipantsByClassId(cls.id);
                  const questions = getQuestionsByClassId(cls.id);
                  
                  return (
                    <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{cls.name}</h3>
                          {cls.description && (
                            <p className="text-sm text-gray-600 mb-2">{cls.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Code: <strong className="text-primary">{cls.classCode}</strong></span>
                            <span>Questions: {questions.length}</span>
                            <span>Students: {participants.length}/{cls.maxMembers}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {formatDate(cls.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/class/${cls.classCode}/manage`)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/class/${cls.classCode}/results`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {createdClasses.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="secondary" size="sm">
                      View All ({createdClasses.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Joined Classes */}
          <Card 
            title="Joined Classes" 
            subtitle={`${joinedClasses.length} classes joined`}
          >
            {joinedClasses.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't joined any classes yet</p>
                <Button variant="secondary" onClick={() => navigate('/join-class')}>
                  Join a Class
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {joinedClasses.slice(0, 5).map(({ class: cls, participant }) => {
                  const questions = getQuestionsByClassId(cls.id);
                  const isCompleted = participant.finishedAt && participant.score !== undefined;
                  
                  return (
                    <div key={participant.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{cls.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Code: <strong className="text-primary">{cls.classCode}</strong></span>
                            {isCompleted ? (
                              <span className="text-green-600 font-medium">
                                Score: {participant.score}/{questions.length}
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-medium">In Progress</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Joined: {formatDate(participant.joinedAt)}
                            {participant.finishedAt && (
                              <span> • Completed: {formatDate(participant.finishedAt)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!isCompleted && participant.questionSequence.length > 0 && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                // Resume quiz if not completed
                                sessionStorage.setItem('participantToken', participant.token);
                                navigate(`/quiz/${participant.token}`);
                              }}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/class/${cls.classCode}/results`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {joinedClasses.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="secondary" size="sm">
                      View All ({joinedClasses.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8" title="Recent Activity">
          <div className="space-y-3">
            {[...createdClasses, ...joinedClasses.map(jc => ({ ...jc.class, type: 'joined', participant: jc.participant }))]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {item.type === 'joined' ? (
                    <Users className="w-5 h-5 text-green-600" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-primary" />
                  )}
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {item.type === 'joined' ? 'Joined' : 'Created'} • {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/class/${item.classCode}/results`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            
            {createdClasses.length === 0 && joinedClasses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;