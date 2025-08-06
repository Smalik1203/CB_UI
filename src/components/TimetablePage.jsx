import React, { useEffect, useState } from 'react';
import {
  Card, Form, Select, InputNumber, TimePicker, Button, message, Table, Typography
} from 'antd';
import dayjs from 'dayjs';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

const { Title } = Typography;
const { Option } = Select;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetablePage = () => {
  const { user } = useAuth();
  const role = user?.app_metadata?.role;
  const schoolCode = user?.user_metadata?.school_code;
  const createdBy = user?.user_metadata?.super_admin_code;

  const [form] = Form.useForm();
  const [classInstances, setClassInstances] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetableData, setTimetableData] = useState([]);

  const fetchInitialData = async () => {
    const [{ data: classes }, { data: subs }, { data: admins }] = await Promise.all([
      supabase.from('class_instances').select('id, grade, section').eq('school_code', schoolCode),
      supabase.from('subjects').select('id, subject_name').eq('school_code', schoolCode),
      supabase.from('admin').select('id, full_name').eq('school_code', schoolCode),
    ]);

    setClassInstances(classes || []);
    setSubjects(subs || []);
    setTeachers(admins || []);
  };

  const fetchTimetable = async (class_instance_id) => {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject:subjects (subject_name),
        teacher:admin (full_name)
      `)
      .eq('class_instance_id', class_instance_id)
      .order('day_of_week', { ascending: true })
      .order('period_number', { ascending: true });

    if (error) {
      message.error('Failed to fetch timetable');
    } else {
      setTimetableData(data || []);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onFinish = async (values) => {
    const { class_instance_id, day_of_week, period_number, subject_id, teacher_id, time } = values;

    const { error } = await supabase.from('timetable').insert([
      {
        class_instance_id,
        school_code: schoolCode,
        day_of_week,
        period_number,
        subject_id,
        teacher_id,
        start_time: dayjs(time[0]).format('HH:mm:ss'),
        end_time: dayjs(time[1]).format('HH:mm:ss'),
        created_by: createdBy,
      },
    ]);

    if (error) {
      message.error(`Error adding timetable: ${error.message}`);
    } else {
      message.success('Timetable entry added');
      form.resetFields(['day_of_week', 'period_number', 'subject_id', 'teacher_id', 'time']);
      fetchTimetable(class_instance_id); // refresh table
    }
  };

  const columns = [
    { title: 'Day', dataIndex: 'day_of_week', key: 'day_of_week' },
    { title: 'Period', dataIndex: 'period_number', key: 'period_number' },
    { title: 'Subject', dataIndex: ['subject', 'subject_name'], key: 'subject_name' },
    { title: 'Teacher', dataIndex: ['teacher', 'full_name'], key: 'teacher_name' },
    { title: 'Start', dataIndex: 'start_time', key: 'start_time' },
    { title: 'End', dataIndex: 'end_time', key: 'end_time' },
  ];

  return (
    <Card>
      <Title level={3}>Timetable Management</Title>

  <Form
    layout="vertical"
    form={form}
    onFinish={onFinish}
    onValuesChange={(changed) => {
      if (changed.class_instance_id) {
        fetchTimetable(changed.class_instance_id);
      }
    }}
  >
    <Form.Item
      name="class_instance_id"
      label="Select Class"
      rules={[{ required: true }]}
      style={{ maxWidth: 280 }}
    >
      <Select placeholder="Choose class" style={{ width: '100%' }}>
        {classInstances.map((c) => (
          <Option key={c.id} value={c.id}>
            Grade {c.grade} - {c.section}
          </Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      name="day_of_week"
      label="Day"
      rules={[{ required: true }]}
      style={{ maxWidth: 200 }}
    >
      <Select placeholder="Choose day" style={{ width: '100%' }}>
        {daysOfWeek.map((day) => (
          <Option key={day} value={day}>{day}</Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      name="period_number"
      label="Period Number"
      rules={[{ required: true }]}
      style={{ maxWidth: 140 }}
    >
      <InputNumber min={1} max={10} style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item
      name="subject_id"
      label="Subject"
      rules={[{ required: true }]}
      style={{ maxWidth: 280 }}
    >
      <Select placeholder="Select subject" style={{ width: '100%' }}>
        {subjects.map((s) => (
          <Option key={s.id} value={s.id}>{s.subject_name}</Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      name="teacher_id"
      label="Teacher"
      rules={[{ required: true }]}
      style={{ maxWidth: 280 }}
    >
      <Select placeholder="Select teacher" style={{ width: '100%' }}>
        {teachers.map((t) => (
          <Option key={t.id} value={t.id}>{t.full_name}</Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      name="time"
      label="Start & End Time"
      rules={[{ required: true, message: 'Select start and end time' }]}
      style={{ maxWidth: 280 }}
    >
      <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Add to Timetable
      </Button>
    </Form.Item>
  </Form>


      <Table
        columns={columns}
        dataSource={timetableData}
        rowKey="id"
        bordered
        pagination={false}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default TimetablePage;
