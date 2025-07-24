import React from 'react';
import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { 
  UserAddOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  UnorderedListOutlined, 
  TeamOutlined,
  SettingOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useAuth } from '../AuthProvider';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * SETUP SCHOOL COMPONENT - School Configuration Dashboard
 * 
 * CHANGES MADE:
 * - Converted from basic HTML layout to professional Ant Design components
 * - Added comprehensive setup workflow with step-by-step guidance
 * - Implemented responsive card-based layout with visual hierarchy
 * - Added color-coded setup steps with professional icons
 * - Integrated school context display from current user
 * - Added quick actions section for common tasks
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace hardcoded setup steps with dynamic progress tracking
 * - Add completion status for each setup step
 * - Implement setup validation and prerequisites
 * - Add progress analytics and completion metrics
 * - Include setup recommendations based on school type
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Setup Progress Query: SELECT * FROM school_setup_progress WHERE school_code = user.school_code
 * - Completion Tracking: UPDATE school_setup_progress SET completed = true WHERE step = 'step_name'
 * - Analytics Query: SELECT COUNT(*) FROM admins, classes, students WHERE school_code = user.school_code
 */
const SetupSchool = () => {
  const { user } = useAuth();
  console.log('SuperAdmin : ', user);

  /**
   * SETUP STEPS CONFIGURATION
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Make steps dynamic based on school type and requirements
   * - Add completion status tracking for each step
   * - Include estimated time and difficulty for each step
   * - Add prerequisites and dependencies between steps
   * - Include help documentation and video tutorials
   * 
   * ENHANCED STEP STRUCTURE:
   * {
   *   id: 'add_admin',
   *   title: 'Add School Admin',
   *   description: 'Create administrator accounts for your school',
   *   icon: <UserAddOutlined />,
   *   link: '/add-school-admin',
   *   color: '#1890ff',
   *   completed: false,
   *   required: true,
   *   estimatedTime: '10 minutes',
   *   prerequisites: [],
   *   helpUrl: '/help/add-admin'
   * }
   */
  const setupSteps = [
    {
      title: 'Add School Admin',
      description: 'Create administrator accounts for your school',
      icon: <UserAddOutlined />,
      link: '/add-school-admin',
      color: '#1890ff'
    },
    {
      title: 'Add Academic Year',
      description: 'Set up academic years for your school',
      icon: <CalendarOutlined />,
      link: '/add-academic-year',
      color: '#52c41a'
    },
    {
      title: 'Add Classes',
      description: 'Create class structures and sections',
      icon: <BookOutlined />,
      link: '/add-classes',
      color: '#722ed1'
    },
    {
      title: 'Add Class Instance',
      description: 'Connect classes with academic years and teachers',
      icon: <UnorderedListOutlined />,
      link: '/add-class-instance',
      color: '#fa8c16'
    },
    {
      title: 'Add Students',
      description: 'Enroll students into your classes',
      icon: <TeamOutlined />,
      link: '/add-student',
      color: '#13c2c2'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card style={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          background: '#ffffff',
          marginBottom: '24px'
        }}>
          {/* 
            SCHOOL HEADER SECTION:
            - Professional welcome message with school context
            - Dynamic school name display from user metadata
            - Clean typography and visual hierarchy
            
            BACKEND INTEGRATION NEEDED:
            - Add school logo display
            - Include school statistics (admin count, class count, etc.)
            - Add setup progress indicator
            - Show last login and activity information
          */}
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <BankOutlined style={{ fontSize: '48px', color: '#6366f1', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
              School Setup Dashboard
            </Title>
            <Text style={{ fontSize: '16px', color: '#64748b' }}>
              Configure your school system step by step
            </Text>
            {user?.user_metadata?.school_name && (
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ fontSize: '18px', color: '#6366f1' }}>
                  {user.user_metadata.school_name.toUpperCase()}
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Setup Steps */}
        <Row gutter={[24, 24]}>
          {/* 
            SETUP STEPS GRID:
            - Responsive card layout with consistent styling
            - Color-coded steps for visual organization
            - Professional hover effects and interactions
            - Clear call-to-action buttons
            
            BACKEND INTEGRATION NEEDED:
            - Add completion status indicators
            - Show progress percentage for each step
            - Add estimated time and difficulty indicators
            - Include prerequisite checking and validation
            - Add help tooltips and documentation links
          */}
          {setupSteps.map((step, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{ 
                  borderTop: `4px solid ${step.color}`,
                  height: '100%',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  background: '#ffffff',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    color: step.color, 
                    marginBottom: '16px' 
                  }}>
                    {step.icon}
                  </div>
                  <Title level={4} style={{ margin: '0 0 12px 0', color: '#1e293b', fontWeight: 600 }}>
                    {step.title}
                  </Title>
                  <Text style={{ 
                    display: 'block', 
                    marginBottom: '24px',
                    minHeight: '40px',
                    color: '#64748b'
                  }}>
                    {step.description}
                  </Text>
                  {/* BACKEND INTEGRATION: Add completion status
                  {step.completed && (
                    <Tag color="green" style={{ marginBottom: '16px' }}>
                      <CheckCircleOutlined /> Completed
                    </Tag>
                  )}
                  */}
                  <Link to={step.link}>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{ 
                        backgroundColor: step.color,
                        borderColor: step.color,
                        width: '100%',
                        borderRadius: '8px',
                        fontWeight: 500
                      }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Card 
          title={
            <Space>
              <SettingOutlined />
              <span>Quick Actions</span>
            </Space>
          }
          style={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            background: '#ffffff',
            marginTop: '24px'
          }}
          headStyle={{ borderBottom: '1px solid #e2e8f0' }}
        >
          {/* 
            QUICK ACTIONS SECTION:
            - Common administrative tasks
            - Professional button layout
            - Consistent styling and spacing
            
            BACKEND INTEGRATION NEEDED:
            - Make actions dynamic based on user role and permissions
            - Add action counters (e.g., "View Dashboard (5 pending)")
            - Include recent activity indicators
            - Add contextual actions based on setup progress
            - Link to actual functional pages
          */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                block 
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}
              >
                View Dashboard
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                block 
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}
              >
                School Settings
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                block 
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}
              >
                User Management
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                type="default" 
                block 
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}
              >
                Reports
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default SetupSchool;