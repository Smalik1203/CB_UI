import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Typography, Space, Row, Col } from 'antd';
import { UserAddOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserOutlined, IdcardOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../AuthProvider';
import { supabase } from '../config/supabaseClient';

const { Title } = Typography;
const { Option } = Select;

/**
 * ADD STUDENT COMPONENT - Student Enrollment System
 * 
 * CHANGES MADE:
 * - Converted from basic HTML form to professional Ant Design components
 * - Added multi-column responsive layout for better UX
 * - Implemented comprehensive form validation with regex patterns
 * - Added dynamic class instance loading with academic year context
 * - Integrated with Supabase Edge Functions for secure student creation
 * - Added proper loading states and user feedback
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace class instances query with real-time Supabase data
 * - Implement student enrollment workflow with parent notifications
 * - Add student ID generation and roll number assignment
 * - Integrate with fee structure assignment
 * - Add bulk student import functionality
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Class Instances Query: SELECT ci.*, c.grade, c.section, ay.year_start, ay.year_end 
 *   FROM class_instances ci JOIN classes c ON ci.class_id = c.id 
 *   JOIN academic_years ay ON ci.academic_year_id = ay.id
 * - Edge Function: /functions/v1/create-student
 * - Student Table: INSERT INTO students (user_id, class_instance_id, roll_number, etc.)
 */
const AddStudent = () => {
  const { user } = useAuth();
  
  // BACKEND INTEGRATION: Get school context from authenticated user
  // This ensures students are enrolled in the correct school
  const { school_code, super_admin_code } = user.user_metadata || {};

  const [form] = Form.useForm();
  const [classInstances, setClassInstances] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * FETCH CLASS INSTANCES - Load available classes for enrollment
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Replace with real-time Supabase query with joins
   * - Add filtering for active academic years only
   * - Include student capacity and current enrollment count
   * - Add caching for frequently accessed data
   * 
   * ENHANCED QUERY EXAMPLE:
   * SELECT ci.id, c.grade, c.section, ay.year_start, ay.year_end,
   *        COUNT(s.id) as current_students, c.max_capacity
   * FROM class_instances ci
   * JOIN classes c ON ci.class_id = c.id
   * JOIN academic_years ay ON ci.academic_year_id = ay.id
   * LEFT JOIN students s ON s.class_instance_id = ci.id
   * WHERE ci.school_code = user.school_code AND ay.is_active = true
   * GROUP BY ci.id, c.grade, c.section, ay.year_start, ay.year_end, c.max_capacity
   */
  useEffect(() => {
    const fetchClassInstances = async () => {
      // BACKEND INTEGRATION: Replace with comprehensive query above
      const { data, error } = await supabase
        .from('class_instances')
        .select(`
          id,
          class:classes (grade, section),
          academic_years:academic_years (year_start, year_end)
        `)
        .eq('school_code', school_code)
        .eq('created_by', super_admin_code);

      if (error) {
        message.error('Failed to load class instances: ' + error.message);
      } else {
        setClassInstances(data || []);
      }
    };

    if (school_code && super_admin_code) fetchClassInstances();
  }, [school_code, super_admin_code]);

  /**
   * STUDENT CREATION HANDLER
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Implement comprehensive student enrollment workflow
   * - Generate unique student ID and roll number
   * - Create parent account if not exists
   * - Assign default fee structure for the class
   * - Send welcome email to student and parent
   * - Create initial attendance records
   * - Add to relevant WhatsApp/communication groups
   * 
   * SECURITY FEATURES:
   * - Validate school context and permissions
   * - Check class capacity before enrollment
   * - Prevent duplicate email addresses
   * - Validate parent contact information
   * 
   * WORKFLOW STEPS:
   * 1. Validate form data and school context
   * 2. Check class capacity and availability
   * 3. Create auth user with student role
   * 4. Insert student record with generated roll number
   * 5. Create/link parent account
   * 6. Assign fee structure and payment schedule
   * 7. Send notifications and welcome materials
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // AUTHENTICATION: Validate current user session
      const sessionResult = await supabase.auth.getSession();
      const token = sessionResult.data.session?.access_token;

      if (!token) {
        message.error('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      // EDGE FUNCTION CALL: Secure student creation with full workflow
      // BACKEND INTEGRATION: Enhance this endpoint to handle complete enrollment
      const response = await fetch('https://mvvzqouqxrtyzuzqbeud.supabase.co/functions/v1/create-student', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          student_code: values.student_code,
          class_instance_id: values.class_instance_id,
          // BACKEND INTEGRATION: Add additional fields
          // parent_name: values.parent_name,
          // parent_email: values.parent_email,
          // parent_phone: values.parent_phone,
          // emergency_contact: values.emergency_contact,
          // medical_info: values.medical_info,
          // transport_required: values.transport_required
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // ERROR HANDLING: Display specific error messages
        message.error(result.error || `Failed to create student. Status: ${response.status}`);
      } else {
        // SUCCESS HANDLING: User feedback and form reset
        message.success('Student created successfully!');
        form.resetFields();
        
        // BACKEND INTEGRATION: Additional success actions
        // - Refresh class instances to show updated enrollment count
        // - Navigate to student management page
        // - Show enrollment confirmation with student details
        // fetchClassInstances(); // Refresh data
      }
    } catch (err) {
      // GENERAL ERROR HANDLING: Network and unexpected errors
      message.error('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: '#f8fafc' }}>
      <div className="max-w-3xl mx-auto">
        <Card
          title={
            <Space>
              <UserAddOutlined />
              <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>Add New Student</Title>
            </Space>
          }
          style={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            background: '#ffffff'
          }}
          headStyle={{ borderBottom: '1px solid #e2e8f0' }}
        >
          {/* 
            PROFESSIONAL FORM DESIGN:
            - Multi-column responsive layout for better space utilization
            - Comprehensive validation rules with regex patterns
            - Icon prefixes for visual appeal and better UX
            - Proper input types and constraints
            - Dynamic class selection with academic year context
            
            BACKEND INTEGRATION NEEDED:
            - Add parent information fields
            - Include emergency contact details
            - Add medical information section
            - Include transport requirements
            - Add photo upload functionality
          */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            initialValues={{
              student_code: 'S'
            }}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="full_name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter full name' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter student's full name"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter email address"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter password"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="student_code"
                  label="Student Code"
                  rules={[{ required: true, message: 'Please enter student code' }]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Enter student code"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                {/* 
                  CLASS SELECTION:
                  BACKEND INTEGRATION NEEDED:
                  - Show current enrollment count vs capacity
                  - Disable full classes
                  - Add class teacher information
                  - Show fee structure for selected class
                */}
                <Form.Item
                  name="class_instance_id"
                  label="Class"
                  rules={[{ required: true, message: 'Please select a class' }]}
                >
                  <Select
                    placeholder="Select class"
                    showSearch
                    optionFilterProp="children"
                    suffixIcon={<BookOutlined />}
                  >
                    {classInstances.map((instance) => (
                      <Option key={instance.id} value={instance.id}>
                        Grade {instance.class.grade} - {instance.class.section} | 
                        AY {instance.academic_years.year_start} - {instance.academic_years.year_end}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    background: '#6366f1',
                    borderColor: '#6366f1',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  {loading ? 'Adding Student...' : 'Add Student'}
                </Button>
                <Button
                  size="large"
                  onClick={() => form.resetFields()}
                >
                  Reset Form
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddStudent;