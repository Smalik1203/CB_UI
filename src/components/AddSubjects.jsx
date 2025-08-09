import React, { useEffect, useState } from 'react';
import {
  Form,
  Button,
  message,
  Typography,
  Table,
  Popconfirm,
  Card,
  Select,
} from 'antd';
import { Trash2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

const { Title } = Typography;
const { Option } = Select;

// You can expand this list as needed
const predefinedSubjects = [
  'Telugu-I',
  'Telugu-II',
  'Hindi-I',
  'Hindi-II',
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Physics',
  'Biology'
];

const CreateSubjectPage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [classInstances, setClassInstances] = useState([]);
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [loading, setLoading] = useState(false);

  const role = user?.app_metadata?.role;
  const schoolCode = user?.user_metadata?.school_code;
  const createdBy = user?.user_metadata?.super_admin_code;

  const fetchClassInstances = async () => {
    const { data, error } = await supabase
      .from('class_instances')
      .select('id, grade, section')
      .eq('school_code', schoolCode)
      .order('grade', { ascending: true });

    if (error) {
      message.error('Failed to load class instances');
    } else {
      setClassInstances(data);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('id, subject_name, created_by, class_instance_id')
      .eq('school_code', schoolCode)
      .order('created_at', { ascending: false });

    if (error) {
      message.error('Failed to load subjects');
    } else {
      const grouped = data.reduce((acc, sub) => {
        const key = sub.class_instance_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(sub);
        return acc;
      }, {});
      setSubjectsByClass(grouped);
    }
    setLoading(false);
  };

  const handleDelete = async (subjectId) => {
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) {
      message.error('Failed to delete subject');
    } else {
      message.success('Subject deleted');
      fetchSubjects();
    }
  };

const onFinish = async ({ class_instance_id, subject_names }) => {
  if (role !== 'superadmin') {
    message.error('Access denied. Only superadmins can create subjects.');
    return;
  }

  const existingSubjects = subjectsByClass[class_instance_id] || [];

  const toInsert = subject_names
    .map((name) => name.trim())
    .filter(
      (name) =>
        name.length > 0 &&
        !existingSubjects.some(
          (s) => s.subject_name.toLowerCase() === name.toLowerCase()
        )
    )
    .map((name) => ({
      subject_name: name,
      class_instance_id,
      school_code: schoolCode,
      created_by: createdBy,
    }));

  if (toInsert.length === 0) {
    message.warning('All selected subjects already exist for this class.');
    return;
  }

  const { error } = await supabase.from('subjects').insert(toInsert);

  if (error) {
    message.error(`Failed to create subjects: ${error.message}`);
  } else {
    message.success(`${toInsert.length} subject(s) created successfully`);
    form.resetFields();
    fetchSubjects();
  }
};


  useEffect(() => {
    if (role === 'superadmin') {
      fetchClassInstances();
      fetchSubjects();
    }
  }, [role]);

  const classColumns = [
    {
      title: 'Class',
      dataIndex: 'label',
      key: 'label',
      render: (_, record) => `Grade ${record.grade} - ${record.section}`,
    },
  ];

  const subjectColumns = [
    {
      title: 'Subject',
      dataIndex: 'subject_name',
      key: 'subject_name',
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
          <Button type="text" danger icon={<Trash2 size={18} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        Assign Subject to Class
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
          label="Class"
          name="class_instance_id"
          rules={[{ required: true, message: 'Please select a class' }]}
        >
          <Select placeholder="Select Grade and Section">
            {classInstances.map((ci) => (
              <Option key={ci.id} value={ci.id}>
                Grade {ci.grade} - {ci.section}
              </Option>
            ))}
          </Select>
        </Form.Item>

      <Form.Item
        label="Subjects"
        name="subject_names"
        rules={[{ required: true, message: 'Please select or enter at least one subject' }]}
      >
        <Select
          mode="tags" // ✅ Enables multiple + manual input
          placeholder="Select or type subject names"
          tokenSeparators={[',']}
        >
          {predefinedSubjects.map((subject) => (
            <Option key={subject} value={subject}>
              {subject}
            </Option>
          ))}
        </Select>
      </Form.Item>


        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Assign Subject
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 40 }}>
        <Title level={4} style={{ marginBottom: 20 }}>
          Subjects by Class
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
            columns={classColumns}
            dataSource={classInstances.filter((ci) => subjectsByClass[ci.id])}
            rowKey="id"
            loading={loading}
            expandable={{
              expandedRowRender: (record) => {
                const subjects = subjectsByClass[record.id] || [];
                return (
                  <Table
                    columns={subjectColumns}
                    dataSource={subjects}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                );
              },
              rowExpandable: (record) => subjectsByClass[record.id]?.length > 0,
            }}
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
