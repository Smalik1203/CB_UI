import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, List, Tag, Row, Col, Alert } from 'antd';
import { CalendarOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

const { Title, Text } = Typography;

/**
 * ADD ACADEMIC YEAR COMPONENT - Academic Year Management System
 * 
 * CHANGES MADE:
 * - Converted from basic HTML form to professional Ant Design components
 * - Added dual-panel layout with form and existing years list
 * - Implemented comprehensive form validation with year format checking
 * - Added informational alert explaining academic year format
 * - Integrated real-time academic year listing with status indicators
 * - Added proper loading states and user feedback
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace hardcoded queries with optimized academic year management
 * - Add academic year status management (active, inactive, archived)
 * - Implement academic calendar integration with important dates
 * - Add semester/term management within academic years
 * - Include fee structure and examination schedule setup
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Academic Years Query: SELECT * FROM academic_years WHERE school_code = user.school_code ORDER BY year_start DESC
 * - Insert Query: INSERT INTO academic_years (school_id, school_code, year_start, year_end, is_active)
 * - Status Update: UPDATE academic_years SET is_active = false WHERE school_code = user.school_code AND id != new_year_id
 */
const AddAcademicYear = () => {
  const { user } = useAuth();
  
  // BACKEND INTEGRATION: Get school context from authenticated user
  // This ensures academic years are created within the correct school
  const { school_id, school_code, school_name, super_admin_code } = user.user_metadata || {};

  const [form] = Form.useForm();
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * FETCH EXISTING ACADEMIC YEARS
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Add pagination for schools with many academic years
   * - Include additional metadata (enrollment count, active classes, etc.)
   * - Add filtering options (active, archived, future)
   * - Implement real-time subscriptions for data updates
   * 
   * ENHANCED QUERY EXAMPLE:
   * SELECT ay.*, 
   *        COUNT(DISTINCT ci.id) as class_instances,
   *        COUNT(DISTINCT s.id) as total_students,
   *        COUNT(DISTINCT e.id) as examinations
   * FROM academic_years ay
   * LEFT JOIN class_instances ci ON ay.id = ci.academic_year_id
   * LEFT JOIN students s ON ci.id = s.class_instance_id
   * LEFT JOIN examinations e ON ay.id = e.academic_year_id
   * WHERE ay.school_code = user.school_code
   * GROUP BY ay.id
   * ORDER BY ay.year_start DESC
   */
  useEffect(() => {
    const fetchAcademicYears = async () => {
      // BACKEND INTEGRATION: Replace with enhanced query above
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_code', school_code)
        .order('year_start', { ascending: false });

      if (error) {
        message.error(error.message);
      } else {
        setAcademicYears(data);
      }
    };

    fetchAcademicYears();
  }, [school_code]);

  /**
   * ACADEMIC YEAR CREATION HANDLER
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Add comprehensive validation for year ranges
   * - Implement automatic status management (set new year as active)
   * - Create default academic calendar with important dates
   * - Set up semester/term structure within the year
   * - Initialize fee structures for different grades
   * - Create examination schedule templates
   * - Send notifications to all school staff
   * 
   * VALIDATION CHECKS:
   * - Ensure year range is logical (end = start + 1)
   * - Check for overlapping academic years
   * - Validate against school's academic calendar policy
   * - Ensure sufficient gap between academic years
   * 
   * WORKFLOW STEPS:
   * 1. Validate year format and range
   * 2. Check for conflicts with existing years
   * 3. Create academic year record
   * 4. Set up academic calendar with key dates
   * 5. Initialize semester/term structure
   * 6. Create default fee structures
   * 7. Set up examination schedule framework
   * 8. Notify relevant stakeholders
   */
  const handleAddYear = async (values) => {
    setLoading(true);
    try {
      const start = parseInt(values.year_start);
      const end = parseInt(values.year_end);

      // VALIDATION: Ensure proper year format and sequence
      if (!start || !end || end !== start + 1) {
        message.error('Enter valid start and end year (e.g., 2025 and 2026)');
        setLoading(false);
        return;
      }

      // BACKEND INTEGRATION: Add overlap validation
      // const { data: overlapping } = await supabase
      //   .from('academic_years')
      //   .select('id')
      //   .eq('school_code', school_code)
      //   .or(`year_start.eq.${start},year_end.eq.${end}`);
      // 
      // if (overlapping && overlapping.length > 0) {
      //   message.error('Academic year overlaps with existing year');
      //   return;
      // }

      // BACKEND INTEGRATION: Enhanced insert with additional setup
      const { error: insertError } = await supabase
        .from('academic_years')
        .insert({
          school_id,
          school_code,
          school_name,
          year_start: start,
          year_end: end,
          is_active: true,
          // BACKEND INTEGRATION: Add additional fields
          // status: 'active',
          // start_date: `${start}-04-01`, // Typical academic year start
          // end_date: `${end}-03-31`,     // Typical academic year end
          // semester_count: 2,
          // term_count: 4,
          // created_by: super_admin_code,
          // academic_calendar: {
          //   admission_start: `${start}-02-01`,
          //   admission_end: `${start}-03-31`,
          //   classes_start: `${start}-04-01`,
          //   mid_term_break: `${start}-10-15`,
          //   winter_break: `${start}-12-20`,
          //   final_exams: `${end}-02-01`
          // }
        });

      if (insertError) {
        message.error(insertError.message);
      } else {
        // SUCCESS HANDLING: User feedback and data refresh
        message.success('Academic year added successfully');
        form.resetFields();
        
        // BACKEND INTEGRATION: Additional success actions
        // - Create default academic calendar
        // - Set up semester/term structure
        // - Initialize fee structures
        // - Send notifications to staff
        // await setupAcademicCalendar(newYearId);
        // await createSemesterStructure(newYearId);
        // await initializeFeeStructures(newYearId);
        
        // Re-fetch updated list
        const { data } = await supabase
          .from('academic_years')
          .select('*')
          .eq('school_code', school_code)
          .order('year_start', { ascending: false });
        setAcademicYears(data || []);
      }
    } catch (error) {
      // GENERAL ERROR HANDLING: Unexpected errors
      message.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <Row gutter={[24, 24]}>
          {/* Add Academic Year Form */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <Title level={3} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>Add Academic Year</Title>
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
                Helps users understand academic year format requirements
                BACKEND INTEGRATION: Could be made dynamic based on school's academic calendar policy
              */}
              <Alert
                message="Academic Year Format"
                description="Academic years should be consecutive (e.g., 2024-2025). The end year should be exactly one year after the start year."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />

              {/* 
                PROFESSIONAL FORM DESIGN:
                - Comprehensive validation with year format checking
                - Proper input types and constraints
                - User-friendly placeholders and guidance
                - Professional button styling and loading states
                
                BACKEND INTEGRATION NEEDED:
                - Add academic calendar date selection
                - Include semester/term configuration
                - Add fee structure template selection
                - Include examination schedule setup
              */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddYear}
                size="large"
              >
                <Form.Item
                  name="year_start"
                  label="Start Year"
                  rules={[
                    { required: true, message: 'Please enter start year' },
                    { pattern: /^[0-9]{4}$/, message: 'Please enter a valid 4-digit year' }
                  ]}
                >
                  <Input
                    placeholder="e.g., 2025"
                    type="number"
                    min="2020"
                    max="2050"
                  />
                </Form.Item>

                <Form.Item
                  name="year_end"
                  label="End Year"
                  rules={[
                    { required: true, message: 'Please enter end year' },
                    { pattern: /^[0-9]{4}$/, message: 'Please enter a valid 4-digit year' }
                  ]}
                >
                  <Input
                    placeholder="e.g., 2026"
                    type="number"
                    min="2021"
                    max="2051"
                  />
                </Form.Item>

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
                      {loading ? 'Adding...' : 'Add Academic Year'}
                    </Button>
                    <Button
                      size="large"
                      onClick={() => form.resetFields()}
                    >
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Existing Academic Years */}
          <Col xs={24} lg={12}>
            <Card
              title={`Academic Years (${academicYears.length})`}
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                background: '#ffffff'
              }}
              headStyle={{ borderBottom: '1px solid #e2e8f0' }}
            >
              {/* 
                EXISTING ACADEMIC YEARS DISPLAY:
                - Professional list with status indicators
                - Empty state for new schools
                - Creation date tracking
                - Active status highlighting
                
                BACKEND INTEGRATION NEEDED:
                - Add enrollment statistics for each year
                - Show class instances and student count
                - Add action buttons (edit, archive, activate)
                - Include academic calendar summary
              */}
              {academicYears.length > 0 ? (
                <List
                  dataSource={academicYears}
                  renderItem={(year) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CalendarOutlined style={{ fontSize: '20px', color: '#6366f1' }} />}
                        title={
                          <Space>
                            <Text strong style={{ color: '#1e293b' }}>{year.year_start} - {year.year_end}</Text>
                            {year.is_active && (
                              <Tag style={{ background: '#dcfce7', color: '#166534', border: 'none' }} icon={<CheckCircleOutlined />}>
                                Active
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          // BACKEND INTEGRATION: Add more metadata
                          // - Show enrollment count
                          // - Display class instances
                          // - Add important dates
                          <Text style={{ color: '#64748b' }}>
                            Created: {new Date(year.created_at).toLocaleDateString()}
                          </Text>
                        }
                      />
                      {/* BACKEND INTEGRATION: Add action buttons
                      <Space>
                        <Button size="small" type="link">Edit</Button>
                        <Button size="small" type="link">View Details</Button>
                        {!year.is_active && (
                          <Button size="small" type="link">Activate</Button>
                        )}
                      </Space>
                      */}
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <CalendarOutlined style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
                  <Text style={{ color: '#64748b' }}>No academic years added yet</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddAcademicYear;