import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Select, 
  DatePicker, 
  Form, 
  Input, 
  Modal, 
  Tabs, 
  Tag, 
  Space, 
  Typography, 
  Statistic,
  Progress,
  Empty,
  Badge
} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// ==========================================
// HARDCODED SAMPLE DATA
// ==========================================
// TODO: Replace with Supabase queries when integrating backend

const SAMPLE_ASSESSMENTS = [
  {
    id: 1,
    title: "Mathematics Unit Test 1",
    subject: "Mathematics",
    classId: 1,
    className: "Grade 10 - Section A",
    type: "Unit Test",
    totalMarks: 100,
    duration: 90,
    date: "2025-01-25",
    status: "scheduled",
    createdBy: "Mr. Anil Gupta",
    description: "Covers chapters 1-3: Real Numbers, Polynomials, and Linear Equations"
  },
  {
    id: 2,
    title: "Science Practical Exam",
    subject: "Science",
    classId: 1,
    className: "Grade 10 - Section A",
    type: "Practical",
    totalMarks: 50,
    duration: 120,
    date: "2025-01-22",
    status: "completed",
    createdBy: "Mrs. Priya Sharma",
    description: "Laboratory experiments on acids, bases, and salts"
  },
  {
    id: 3,
    title: "English Essay Writing",
    subject: "English",
    classId: 2,
    className: "Grade 10 - Section B",
    type: "Assignment",
    totalMarks: 25,
    duration: 60,
    date: "2025-01-20",
    status: "graded",
    createdBy: "Ms. Kavya Reddy",
    description: "Creative writing on environmental conservation"
  },
  {
    id: 4,
    title: "History Chapter Test",
    subject: "History",
    classId: 3,
    className: "Grade 9 - Section A",
    type: "Chapter Test",
    totalMarks: 75,
    duration: 75,
    date: "2025-01-28",
    status: "draft",
    createdBy: "Dr. Rajesh Kumar",
    description: "The French Revolution and its impact"
  }
];

const SAMPLE_RESULTS = [
  { id: 1, assessmentId: 2, studentId: 1, studentName: "Amit Sharma", marksObtained: 42, grade: "A", remarks: "Excellent practical skills" },
  { id: 2, assessmentId: 2, studentId: 2, studentName: "Priya Singh", marksObtained: 38, grade: "B+", remarks: "Good understanding" },
  { id: 3, assessmentId: 2, studentId: 3, studentName: "Rahul Verma", marksObtained: 45, grade: "A+", remarks: "Outstanding performance" },
  { id: 4, assessmentId: 3, studentId: 6, studentName: "Kavya Reddy", marksObtained: 22, grade: "A", remarks: "Creative and well-structured" },
  { id: 5, assessmentId: 3, studentId: 7, studentName: "Vikram Joshi", marksObtained: 20, grade: "B+", remarks: "Good content, needs improvement in grammar" }
];

const SAMPLE_CLASSES = [
  { id: 1, name: "Grade 10 - Section A" },
  { id: 2, name: "Grade 10 - Section B" },
  { id: 3, name: "Grade 9 - Section A" },
  { id: 4, name: "Grade 11 - Section A" }
];

const SAMPLE_SUBJECTS = [
  "Mathematics", "Science", "English", "History", "Geography", "Computer Science"
];

