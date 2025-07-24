import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Select, 
  DatePicker, 
  Statistic, 
  Tabs, 
  Tag, 
  Space, 
  Typography, 
  Avatar, 
  Progress, 
  Alert,
  Empty,
  Badge,
  Tooltip
} from 'antd';
import {
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  BarChartOutlined,
  TrophyOutlined,
  UserOutlined,
  BookOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * ATTENDANCE MANAGEMENT COMPONENT
 * 
 * CHANGES MADE:
 * - Converted from basic HTML to professional Ant Design components
 * - Added role-based permissions and data filtering
 * - Implemented comprehensive attendance tracking system
 * - Added statistics, analytics, and reporting features
 * - Integrated responsive design with mobile support
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace all hardcoded sample data with Supabase queries
 * - Implement real-time attendance updates
 * - Add bulk attendance operations
 * - Integrate with notification system for absent students
 * - Add attendance analytics and reporting
 */

/**
 * SAMPLE DATA - Replace with Supabase queries
 * 
 * BACKEND INTEGRATION:
 * Classes Query: SELECT * FROM classes WHERE school_id = user.school_id
 * Students Query: SELECT * FROM students WHERE class_id = selected_class_id
 * Attendance Query: SELECT * FROM attendance WHERE date = selected_date AND class_id = selected_class_id
 */
const SAMPLE_CLASSES = [
  { 
    id: 1, 
    name: "Grade 10 - Section A", 
    grade: 10, 
    section: "A",
    totalStudents: 25,
    teacherId: 3
  },
  { 
    id: 2, 
    name: "Grade 10 - Section B", 
    grade: 10, 
    section: "B",
    totalStudents: 28,
    teacherId: 4
  },
  { 
    id: 3, 
    name: "Grade 9 - Section A", 
    grade: 9, 
    section: "A",
    totalStudents: 22,
    teacherId: 3
  },
  { 
    id: 4, 
    name: "Grade 11 - Section A", 
    grade: 11, 
    section: "A",
    totalStudents: 20,
    teacherId: 5
  }
];

const SAMPLE_STUDENTS = [
  // Grade 10 - Section A (Class ID: 1)
  { id: 1, name: "Amit Sharma", rollNumber: "10A001", classId: 1, parentId: 6 },
  { id: 2, name: "Priya Singh", rollNumber: "10A002", classId: 1, parentId: 7 },
  { id: 3, name: "Rahul Verma", rollNumber: "10A003", classId: 1, parentId: 8 },
  { id: 4, name: "Sneha Patel", rollNumber: "10A004", classId: 1, parentId: 9 },
  { id: 5, name: "Arjun Kumar", rollNumber: "10A005", classId: 1, parentId: 10 },
  
  // Grade 10 - Section B (Class ID: 2)
  { id: 6, name: "Kavya Reddy", rollNumber: "10B001", classId: 2, parentId: 11 },
  { id: 7, name: "Vikram Joshi", rollNumber: "10B002", classId: 2, parentId: 12 },
  { id: 8, name: "Ananya Gupta", rollNumber: "10B003", classId: 2, parentId: 13 },
  
  // Grade 9 - Section A (Class ID: 3)
  { id: 9, name: "Rohan Mehta", rollNumber: "9A001", classId: 3, parentId: 14 },
  { id: 10, name: "Ishita Agarwal", rollNumber: "9A002", classId: 3, parentId: 15 },
  
  // Grade 11 - Section A (Class ID: 4)
  { id: 11, name: "Karan Malhotra", rollNumber: "11A001", classId: 4, parentId: 16 },
  { id: 12, name: "Riya Sharma", rollNumber: "11A002", classId: 4, parentId: 17 }
];

/**
 * USER ROLES SAMPLE DATA
 * 
 * BACKEND INTEGRATION:
 * Replace with actual user data from Supabase auth and user_roles table
 * Query: SELECT role, assigned_classes, permissions FROM user_roles WHERE user_id = user.id
 */
const SAMPLE_USERS = {
  superadmin: {
    id: 1,
    name: "Dr. Rajesh Kumar",
    role: "superadmin",
    assignedClassIds: [1, 2, 3, 4], // All classes
    schoolName: "Delhi Public School"
  },
  admin: {
    id: 2,
    name: "Mrs. Sunita Sharma",
    role: "admin", 
    assignedClassIds: [1, 3], // Only assigned classes
    schoolName: "Delhi Public School"
  },
  teacher: {
    id: 3,
    name: "Mr. Anil Gupta",
    role: "teacher",
    assignedClassIds: [1], // Only their class
    schoolName: "Delhi Public School"
  },
  student: {
    id: 1, // Same as student ID in SAMPLE_STUDENTS
    name: "Amit Sharma",
    role: "student",
    classId: 1,
    rollNumber: "10A001",
    schoolName: "Delhi Public School"
  },
  parent: {
    id: 6,
    name: "Mr. Sharma",
    role: "parent",
    childrenIds: [1, 2], // Children's student IDs
    schoolName: "Delhi Public School"
  }
};

/**
 * ATTENDANCE HISTORY SAMPLE DATA
 * 
 * BACKEND INTEGRATION:
 * Query: SELECT * FROM attendance_records WHERE date BETWEEN start_date AND end_date
 * AND (class_id IN user_assigned_classes OR student_id IN user_children)
 */
const SAMPLE_ATTENDANCE_HISTORY = [
  { id: 1, studentId: 1, studentName: "Amit Sharma", classId: 1, date: "2025-01-20", status: "present" },
  { id: 2, studentId: 1, studentName: "Amit Sharma", classId: 1, date: "2025-01-21", status: "absent" },
  { id: 3, studentId: 1, studentName: "Amit Sharma", classId: 1, date: "2025-01-22", status: "present" },
  { id: 4, studentId: 2, studentName: "Priya Singh", classId: 1, date: "2025-01-20", status: "present" },
  { id: 5, studentId: 2, studentName: "Priya Singh", classId: 1, date: "2025-01-21", status: "present" },
  { id: 6, studentId: 2, studentName: "Priya Singh", classId: 1, date: "2025-01-22", status: "absent" },
  { id: 7, studentId: 3, studentName: "Rahul Verma", classId: 1, date: "2025-01-20", status: "present" },
  { id: 8, studentId: 3, studentName: "Rahul Verma", classId: 1, date: "2025-01-21", status: "present" },
  { id: 9, studentId: 3, studentName: "Rahul Verma", classId: 1, date: "2025-01-22", status: "present" },
];

const Attendance = () => {
  const { user } = useAuth();
  
  /**
   * ROLE SIMULATION FOR TESTING
   * 
   * BACKEND INTEGRATION:
   * Replace with: const currentUser = user; (from Supabase auth)
   * Add role-based data fetching based on user.role
   */
  const CURRENT_ROLE = 'admin';
  const currentUser = SAMPLE_USERS[CURRENT_ROLE];
  
  // COMPONENT STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Filter states for viewing history
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs()
  });
  const [selectedStudentId, setSelectedStudentId] = useState('');

  /**
   * ROLE-BASED DATA FILTERING FUNCTIONS
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Replace with dynamic Supabase queries based on user role and permissions
   * - Add caching for frequently accessed data
   * - Implement real-time updates for class and student data
   */
  const getAvailableClasses = () => {
    switch (currentUser.role) {
      case 'superadmin':
        // BACKEND: SELECT * FROM classes WHERE school_id = user.school_id
        return SAMPLE_CLASSES;
      case 'admin':
      case 'teacher':
        // BACKEND: SELECT * FROM classes WHERE id IN (SELECT class_id FROM user_class_assignments WHERE user_id = user.id)
        return SAMPLE_CLASSES.filter(cls => currentUser.assignedClassIds.includes(cls.id));
      case 'student':
        // BACKEND: SELECT * FROM classes WHERE id = (SELECT class_id FROM students WHERE user_id = user.id)
        return SAMPLE_CLASSES.filter(cls => cls.id === currentUser.classId);
      case 'parent':
        // BACKEND: Complex query to get classes of user's children
        const childrenClasses = SAMPLE_STUDENTS
          .filter(student => currentUser.childrenIds.includes(student.id))
          .map(student => student.classId);
        return SAMPLE_CLASSES.filter(cls => childrenClasses.includes(cls.id));
      default:
        return [];
    }
  };

  /**
   * GET STUDENTS FOR CLASS - Role-based filtering
   * 
   * BACKEND INTEGRATION:
   * Query: SELECT * FROM students WHERE class_id = classId AND status = 'active'
   * Add role-based filtering for parents and students
   */
  const getStudentsForClass = (classId) => {
    if (!classId) return [];
    
    let studentsInClass = SAMPLE_STUDENTS.filter(student => student.classId === parseInt(classId));
    
    switch (currentUser.role) {
      case 'student':
        return studentsInClass.filter(student => student.id === currentUser.id);
      case 'parent':
        return studentsInClass.filter(student => currentUser.childrenIds.includes(student.id));
      default:
        return studentsInClass;
    }
  };

  /**
   * ROLE-BASED PERMISSIONS SYSTEM
   * 
   * BACKEND INTEGRATION:
   * Replace with dynamic permissions from database
   * Query: SELECT permissions FROM user_roles WHERE user_id = user.id
   */
  const permissions = {
    canMarkAttendance: ['superadmin', 'admin', 'teacher'].includes(currentUser.role),
    canViewAllClasses: currentUser.role === 'superadmin',
    canViewReports: ['superadmin', 'admin', 'teacher', 'parent'].includes(currentUser.role),
    canViewAnalytics: ['superadmin', 'admin'].includes(currentUser.role),
    canExportData: ['superadmin', 'admin'].includes(currentUser.role),
    availableTabs: currentUser.role === 'student' ? ['view'] : 
                  currentUser.role === 'parent' ? ['view', 'reports'] :
                  currentUser.role === 'teacher' ? ['mark', 'view', 'reports'] :
                  ['mark', 'view', 'reports', 'analytics']
  };

  // Auto-select class for single-class users
  useEffect(() => {
    const availableClasses = getAvailableClasses();
    
    if (availableClasses.length === 1) {
      setSelectedClassId(availableClasses[0].id.toString());
    } else if (availableClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(availableClasses[0].id.toString());
    }
  }, [currentUser.role]);

  // Initialize attendance state when class is selected
  useEffect(() => {
    if (selectedClassId && permissions.canMarkAttendance) {
      const students = getStudentsForClass(selectedClassId);
      const initialAttendance = {};
      
      students.forEach(student => {
        // BACKEND INTEGRATION: Check existing attendance
        // Query: SELECT status FROM attendance WHERE student_id = student.id AND date = selectedDate AND class_id = selectedClassId
        initialAttendance[student.id] = 'present';
      });
      
      setAttendance(initialAttendance);
    }
  }, [selectedClassId, currentUser.role]);

  /**
   * EVENT HANDLERS - User interactions
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Real-time attendance updates
   * - Bulk operations for marking all present/absent
   * - Validation and conflict resolution
   */
  const handleAttendanceChange = (studentId, status) => {
    if (!permissions.canMarkAttendance) return;
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  /**
   * SAVE ATTENDANCE - Main attendance submission
   * 
   * BACKEND INTEGRATION:
   * - Upsert attendance records in Supabase
   * - Send notifications for absent students
   * - Update attendance statistics
   * - Log attendance marking activity
   */
  const handleSaveAttendance = async () => {
    if (!permissions.canMarkAttendance) return;
    
    setLoading(true);
    setMessage('');

    try {
      // BACKEND INTEGRATION: Supabase upsert operation
      // const { error } = await supabase
      //   .from('attendance')
      //   .upsert(
      //     Object.entries(attendance).map(([studentId, status]) => ({
      //       student_id: studentId,
      //       class_id: selectedClassId,
      //       date: selectedDate.format('YYYY-MM-DD'),
      //       status: status,
      //       marked_by: user.id
      //     }))
      //   );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const students = getStudentsForClass(selectedClassId);
      const presentCount = Object.values(attendance).filter(status => status === 'present').length;
      const totalCount = students.length;
      
      setMessage(`Attendance saved successfully! ${presentCount}/${totalCount} students present.`);
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      setMessage('Error saving attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // BULK OPERATIONS - Mark all students present/absent
  const markAllPresent = () => {
    if (!permissions.canMarkAttendance) return;
    
    const students = getStudentsForClass(selectedClassId);
    const allPresent = {};
    students.forEach(student => {
      allPresent[student.id] = 'present';
    });
    setAttendance(allPresent);
  };

  const markAllAbsent = () => {
    if (!permissions.canMarkAttendance) return;
    
    const students = getStudentsForClass(selectedClassId);
    const allAbsent = {};
    students.forEach(student => {
      allAbsent[student.id] = 'absent';
    });
    setAttendance(allAbsent);
  };

  // COMPUTED VALUES - Real-time statistics
  const availableClasses = getAvailableClasses();
  const studentsInSelectedClass = getStudentsForClass(selectedClassId);
  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

  /**
   * TABLE COLUMN DEFINITIONS
   * 
   * Professional Ant Design table configurations with:
   * - Avatar display for students
   * - Interactive attendance buttons
   * - Role-based action visibility
   */
  const attendanceColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {record.rollNumber.slice(-2)}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Roll: {record.rollNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => (
        <Space>
          <Button
            type={attendance[record.id] === 'present' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            onClick={() => handleAttendanceChange(record.id, 'present')}
            disabled={!permissions.canMarkAttendance}
          >
            Present
          </Button>
          <Button
            type={attendance[record.id] === 'absent' ? 'primary' : 'default'}
            danger={attendance[record.id] === 'absent'}
            icon={<CloseCircleOutlined />}
            onClick={() => handleAttendanceChange(record.id, 'absent')}
            disabled={!permissions.canMarkAttendance}
          >
            Absent
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    ...((['superadmin', 'admin'].includes(currentUser.role)) ? [{
      title: 'Class',
      key: 'class',
      render: (_, record) => {
        const className = SAMPLE_CLASSES.find(c => c.id === record.classId)?.name || 'Unknown';
        return <Tag color="blue">{className}</Tag>;
      },
    }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'present' ? 'green' : 'red'}>
          {status === 'present' ? 'Present' : 'Absent'}
        </Tag>
      ),
    },
  ];

  /**
   * RENDER FUNCTIONS - Component UI sections
   * 
   * Each render function handles a specific tab/section of the attendance system
   * All use professional Ant Design components with proper styling
   */
  const renderMarkAttendanceTab = () => {
    if (!permissions.canMarkAttendance) {
      return (
        <Alert
          message="Access Restricted"
          description="You don't have permission to mark attendance."
          type="warning"
          showIcon
          style={{ margin: '24px 0' }}
        />
      );
    }

    return (
      <div>
        {/* Controls Section */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div>
                <Text strong>Date</Text>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </Col>
            
            <Col xs={24} sm={8} md={6}>
              <div>
                <Text strong>Class</Text>
                {availableClasses.length === 1 && currentUser.role === 'teacher' ? (
                  <div style={{ 
                    padding: '4px 11px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '6px',
                    marginTop: '4px',
                    backgroundColor: '#f5f5f5'
                  }}>
                    {availableClasses[0].name}
                  </div>
                ) : (
                  <Select
                    value={selectedClassId}
                    onChange={setSelectedClassId}
                    placeholder="Select a class"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {availableClasses.map(cls => (
                      <Option key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </div>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <div>
                <Text strong>Quick Actions</Text>
                <div style={{ marginTop: '4px' }}>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={markAllPresent}
                      disabled={!selectedClassId || studentsInSelectedClass.length === 0}
                    >
                      All Present
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={markAllAbsent}
                      disabled={!selectedClassId || studentsInSelectedClass.length === 0}
                    >
                      All Absent
                    </Button>
                  </Space>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <div>
                <Text strong>Role Information</Text>
                <div style={{ marginTop: '4px' }}>
                  <Badge color="#1890ff" text={`${currentUser.role.toUpperCase()} - ${currentUser.name}`} />
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        {selectedClassId && studentsInSelectedClass.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Students"
                  value={studentsInSelectedClass.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Present"
                  value={presentCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Absent"
                  value={absentCount}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Students Table */}
        {selectedClassId && studentsInSelectedClass.length > 0 ? (
          <Card
            title={
              <Space>
                <BookOutlined />
                <span>
                  {availableClasses.find(c => c.id === parseInt(selectedClassId))?.name} - 
                  {selectedDate.format('DD MMM YYYY')}
                </span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSaveAttendance}
                disabled={!selectedClassId || studentsInSelectedClass.length === 0}
              >
                Save Attendance
              </Button>
            }
          >
            <Table
              columns={attendanceColumns}
              dataSource={studentsInSelectedClass}
              rowKey="id"
              pagination={false}
              size="middle"
            />
            
            {message && (
              <Alert
                message={message}
                type={message.includes('Error') ? 'error' : 'success'}
                style={{ marginTop: '16px' }}
                closable
              />
            )}
          </Card>
        ) : (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                availableClasses.length === 0 
                  ? "No classes available for your account"
                  : "Select a class and date to start marking attendance"
              }
            />
          </Card>
        )}
      </div>
    );
  };

  /**
   * VIEW HISTORY TAB - Attendance history with filtering
   * 
   * BACKEND INTEGRATION:
   * - Real-time attendance history queries
   * - Advanced filtering and search
   * - Export functionality
   */
  const renderViewHistoryTab = () => {
    // BACKEND INTEGRATION: Replace with Supabase query
    // SELECT * FROM attendance_history WHERE date BETWEEN start_date AND end_date
    const attendanceHistory = SAMPLE_ATTENDANCE_HISTORY.filter(record => {
      let filtered = true;
      
      // Filter by date range
      const recordDate = dayjs(record.date);
      if (recordDate.isBefore(dateRange.startDate) || recordDate.isAfter(dateRange.endDate)) {
        filtered = false;
      }
      
      // Filter by selected class
      if (selectedClassId && record.classId !== parseInt(selectedClassId)) {
        filtered = false;
      }
      
      // Filter by selected student
      if (selectedStudentId && record.studentId !== parseInt(selectedStudentId)) {
        filtered = false;
      }
      
      // Apply role-based filtering
      switch (currentUser.role) {
        case 'student':
          filtered = filtered && record.studentId === currentUser.id;
          break;
        case 'parent':
          filtered = filtered && currentUser.childrenIds.includes(record.studentId);
          break;
        case 'teacher':
          const teacherClassIds = currentUser.assignedClassIds;
          filtered = filtered && teacherClassIds.includes(record.classId);
          break;
        case 'admin':
          const adminClassIds = currentUser.assignedClassIds;
          filtered = filtered && adminClassIds.includes(record.classId);
          break;
      }
      
      return filtered;
    });

    return (
      <div>
        {/* Filters */}
        <Card title="Filter Attendance History" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Start Date</Text>
                <DatePicker
                  value={dateRange.startDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>End Date</Text>
                <DatePicker
                  value={dateRange.endDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </Col>
            
            {availableClasses.length > 1 && (
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text strong>Class</Text>
                  <Select
                    value={selectedClassId}
                    onChange={setSelectedClassId}
                    placeholder="All Classes"
                    style={{ width: '100%', marginTop: '4px' }}
                    allowClear
                  >
                    {availableClasses.map(cls => (
                      <Option key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            )}

            {currentUser.role !== 'student' && (
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text strong>Student</Text>
                  <Select
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    placeholder="All Students"
                    style={{ width: '100%', marginTop: '4px' }}
                    allowClear
                  >
                    {studentsInSelectedClass.map(student => (
                      <Option key={student.id} value={student.id.toString()}>
                        {student.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Attendance History Table */}
        <Card 
          title={
            <Space>
              <EyeOutlined />
              <span>Attendance History</span>
            </Space>
          }
          extra={
            permissions.canExportData && (
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
            )
          }
        >
          <Table
            columns={historyColumns}
            dataSource={attendanceHistory}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} records`
            }}
          />
        </Card>
      </div>
    );
  };

  /**
   * REPORTS TAB - Attendance analytics and statistics
   * 
   * BACKEND INTEGRATION:
   * - Real-time attendance rate calculations
   * - Performance metrics and trends
   * - Export functionality for reports
   */
  const renderReportsTab = () => {
    if (!permissions.canViewReports) {
      return (
        <Alert
          message="Access Restricted"
          description="You don't have permission to view reports."
          type="warning"
          showIcon
          style={{ margin: '24px 0' }}
        />
      );
    }

    // Calculate some basic statistics from sample data
    const totalRecords = SAMPLE_ATTENDANCE_HISTORY.length;
    const presentRecords = SAMPLE_ATTENDANCE_HISTORY.filter(r => r.status === 'present').length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Overall Rate"
                value={attendanceRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress percent={attendanceRate} showInfo={false} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Present Days"
                value={presentRecords}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Absent Days"
                value={totalRecords - presentRecords}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Classes"
                value={availableClasses.length}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {permissions.canExportData && (
          <Card title="Export Reports" style={{ marginTop: '16px' }}>
            <Space>
              <Button type="primary" icon={<DownloadOutlined />}>
                Export CSV
              </Button>
              <Button icon={<DownloadOutlined />}>
                Export PDF
              </Button>
            </Space>
          </Card>
        )}
      </div>
    );
  };

  /**
   * ANALYTICS TAB - Advanced attendance analytics
   * 
   * BACKEND INTEGRATION:
   * - Complex analytics queries
   * - Trend analysis and predictions
   * - Interactive charts and graphs
   */
  const renderAnalyticsTab = () => {
    if (!permissions.canViewAnalytics) {
      return (
        <Alert
          message="Access Restricted"
          description="You don't have permission to view analytics."
          type="warning"
          showIcon
          style={{ margin: '24px 0' }}
        />
      );
    }

    return (
      <Card title="Attendance Analytics">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Advanced analytics and insights coming soon..."
        />
      </Card>
    );
  };

  /**
   * MAIN COMPONENT RENDER
   * 
   * Professional layout with:
   * - Role-based tab visibility
   * - Responsive design
   * - Consistent styling
   * - User context display
   */
  return (
    <Content className="page-container">
      {/* Header */}
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Attendance Management
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {currentUser.role === 'student' && 'View your attendance record and track your progress'}
              {currentUser.role === 'parent' && 'Monitor your children\'s attendance and performance'}
              {currentUser.role === 'teacher' && 'Mark and manage attendance for your classes'}
              {currentUser.role === 'admin' && 'Oversee attendance for your assigned classes'}
              {currentUser.role === 'superadmin' && 'Complete attendance management for the entire school'}
            </Text>
          </Col>
          <Col>
            <Space>
              <Badge color="#1890ff" text={`${currentUser.role.toUpperCase()} - ${currentUser.name}`} />
              <Badge color="#52c41a" text={currentUser.schoolName} />
            </Space>
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
        {permissions.availableTabs.includes('mark') && (
          <TabPane
            tab={
              <Space>
                <EditOutlined />
                Mark Attendance
              </Space>
            }
            key="mark"
          >
            {renderMarkAttendanceTab()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('view') && (
          <TabPane
            tab={
              <Space>
                <EyeOutlined />
                View History
              </Space>
            }
            key="view"
          >
            {renderViewHistoryTab()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('reports') && (
          <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                Reports
              </Space>
            }
            key="reports"
          >
            {renderReportsTab()}
          </TabPane>
        )}
        
        {permissions.availableTabs.includes('analytics') && (
          <TabPane
            tab={
              <Space>
                <TrophyOutlined />
                Analytics
              </Space>
            }
            key="analytics"
          >
            {renderAnalyticsTab()}
          </TabPane>
        )}
      </Tabs>
    </Content>
  );
};

export default Attendance;