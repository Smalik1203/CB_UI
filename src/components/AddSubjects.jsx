import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Table,
  Popconfirm,
  Space,
  Card,
} from 'antd';
import { Trash2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

const { Title } = Typography;

const CreateSubjectPage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const role = user?.app_metadata?.role;
  const schoolCode = user?.user_metadata?.school_code;
  const createdBy = user?.user_metadata?.super_admin_code;

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_code', schoolCode)
      .order('created_at', { ascending: false });

    if (error) {
      message.error('Failed to load subjects');
    } else {
      setSubjects(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      message.error('Failed to delete subject');
    } else {
      message.success('Subject deleted');
      fetchSubjects();
    }
  };

  const onFinish = async (values) => {
    if (role !== 'superadmin') {
      message.error('Access denied. Only superadmins can create subjects.');
      return;
    }

    const { subject_code, subject_name } = values;

    const { error } = await supabase.from('subjects').insert([
      {
        subject_code,
        subject_name,
        school_code: schoolCode,
        created_by: createdBy,
      },
    ]);

    if (error) {
      message.error(`Failed to create subject: ${error.message}`);
    } else {
      message.success('Subject created successfully');
      form.resetFields();
      fetchSubjects();
    }
  };

  useEffect(() => {
    if (role === 'superadmin') {
      fetchSubjects();
    }
  }, [role]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'subject_name',
      key: 'subject_name',
    },
    {
      title: 'Code',
      dataIndex: 'subject_code',
      key: 'subject_code',
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete this subject?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<Trash2 size={18} />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        Create New Subject
      </Title>
    <Form
    form={form}
    layout="vertical"
    onFinish={onFinish}
    style={{
        padding: 24,
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}
    >
    <Form.Item
        label="Grade / Class"
        name="grade"
        rules={[{ required: true, message: 'Please select grade/class' }]}
    >
        <Input placeholder="e.g. 1, 2, 10" type="number" />
    </Form.Item>

    <Form.Item
        label="Section"
        name="section"
        rules={[{ required: true, message: 'Please input section' }]}
    >
        <Input placeholder="e.g. A, B" />
    </Form.Item>

    <Form.Item
        label="Subject Code"
        name="subject_code"
        rules={[{ required: true, message: 'Please input subject code' }]}
    >
        <Input placeholder="e.g. MATH101" />
    </Form.Item>

    <Form.Item
        label="Subject Name"
        name="subject_name"
        rules={[{ required: true, message: 'Please input subject name' }]}
    >
        <Input placeholder="e.g. Mathematics" />
    </Form.Item>

    <Form.Item>
        <Button type="primary" htmlType="submit" block>
        Create Subject
        </Button>
    </Form.Item>
    </Form>

      <div style={{ marginTop: 40 }}>
        <Title level={4} style={{ marginBottom: 20 }}>
          Existing Subjects
        </Title>
        <Card
          bodyStyle={{ padding: 0 }}
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <Table
            columns={columns}
            dataSource={subjects}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 6 }}
            size="middle"
            bordered={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default CreateSubjectPage;