const Assessments = () => {
  // ==========================================
  // COMPONENT STATE
  // ==========================================
  
  const [activeTab, setActiveTab] = useState('list');
  const [assessments, setAssessments] = useState(SAMPLE_ASSESSMENTS);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual user data from Supabase auth
  const currentUser = {
    role: 'admin', // Change to test different roles: 'superadmin', 'admin', 'teacher', 'student'
    name: 'Mrs. Sunita Sharma',
    assignedClassIds: [1, 3]
  };

  // ==========================================
  // ROLE-BASED PERMISSIONS
  // ==========================================
  
  const permissions = {
    canCreateAssessment: ['superadmin', 'admin', 'teacher'].includes(currentUser.role),
    canEditAssessment: ['superadmin', 'admin', 'teacher'].includes(currentUser.role),
    canDeleteAssessment: ['superadmin', 'admin'].includes(currentUser.role),
    canViewAllClasses: currentUser.role === 'superadmin',
    canGradeAssessment: ['superadmin', 'admin', 'teacher'].includes(currentUser.role),
    availableTabs: currentUser.role === 'student' ? ['list', 'results'] : 
                  ['list', 'create', 'results', 'analytics']
  };

  // ==========================================
  // DATA FILTERING FUNCTIONS
  // ==========================================
  
  // Get assessments based on user role
  // TODO: Replace with Supabase query based on user permissions
  const getFilteredAssessments = () => {
    switch (currentUser.role) {
      case 'superadmin':
        return assessments;
      case 'admin':
      case 'teacher':
        return assessments.filter(assessment => 
          currentUser.assignedClassIds.includes(assessment.classId)
        );
      case 'student':
        // TODO: Filter by student's class
        return assessments.filter(assessment => assessment.classId === 1); // Assuming student is in class 1
      default:
        return [];
    }
  };

  // Get available classes based on user role
  // TODO: Replace with Supabase query
  const getAvailableClasses = () => {
    switch (currentUser.role) {
      case 'superadmin':
        return SAMPLE_CLASSES;
      case 'admin':
      case 'teacher':
        return SAMPLE_CLASSES.filter(cls => currentUser.assignedClassIds.includes(cls.id));
      default:
        return [];
    }
  };

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  const handleCreateAssessment = () => {
    setModalType('create');
    setSelectedAssessment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditAssessment = (assessment) => {
    setModalType('edit');
    setSelectedAssessment(assessment);
    form.setFieldsValue({
      ...assessment,
      date: assessment.date
    });
    setIsModalVisible(true);
  };

  const handleViewAssessment = (assessment) => {
    setModalType('view');
    setSelectedAssessment(assessment);
    setIsModalVisible(true);
  };

  const handleDeleteAssessment = (assessmentId) => {
    Modal.confirm({
      title: 'Delete Assessment',
      content: 'Are you sure you want to delete this assessment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // TODO: Replace with Supabase delete operation
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      }
    });
  };

  const handleModalSubmit = async (values) => {
    setLoading(true);
    
    try {
      // TODO: Replace with Supabase insert/update operations
      if (modalType === 'create') {
        const newAssessment = {
          id: Date.now(),
          ...values,
          status: 'draft',
          createdBy: currentUser.name,
          className: SAMPLE_CLASSES.find(c => c.id === values.classId)?.name
        };
        setAssessments(prev => [...prev, newAssessment]);
      } else if (modalType === 'edit') {
        setAssessments(prev => prev.map(a => 
          a.id === selectedAssessment.id 
            ? { ...a, ...values, className: SAMPLE_CLASSES.find(c => c.id === values.classId)?.name }
            : a
        ));
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  
  const assessmentColumns = [
    {
      title: 'Assessment',
      key: 'assessment',
      render: (_, record) => (
        <div>
          <Text strong>{record.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.subject} • {record.type}
          </Text>
        </div>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'className',
      key: 'className',
      render: (className) => <Tag color="blue">{className}</Tag>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('en-IN')
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => (
        <div>
          <Text strong>{record.totalMarks}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.duration} min
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          draft: 'default',
          scheduled: 'blue',
          ongoing: 'orange',
          completed: 'green',
          graded: 'purple'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewAssessment(record)}
          />
          {permissions.canEditAssessment && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAssessment(record)}
            />
          )}
          {permissions.canDeleteAssessment && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAssessment(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const resultColumns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Assessment',
      key: 'assessment',
      render: (_, record) => {
        const assessment = assessments.find(a => a.id === record.assessmentId);
        return assessment ? assessment.title : 'Unknown';
      }
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => {
        const assessment = assessments.find(a => a.id === record.assessmentId);
        const percentage = assessment ? Math.round((record.marksObtained / assessment.totalMarks) * 100) : 0;
        return (
          <div>
            <Text strong>{record.marksObtained}</Text>
            <Text type="secondary">/{assessment?.totalMarks || 0}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {percentage}%
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => {
        const colors = {
          'A+': 'green',
          'A': 'green',
          'B+': 'blue',
          'B': 'blue',
          'C+': 'orange',
          'C': 'orange',
          'D': 'red',
          'F': 'red'
        };
        return <Tag color={colors[grade]}>{grade}</Tag>;
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true
    }
  ];

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================
  
  const renderAssessmentsList = () => {
    const filteredAssessments = getFilteredAssessments();
    
    return (
      <div>
        {/* Header with Create Button */}
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Assessments
            </Title>
          </Col>
          <Col>
            {permissions.canCreateAssessment && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateAssessment}
              >
                Create Assessment
              </Button>
            )}
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Assessments"
                value={filteredAssessments.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Scheduled"
                value={filteredAssessments.filter(a => a.status === 'scheduled').length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Completed"
                value={filteredAssessments.filter(a => a.status === 'completed').length}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Graded"
                value={filteredAssessments.filter(a => a.status === 'graded').length}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Assessments Table */}
        <Card>
          <Table
            columns={assessmentColumns}
            dataSource={filteredAssessments}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} assessments`
            }}
          />
        </Card>
      </div>
    );
  };

  const renderCreateAssessment = () => {
    if (!permissions.canCreateAssessment) {
      return (
        <Card>
          <Empty
            description="You don't have permission to create assessments"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <Card title="Create New Assessment">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="Assessment Title"
                rules={[{ required: true, message: 'Please enter assessment title' }]}
              >
                <Input placeholder="e.g., Mathematics Unit Test 1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please select subject' }]}
              >
                <Select placeholder="Select subject">
                  {SAMPLE_SUBJECTS.map(subject => (
                    <Option key={subject} value={subject}>{subject}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="classId"
                label="Class"
                rules={[{ required: true, message: 'Please select class' }]}
              >
                <Select placeholder="Select class">
                  {getAvailableClasses().map(cls => (
                    <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Assessment Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="Unit Test">Unit Test</Option>
                  <Option value="Chapter Test">Chapter Test</Option>
                  <Option value="Assignment">Assignment</Option>
                  <Option value="Practical">Practical</Option>
                  <Option value="Project">Project</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="totalMarks"
                label="Total Marks"
                rules={[{ required: true, message: 'Please enter total marks' }]}
              >
                <Input type="number" placeholder="100" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <Input type="number" placeholder="90" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="date"
                label="Assessment Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter assessment description, topics covered, instructions, etc."
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Assessment
              </Button>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const renderResults = () => {
    // TODO: Filter results based on user role and permissions
    const filteredResults = SAMPLE_RESULTS;
    
    return (
      <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Assessment Results
            </Title>
          </Col>
        </Row>

        <Card>
          <Table
            columns={resultColumns}
            dataSource={filteredResults}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} results`
            }}
          />
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!permissions.canViewAllClasses && currentUser.role !== 'admin') {
      return (
        <Card>
          <Empty
            description="Analytics not available for your role"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <div>
        <Title level={4} style={{ marginBottom: '16px' }}>
          Assessment Analytics
        </Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Performance Overview">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={78}
                  format={percent => `${percent}%`}
                  strokeColor="#52c41a"
                />
                <div style={{ marginTop: '16px' }}>
                  <Text>Average Performance</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Subject-wise Performance">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Mathematics</Text>
                  <Progress percent={85} strokeColor="#1890ff" />
                </div>
                <div>
                  <Text>Science</Text>
                  <Progress percent={78} strokeColor="#52c41a" />
                </div>
                <div>
                  <Text>English</Text>
                  <Progress percent={82} strokeColor="#722ed1" />
                </div>
                <div>
                  <Text>History</Text>
                  <Progress percent={75} strokeColor="#fa8c16" />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <Content className="page-container">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Assessment Management
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Create, manage, and track student assessments and results
            </Text>
          </Col>
          <Col>
            <Badge color="#1890ff" text={`${currentUser.role.toUpperCase()} - ${currentUser.name}`} />
          </Col>
        </Row>
      </div>

      {/* Tab Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
      >
        {permissions.availableTabs.includes('list') && (
          <TabPane
            tab={
              <Space>
                <BookOutlined />
                Assessments
              </Space>
            }
            key="list"
          >
            {renderAssessmentsList()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('create') && (
          <TabPane
            tab={
              <Space>
                <PlusOutlined />
                Create
              </Space>
            }
            key="create"
          >
            {renderCreateAssessment()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('results') && (
          <TabPane
            tab={
              <Space>
                <TrophyOutlined />
                Results
              </Space>
            }
            key="results"
          >
            {renderResults()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('analytics') && (
          <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                Analytics
              </Space>
            }
            key="analytics"
          >
            {renderAnalytics()}
          </TabPane>
        )}
      </Tabs>

      {/* Assessment Modal */}
      <Modal
        title={
          modalType === 'create' ? 'Create Assessment' :
          modalType === 'edit' ? 'Edit Assessment' : 'Assessment Details'
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={modalType === 'view' ? [
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ] : null}
        width={800}
      >
        {modalType === 'view' && selectedAssessment && (
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Title: </Text>
                <Text>{selectedAssessment.title}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Subject: </Text>
                <Text>{selectedAssessment.subject}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Class: </Text>
                <Text>{selectedAssessment.className}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Type: </Text>
                <Text>{selectedAssessment.type}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Total Marks: </Text>
                <Text>{selectedAssessment.totalMarks}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Duration: </Text>
                <Text>{selectedAssessment.duration} minutes</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Date: </Text>
                <Text>{new Date(selectedAssessment.date).toLocaleDateString('en-IN')}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Status: </Text>
                <Tag color="blue">{selectedAssessment.status.toUpperCase()}</Tag>
              </Col>
              <Col xs={24}>
                <Text strong>Description: </Text>
                <br />
                <Text>{selectedAssessment.description}</Text>
              </Col>
              <Col xs={24}>
                <Text strong>Created By: </Text>
                <Text>{selectedAssessment.createdBy}</Text>
              </Col>
            </Row>
          </div>
        )}
        
        {(modalType === 'create' || modalType === 'edit') && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleModalSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Assessment Title"
                  rules={[{ required: true, message: 'Please enter assessment title' }]}
                >
                  <Input placeholder="e.g., Mathematics Unit Test 1" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please select subject' }]}
                >
                  <Select placeholder="Select subject">
                    {SAMPLE_SUBJECTS.map(subject => (
                      <Option key={subject} value={subject}>{subject}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="classId"
                  label="Class"
                  rules={[{ required: true, message: 'Please select class' }]}
                >
                  <Select placeholder="Select class">
                    {getAvailableClasses().map(cls => (
                      <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="type"
                  label="Assessment Type"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="Unit Test">Unit Test</Option>
                    <Option value="Chapter Test">Chapter Test</Option>
                    <Option value="Assignment">Assignment</Option>
                    <Option value="Practical">Practical</Option>
                    <Option value="Project">Project</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="totalMarks"
                  label="Total Marks"
                  rules={[{ required: true, message: 'Please enter total marks' }]}
                >
                  <Input type="number" placeholder="100" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="duration"
                  label="Duration (minutes)"
                  rules={[{ required: true, message: 'Please enter duration' }]}
                >
                  <Input type="number" placeholder="90" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="date"
                  label="Assessment Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Enter assessment description, topics covered, instructions, etc."
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {modalType === 'create' ? 'Create' : 'Update'} Assessment
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Content>
  );
};

export default Assessments;