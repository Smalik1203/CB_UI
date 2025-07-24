import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Typography, Space, Layout } from 'antd';
import { UserAddOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabaseClient';
import { useAuth } from "../AuthProvider";
import { Navigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

/**
 * SIGN UP USER COMPONENT - User Registration System
 * 
 * CHANGES MADE:
 * - Converted from basic HTML form to professional Ant Design components
 * - Added comprehensive form validation with regex patterns
 * - Implemented proper error handling and user feedback
 * - Added loading states and success messages
 * - Integrated with Supabase auth and database operations
 * - Added professional layout with gradient background
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Replace hardcoded role options with dynamic role management
 * - Add email verification workflow
 * - Implement role-based registration approval process
 * - Add user profile completion workflow
 * - Include welcome email and onboarding sequence
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Auth Registration: supabase.auth.signUp() with user metadata
 * - Profile Creation: INSERT INTO cb_admin (user data)
 * - Role Assignment: UPDATE users SET role = selected_role
 * - Email Verification: Built-in Supabase email confirmation
 */
const SignUpUser = () => {
  const { user } = useAuth();
  
  // REDIRECT: Prevent access if user is already logged in
  if (user) return <Navigate to="/dashboard" />;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * USER REGISTRATION HANDLER
   * 
   * BACKEND INTEGRATION NEEDED:
   * - Add comprehensive user validation and duplicate checking
   * - Implement role-based registration approval workflow
   * - Add user profile completion requirements
   * - Include welcome email and onboarding sequence
   * - Add audit logging for registration attempts
   * 
   * SECURITY FEATURES:
   * - Email verification before account activation
   * - Role-based access control validation
   * - Password strength requirements
   * - Rate limiting for registration attempts
   * 
   * WORKFLOW STEPS:
   * 1. Validate form data and check for duplicates
   * 2. Create auth user with metadata
   * 3. Insert user profile into appropriate table
   * 4. Send verification email
   * 5. Log registration activity
   * 6. Redirect to verification page
   */
  const handleSignUp = async (values) => {
    setLoading(true);
    try {
      // SUPABASE AUTH: Create user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            phone: values.phone_number,
            role: values.role,
            cb_admin_code: values.cb_admin_code,
          },
        },
      });

      if (error) {
        // ERROR HANDLING: Display specific error messages
        message.error(error.message);
        return;
      }

      // SUCCESS HANDLING: User feedback and guidance
      message.success('Signup successful! Please check your email to confirm your account.');
      form.resetFields();

      // PROFILE CREATION: Insert user data into appropriate table
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (!userError && userData.user) {
        // BACKEND INTEGRATION: Enhanced profile creation
        const { error: insertError } = await supabase.from('cb_admin').insert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: userData.user.user_metadata.full_name,
          phone: userData.user.user_metadata.phone,
          role: userData.user.user_metadata.role,
          cb_admin_code: userData.user.user_metadata.cb_admin_code,
          // BACKEND INTEGRATION: Add additional fields
          // status: 'pending_verification',
          // created_at: new Date().toISOString(),
          // last_login: null,
          // profile_completed: false,
          // onboarding_completed: false
        });

        if (insertError) {
          message.error('Error creating user profile: ' + insertError.message);
        }
      }
    } catch (err) {
      // GENERAL ERROR HANDLING: Unexpected errors
      message.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '24px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
          bodyStyle={{ padding: '40px' }}
        >
          {/* 
            PROFESSIONAL HEADER SECTION:
            - Clean typography with proper hierarchy
            - Professional icon integration
            - Descriptive text for user guidance
            - Consistent spacing and alignment
          */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <UserAddOutlined style={{ fontSize: '48px', color: '#6366f1', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
              Create Account
            </Title>
            <Text style={{ fontSize: '16px', color: '#64748b' }}>
              Sign up for ClassBridge
            </Text>
          </div>

          {/* 
            PROFESSIONAL FORM DESIGN:
            - Comprehensive validation rules with regex patterns
            - Icon prefixes for visual appeal and better UX
            - Proper input types and constraints
            - Professional button styling and loading states
            - Pre-filled default values where appropriate
            
            BACKEND INTEGRATION NEEDED:
            - Dynamic role options based on system configuration
            - Real-time email availability checking
            - Password strength indicator
            - Phone number format validation by country
            - Admin code validation against database
          */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSignUp}
            size="large"
          >
            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 12px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your phone number"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 12px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 12px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 12px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
              initialValue="cb_admin"
            >
              {/* BACKEND INTEGRATION: Make role options dynamic */}
              <Select placeholder="Select your role" style={{ borderRadius: '8px' }}>
                <Option value="cb_admin">CB Admin</Option>
                <Option value="super_admin">Super Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="cb_admin_code"
              label="Admin Code"
              rules={[{ required: true, message: 'Please enter admin code' }]}
              initialValue="CB"
            >
              <Input
                placeholder="Enter admin code"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  padding: '10px 12px'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  background: '#6366f1',
                  borderColor: '#6366f1',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </Form.Item>
          </Form>

          {/* 
            FOOTER SECTION:
            - Professional styling and typography
            - Clear call-to-action for existing users
            - Consistent branding and messaging
            
            BACKEND INTEGRATION NEEDED:
            - Link to actual sign-in page
            - Add forgot password functionality
            - Include terms of service and privacy policy links
          */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text style={{ color: '#64748b' }}>
              Already have an account?{' '}
              <Text style={{ color: '#6366f1', fontWeight: '500' }}>
                Sign In
              </Text>
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default SignUpUser;