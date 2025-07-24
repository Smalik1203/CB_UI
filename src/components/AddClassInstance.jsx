import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Button, message, Typography, Space, Row, Col, Alert } from 'antd';
import { BookOutlined, PlusOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

const { Title } = Typography;
const { Option } = Select;

/**
 * ADD CLASS INSTANCE COMPONENT - Class Instance Management System
 * 
 * CHANGES MADE:
 * - Converted from basic HTML form to professional Ant Design components
 * - Added informational alert explaining class instances concept
 * - Implemented multi-column responsive layout
 * - Added comprehensive form validation and error handling
 * - Integrated dynamic data loading for classes, academic years, and admins
 * - Added proper loading states and user feedback
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace hardcoded queries with optimized joins
 * - Add validation for duplicate class instances
 * - Implement capacity management and enrollment tracking
 * - Add class schedule and timetable integration
 * - Include fee structure assignment
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Classes Query: SELECT * FROM classes WHERE school_code = user.school_code
 * - Admins Query: SELECT * FROM admin WHERE school_code = user.school_code AND role IN ('admin', 'teacher')
 * - Academic Years Query: SELECT * FROM academic_years WHERE school_code = user.school_code AND is_active = true
 * - Insert Query: INSERT INTO class_instances (class_id, academic_year_id, class_teacher_id, school_code, created_by)
 */
const AddClassInstance = () => {
  const { user } = useAuth();
  
  // BACKEND INTEGRATION: Get school context from authenticated user
  // This ensures class instances are created within the correct school
  const { school_code, super_admin_code } = user.user_metadata || {};

  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * FETCH DATA - Load classes, admins, and academic years
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Optimize with single query using joins
   * - Add caching for frequently accessed data
   * - Include additional metadata (enrollment counts, capacity, etc.)
   * - Add real-time subscriptions for data updates
   * 
   * OPTIMIZED QUERY EXAMPLE:
   * WITH class_data AS (
   *   SELECT c.*, COUNT(ci.id) as instance_count
   *   FROM classes c
   *   LEFT JOIN class_instances ci ON c.id = ci.class_id
   *   WHERE c.school_code = user.school_code
   *   GROUP BY c.id
   * ),
   * admin_data AS (
   *   SELECT a.*, COUNT(ci.id) as assigned_classes
   *   FROM admin a
   *   LEFT JOIN class_instances ci ON a.id = ci.class_teacher_id
   *   WHERE a.school_code = user.school_code AND a.role IN ('admin', 'teacher')
   *   GROUP BY a.id
   * )
   * SELECT * FROM class_data, admin_data, academic_years
   * WHERE academic_years.school_code = user.school_code AND academic_years.is_active = true
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // BACKEND INTEGRATION: Replace with optimized single query above
        const { data: adminData } = await supabase
          .from('admin')
          .select('id, full_name')
          .eq('school_code', school_code);
        console.log('adminData ', adminData);
        
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, grade, section')
          .eq('school_code', school_code)
          .eq('created_by', super_admin_code);
        console.log('classesData ', classesData);

        const { data: academicYearsData } = await supabase
          .from('academic_years')
          .select('id, year_start, year_end')
          .eq('school_code', school_code);
        console.log('academicYearsData ', academicYearsData);

        setAdmins(adminData || []);
        setClasses(classesData || []);
        setAcademicYears(academicYearsData || []);
      } catch (error) {
        message.error('Failed to fetch data: ' + error.message);
      }
    };

    fetchData();
  }, [school_code, super_admin_code]);

  /**
   * CLASS INSTANCE CREATION HANDLER
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Add duplicate validation (same class + academic year)
   * - Implement capacity management and enrollment limits
   * - Create default timetable slots for the class instance
   * - Assign default fee structure based on class grade
   * - Send notifications to assigned class teacher
   * - Create initial attendance tracking setup
   * - Add to school calendar and scheduling system
   * 
   * VALIDATION CHECKS:
   * - Ensure class teacher is not overloaded
   * - Validate academic year is active
   * - Check for conflicting class instances
   * - Verify school capacity and resources
   * 
   * WORKFLOW STEPS:
   * 1. Validate form data and check for duplicates
   * 2. Create class instance record with metadata
   * 3. Set up default timetable and schedule
   * 4. Assign fee structure and payment schedules
   * 5. Create attendance tracking framework
   * 6. Notify class teacher and relevant staff
   * 7. Update school statistics and reports
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // BACKEND INTEGRATION: Add duplicate validation
      // const { data: existing } = await supabase
      //   .from('class_instances')
      //   .select('id')
      //   .eq('class_id', values.class_id)
      //   .eq('academic_year_id', values.academic_year_id)
      //   .eq('school_code', school_code);
      // 
      // if (existing && existing.length > 0) {
      //   message.error('Class instance already exists for this academic year');
      //   return;
      // }

      const selectedClass = classes.find(cls => cls.id === values.class_id);
      if (!selectedClass) {
        message.error("Selected class not found");
        setLoading(false);
        return;
      }

      const { grade, section } = selectedClass;

      // BACKEND INTEGRATION: Enhanced insert with additional metadata
      const { error: insertError } = await supabase
        .from('class_instances')
        .insert({
          class_id: values.class_id,
          academic_year_id: values.academic_year_id,
          class_teacher_id: values.class_teacher_id,
          school_code,
          created_by: super_admin_code,
          grade,
          section,
          // BACKEND INTEGRATION: Add additional fields
          // max_students: selectedClass.capacity || 40,
          // current_students: 0,
          // status: 'active',
          // created_at: new Date().toISOString(),
          // timetable_created: false,
          // fee_structure_assigned: false
        });

      if (insertError) {
        message.error(insertError.message);
      } else {
        // SUCCESS HANDLING: User feedback and additional actions
        message.success("Class instance created successfully");
        form.resetFields();
        
        // BACKEND INTEGRATION: Additional success actions
        // - Create default timetable slots
        // - Assign fee structure
        // - Send notification to class teacher
        // - Update school statistics
        // await createDefaultTimetable(newInstanceId);
        // await assignFeeStructure(newInstanceId, grade);
        // await notifyClassTeacher(values.class_teacher_id, selectedClass);
      }
    } catch (error) {
      // GENERAL ERROR HANDLING: Unexpected errors
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto">
        <Card
          title={
            <Space>
              <BookOutlined />
              <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>Create Class Instance</Title>
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
            INFORMATIONAL ALERT:
            Helps users understand the concept of class instances
            BACKEND INTEGRATION: Could be made dynamic based on school settings
          */}
          <Alert
            message="What is a Class Instance?"
            description="A class instance connects a class with an academic year and assigns a class teacher. This allows the same class structure to be used across different academic years."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {/* 
            PROFESSIONAL FORM DESIGN:
            - Multi-column responsive layout
            - Comprehensive validation rules
            - Dynamic data loading with proper error handling
            - Icon integration for better visual appeal
            
            BACKEND INTEGRATION NEEDED:
            - Add capacity management fields
            - Include timetable slot selection
            - Add fee structure assignment
            - Include classroom assignment
          */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                {/* 
                  CLASS SELECTION:
                  BACKEND INTEGRATION NEEDED:
                  - Show existing instance count for each class
                  - Display class capacity and current enrollment
                  - Add class description and subjects
                */}
                <Form.Item
                  name="class_id"
                  label="Class"
                  rules={[{ required: true, message: 'Please select a class' }]}
                >
                  <Select
                    placeholder="Select Class"
                    showSearch
                    optionFilterProp="children"
                    suffixIcon={<BookOutlined />}
                  >
                    {classes.map(c => (
                      <Option key={c.id} value={c.id}>
                        Grade {c.grade} - Section {c.section}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                {/* 
                  ACADEMIC YEAR SELECTION:
                  BACKEND INTEGRATION NEEDED:
                  - Filter only active academic years
                  - Show year status and enrollment periods
                  - Add year description and important dates
                */}
                <Form.Item
                  name="academic_year_id"
                  label="Academic Year"
                  rules={[{ required: true, message: 'Please select academic year' }]}
                >
                  <Select
                    placeholder="Select Academic Year"
                    showSearch
                    optionFilterProp="children"
                    suffixIcon={<CalendarOutlined />}
                  >
                    {academicYears.map(year => (
                      <Option key={year.id} value={year.id}>
                        {year.year_start} - {year.year_end}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                {/* 
                  CLASS TEACHER SELECTION:
                  BACKEND INTEGRATION NEEDED:
                  - Show teacher's current class load
                  - Display teacher qualifications and subjects
                  - Add teacher availability and schedule
                  - Show teacher performance ratings
                */}
                <Form.Item
                  name="class_teacher_id"
                  label="Class Teacher"
                  rules={[{ required: true, message: 'Please select class teacher' }]}
                >
                  <Select
                    placeholder="Select Class Teacher"
                    showSearch
                    optionFilterProp="children"
                    suffixIcon={<UserOutlined />}
                  >
                    {admins.map(admin => (
                      <Option key={admin.id} value={admin.id}>
                        {admin.full_name}
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
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    background: '#6366f1',
                    borderColor: '#6366f1',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  {loading ? 'Creating...' : 'Create Instance'}
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

export default AddClassInstance;