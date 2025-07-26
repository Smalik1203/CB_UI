import React from 'react';
import { useAuth } from '../AuthProvider';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button, 
  List, 
  Avatar, 
  Badge, 
  Space,
  Progress,
  Timeline
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * DASHBOARD COMPONENT - Main Landing Page
 * 
 * CHANGES MADE:
 * - Converted from basic HTML to professional Ant Design components
 * - Added role-based statistics and content
 * - Implemented responsive grid layout
 * - Added interactive cards with hover effects
 * - Integrated timeline for recent activities
 * - Added performance overview with progress indicators
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace hardcoded statistics with real-time data from Supabase
 * - Implement role-based data filtering
 * - Add real-time activity feed
 * - Integrate performance metrics calculation
 * - Add caching for frequently accessed data
 */
const Dashboard = () => {
  const { user } = useAuth();
  
  // BACKEND INTEGRATION: Replace with actual user data from Supabase auth
  // Query: SELECT role, full_name, school_name FROM users WHERE id = user.id
  const role = user?.user_metadata?.role || 'admin';
  const userName = user?.user_metadata?.full_name || 'User';
  const schoolName = user?.user_metadata?.school_name || 'Demo School';

  /**
   * STATISTICS DATA - Role-based dashboard metrics
   * 
   * BACKEND INTEGRATION NEEDED:
   * - CB Admin: Query schools, super_admins, users, system_health tables
   * - Super Admin: Query classes, students, teachers, attendance tables
   * - Admin: Query assigned classes, students, attendance, assignments
   * - Student: Query subjects, attendance, grades, assignments for current user
   * - Parent: Query children data, attendance, performance, notifications
   * 
   * Example Queries:
   * - Total Schools: SELECT COUNT(*) FROM schools WHERE status = 'active'
   * - Students: SELECT COUNT(*) FROM students WHERE school_id = user.school_id
   * - Attendance Rate: SELECT AVG(attendance_percentage) FROM attendance_summary WHERE date >= current_month
   */
  const getStatsForRole = (role) => {
    const statsMap = {
      'cb_admin': [
        { title: 'Total Schools', value: 12, icon: <BankOutlined />, color: '#1890ff', trend: 8.2 },
        { title: 'Super Admins', value: 24, icon: <UserOutlined />, color: '#52c41a', trend: 12.5 },
        { title: 'Active Users', value: 1250, icon: <TeamOutlined />, color: '#722ed1', trend: -2.1 },
      ],
      'superadmin': [
        { title: 'Total Classes', value: 15, icon: <BookOutlined />, color: '#1890ff', trend: 15.2 },
        { title: 'Students', value: 450, icon: <TeamOutlined />, color: '#52c41a', trend: 8.7 },
        { title: 'Teachers', value: 28, icon: <UserOutlined />, color: '#722ed1', trend: 5.3 },
        { title: 'Attendance Rate', value: 94, suffix: '%', icon: <CalendarOutlined />, color: '#fa8c16', trend: 2.1 }
      ],
      'admin': [
        { title: 'My Classes', value: 6, icon: <BookOutlined />, color: '#1890ff', trend: 0 },
        { title: 'Students', value: 180, icon: <TeamOutlined />, color: '#52c41a', trend: 5.2 },
        { title: 'Attendance Rate', value: 92, suffix: '%', icon: <CalendarOutlined />, color: '#722ed1', trend: 1.8 },
        { title: 'Assignments', value: 24, icon: <TrophyOutlined />, color: '#fa8c16', trend: -3.2 }
      ],
      'student': [
        { title: 'Subjects', value: 8, icon: <BookOutlined />, color: '#1890ff', trend: 0 },
        { title: 'Attendance', value: 92, suffix: '%', icon: <CalendarOutlined />, color: '#52c41a', trend: 2.5 },
        { title: 'Average Grade', value: 85, suffix: '%', icon: <TrophyOutlined />, color: '#722ed1', trend: 5.1 },
        { title: 'Assignments', value: 12, icon: <BookOutlined />, color: '#fa8c16', trend: -1.2 }
      ],
      'parent': [
        { title: 'Children', value: 2, icon: <TeamOutlined />, color: '#1890ff', trend: 0 },
        { title: 'Avg Attendance', value: 95, suffix: '%', icon: <CalendarOutlined />, color: '#52c41a', trend: 1.5 },
        { title: 'Avg Performance', value: 88, suffix: '%', icon: <TrophyOutlined />, color: '#722ed1', trend: 3.2 },
        { title: 'Notifications', value: 3, icon: <ExclamationCircleOutlined />, color: '#fa8c16', trend: 0 }
      ]
    };
    return statsMap[role] || statsMap['admin'];
  };

  /**
   * RECENT ACTIVITIES - Role-based activity feed
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Query activity_logs table with role-based filtering
   * - Real-time updates using Supabase subscriptions
   * - Pagination for large activity lists
   * 
   * Example Query:
   * SELECT * FROM activity_logs 
   * WHERE user_id = user.id OR (role_visibility @> ARRAY[user.role])
   * ORDER BY created_at DESC LIMIT 10
   */
  const getRecentActivities = (role) => {
    const activitiesMap = {
      'superadmin': [
        { title: 'Class created', description: 'Grade 11 - Section C added', time: '1 hour ago', type: 'success' },
        { title: 'Student enrolled', description: '25 new students added to Grade 10', time: '3 hours ago', type: 'info' },
        { title: 'Teacher assigned', description: 'Math teacher assigned to Grade 9', time: '5 hours ago', type: 'success' },
        { title: 'Academic year setup', description: '2024-25 academic year configured', time: '1 day ago', type: 'info' }
      ],
      'admin': [
        { title: 'Attendance marked', description: 'Grade 10-A attendance completed', time: '2 hours ago', type: 'success' },
        { title: 'Assignment graded', description: 'Math homework reviewed for 25 students', time: '4 hours ago', type: 'info' },
        { title: 'Parent meeting', description: 'Scheduled meeting with 5 parents', time: '6 hours ago', type: 'warning' },
        { title: 'Report generated', description: 'Monthly progress report created', time: '1 day ago', type: 'success' }
      ],
      'student': [
        { title: 'Assignment submitted', description: 'Math homework submitted on time', time: '1 hour ago', type: 'success' },
        { title: 'Grade received', description: 'Science test: 85/100', time: '3 hours ago', type: 'info' },
        { title: 'Attendance marked', description: 'Present in all classes today', time: '5 hours ago', type: 'success' },
        { title: 'New assignment', description: 'English essay due next week', time: '1 day ago', type: 'warning' }
      ],
      'parent': [
        { title: 'Child attendance', description: 'Amit present in all classes', time: '2 hours ago', type: 'success' },
        { title: 'Grade update', description: 'Priya scored 90% in Math test', time: '4 hours ago', type: 'info' },
        { title: 'Parent meeting', description: 'Meeting scheduled with class teacher', time: '6 hours ago', type: 'warning' },
        { title: 'Fee reminder', description: 'Monthly fee due in 3 days', time: '1 day ago', type: 'warning' }
      ]
    };
    return activitiesMap[role] || activitiesMap['admin'];
  };

  /**
   * QUICK ACTIONS - Role-based action buttons
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Dynamic action generation based on user permissions
   * - Feature flag integration for enabling/disabling actions
   * - Usage analytics for popular actions
   */
  const getQuickActions = (role) => {
    const actionsMap = {
      'superadmin': [
        { title: 'Add Classes', description: 'Create new class sections', color: '#1890ff' },
        { title: 'Manage Students', description: 'Student enrollment and management', color: '#52c41a' },
        { title: 'View Reports', description: 'School performance analytics', color: '#722ed1' },
        { title: 'School Settings', description: 'Configure school parameters', color: '#fa8c16' }
      ],
      'admin': [
        { title: 'Mark Attendance', description: 'Daily attendance management', color: '#1890ff' },
        { title: 'Grade Assignments', description: 'Review and grade submissions', color: '#52c41a' },
        { title: 'View Students', description: 'Student information and progress', color: '#722ed1' },
        { title: 'Generate Reports', description: 'Class performance reports', color: '#fa8c16' }
      ],
      'student': [
        { title: 'View Grades', description: 'Check your academic scores', color: '#1890ff' },
        { title: 'Attendance', description: 'Track your attendance record', color: '#52c41a' },
        { title: 'Assignments', description: 'View pending assignments', color: '#722ed1' },
        { title: 'Schedule', description: 'Class timetable and events', color: '#fa8c16' }
      ],
      'parent': [
        { title: 'Child Progress', description: 'Academic performance tracking', color: '#1890ff' },
        { title: 'Attendance Records', description: 'View attendance history', color: '#52c41a' },
        { title: 'Communications', description: 'Messages from school', color: '#722ed1' },
        { title: 'Meetings', description: 'Parent-teacher appointments', color: '#fa8c16' }
      ]
    };
    return actionsMap[role] || actionsMap['admin'];
  };

  const stats = getStatsForRole(role);
  const quickActions = getQuickActions(role);

  // UTILITY FUNCTIONS: Could be moved to utils for reusability
  const getRoleDisplay = (role) => {
    const roleMap = {
      'cb_admin': 'CB Administrator',
      'superadmin': 'Super Administrator',
      'admin': 'Administrator',
      'teacher': 'Teacher',
      'student': 'Student',
      'parent': 'Parent'
    };
    return roleMap[role] || 'User';
  };

  const getWelcomeMessage = (role) => {
    const messages = {
      'cb_admin': 'Manage schools and administrators across the platform',
      'superadmin': 'Set up and manage your school system',
      'admin': 'Manage classes, students, and daily operations',
      'student': 'Track your progress and stay updated with your classes',
      'parent': 'Monitor your children\'s academic progress'
    };
    return messages[role] || 'Welcome to ClassBridge';
  };

  return (
    <Content style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
              Welcome back, {userName}!
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {getWelcomeMessage(role)}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                style={{ 
                  background: '#6366f1', 
                  borderColor: '#6366f1',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                {getRoleDisplay(role)}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                background: '#ffffff'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
                titleStyle={{ color: '#64748b', fontWeight: 500 }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>
                  {stat.trend > 0 ? (
                    <Space>
                      <ArrowUpOutlined style={{ color: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>+{stat.trend}%</span>
                    </Space>
                  ) : stat.trend < 0 ? (
                    <Space>
                      <ArrowDownOutlined style={{ color: '#ef4444' }} />
                      <span style={{ color: '#ef4444' }}>{stat.trend}%</span>
                    </Space>
                  ) : (
                    <span>No change</span>
                  )}
                  <span style={{ marginLeft: '8px' }}>from last month</span>
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content Grid */}
    

      {/* Performance Overview (for admin and above) */}
      {['superadmin', 'admin'].includes(role) && (
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card 
              title="Performance Overview"
              style={{ 
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                background: '#ffffff'
              }}
              headStyle={{ borderBottom: '1px solid #e2e8f0' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={85}
                      format={percent => `${percent}%`}
                      strokeColor="#10b981"
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong style={{ color: '#1e293b' }}>Overall Performance</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={92}
                      format={percent => `${percent}%`}
                      strokeColor="#6366f1"
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong style={{ color: '#1e293b' }}>Attendance Rate</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={78}
                      format={percent => `${percent}%`}
                      strokeColor="#f59e0b"
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong style={{ color: '#1e293b' }}>Assignment Completion</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </Content>
  );
};

export default Dashboard;