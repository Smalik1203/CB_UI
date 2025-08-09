import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Typography, Select, DatePicker, Modal, Form, Button,
  TimePicker, message, Space, Calendar, Badge, Tooltip, Empty, Spin
} from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../AuthProvider';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { Option } = Select;

const TimetablePage = () => {
  const { user } = useAuth();

  // NOTE: per your model context, school_code lives in your custom users table.
  // If you're still reading from user_metadata, that's on you—fix your auth plumbing.
  const schoolCode = user?.user_metadata?.school_code;
  const createdBy = user?.user_metadata?.super_admin_code;

  const [classInstances, setClassInstances] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [periods, setPeriods] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'month'
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [form] = Form.useForm();
  const [smartForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [copyFromDate, setCopyFromDate] = useState(null);

  const [duration, setDuration] = useState(45);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    if (schoolCode) {
      fetchClassInstances();
      fetchSubjects();
      fetchTeachers();
    }
  }, [schoolCode]);

  useEffect(() => {
    if (selectedClass) {
      fetchPeriods();
    } else {
      setPeriods([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && viewMode === 'day') {
      fetchTimetable();
    }
  }, [selectedClass, selectedDate, viewMode]);

  const fetchClassInstances = async () => {
    try {
      const { data, error } = await supabase.from('class_instances')
        .select('id, grade, section')
        .eq('school_code', schoolCode);
      if (error) {
        message.error(`Error fetching classes: ${error.message}`);
        return;
      }
      setClassInstances(data || []);
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from('subjects')
        .select('id, subject_name')
        .eq('school_code', schoolCode);
      if (error) {
        message.error(`Error fetching subjects: ${error.message}`);
        return;
      }
      setSubjects(data || []);
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase.from('admin')
        .select('id, full_name')
        .eq('school_code', schoolCode);
      if (error) {
        message.error(`Error fetching teachers: ${error.message}`);
        return;
      }
      setTeachers(data || []);
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    }
  };

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('periods')
        .select('*')
        .eq('class_instance_id', selectedClass)
        .order('period_number');
      if (error) {
        message.error(`Error fetching periods: ${error.message}`);
        return;
      }
      setPeriods(data || []);
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const { data, error } = await supabase.from('timetable')
        .select('period_number, subject_id, admin_id')
        .eq('class_instance_id', selectedClass)
        .eq('class_date', selectedDate.format('YYYY-MM-DD'));
      if (error) {
        message.error(`Error fetching timetable: ${error.message}`);
        return;
      }
      setTimetable(data || []);
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    }
  };

  const handleStartTimeChange = (time) => {
    setStartTime(time);
    if (time && duration) {
      const calculatedEnd = dayjs(time).add(duration, 'minute');
      setEndTime(calculatedEnd);
    }
  };

  const handleDurationChange = (val) => {
    setDuration(val);
    if (startTime) {
      const calculatedEnd = dayjs(startTime).add(val, 'minute');
      setEndTime(calculatedEnd);
    }
  };

  const handleAddSmartPeriod = async () => {
    if (!startTime || !endTime || !selectedClass) {
      message.error("Please select class and time");
      return;
    }

    try {
      setLoading(true);
      const { data: existing, error: exErr } = await supabase
        .from('periods')
        .select('period_number')
        .eq('class_instance_id', selectedClass)
        .order('period_number', { ascending: false })
        .limit(1);

      if (exErr) {
        message.error(`Error checking existing periods: ${exErr.message}`);
        return;
      }

      const nextPeriodNumber = existing?.[0]?.period_number + 1 || 1;

      const { error } = await supabase.from('periods').insert([
        {
          class_instance_id: selectedClass,
          period_number: nextPeriodNumber,
          start_time: dayjs(startTime).format('HH:mm:ss'),
          end_time: dayjs(endTime).format('HH:mm:ss'),
        }
      ]);

      if (error) {
        message.error(`Error adding period: ${error.message}`);
      } else {
        message.success(`Added period ${nextPeriodNumber}`);
        setStartTime(null);
        setEndTime(null);
        smartForm.resetFields();
        fetchPeriods();
      }
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      setAssigning(true);
      const values = await form.validateFields();
      const period = periods.find(p => p.period_number === editingPeriod);

      if (!period) {
        message.error('Period not found');
        return;
      }

      // First, delete existing assignment for this period and date
      const { error: deleteError } = await supabase.from('timetable')
        .delete()
        .eq('class_instance_id', selectedClass)
        .eq('class_date', selectedDate.format('YYYY-MM-DD'))
        .eq('period_number', editingPeriod);

      if (deleteError) {
        message.error(`Error removing existing assignment: ${deleteError.message}`);
        return;
      }

      // Then insert the new assignment
      const { error } = await supabase.from('timetable').insert([
        {
          class_instance_id: selectedClass,
          class_date: selectedDate.format('YYYY-MM-DD'),
          period_number: editingPeriod,
          subject_id: values.subject_id,
          admin_id: values.teacher_id,
          school_code: schoolCode,
          start_time: period.start_time,
          end_time: period.end_time,
          created_by: createdBy
        }
      ]);

      if (error) {
        message.error(`Error saving assignment: ${error.message}`);
      } else {
        message.success('Assignment saved successfully');
        setModalVisible(false);
        form.resetFields();
        fetchTimetable();
      }
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleCopyTimetable = async () => {
    if (!copyFromDate) {
      message.warning("Select a source date first");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.from('timetable')
        .select('period_number, subject_id, admin_id, start_time, end_time')
        .eq('class_instance_id', selectedClass)
        .eq('class_date', dayjs(copyFromDate).format('YYYY-MM-DD'));

      if (error) {
        message.error(`Error fetching source timetable: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        message.error("No timetable found for that date");
        return;
      }

      // Delete existing timetable for target date
      const { error: deleteError } = await supabase.from('timetable')
        .delete()
        .eq('class_instance_id', selectedClass)
        .eq('class_date', selectedDate.format('YYYY-MM-DD'));

      if (deleteError) {
        message.error(`Error clearing target date: ${deleteError.message}`);
        return;
      }

      // Insert copied timetable
      const inserts = data.map(entry => ({
        ...entry,
        class_instance_id: selectedClass,
        class_date: selectedDate.format('YYYY-MM-DD'),
        school_code: schoolCode,
        created_by: createdBy
      }));

      const { error: insertErr } = await supabase.from('timetable').insert(inserts);
      if (insertErr) {
        message.error(`Error copying timetable: ${insertErr.message}`);
      } else {
        message.success("Timetable copied successfully");
        fetchTimetable();
      }
    } catch (err) {
      message.error(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (period_number) => {
    setEditingPeriod(period_number);
    const entry = timetable.find(t => t.period_number === period_number);
    form.setFieldsValue({
      subject_id: entry?.subject_id || undefined,
      teacher_id: entry?.admin_id || undefined
    });
    setModalVisible(true);
  };

  const renderGrid = () => (
    <div style={{ marginTop: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Period</th>
            <th style={cellStyle}>Time</th>
            <th style={cellStyle}>Subject</th>
            <th style={cellStyle}>Teacher</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {periods.map(p => {
            const entry = timetable.find(t => t.period_number === p.period_number);
            const subject = subjects.find(s => s.id === entry?.subject_id);
            const teacher = teachers.find(t => t.id === entry?.admin_id);

            return (
              <tr key={p.period_number}>
                <td style={cellStyle}>{p.period_number}</td>
                <td style={cellStyle}>{p.start_time} - {p.end_time}</td>
                <td style={cellStyle}>{subject?.subject_name || '-'}</td>
                <td style={cellStyle}>{teacher?.full_name || '-'}</td>
                <td style={cellStyle}>
                  <Button 
                    size="small" 
                    type={entry ? "default" : "primary"}
                    onClick={() => openEditModal(p.period_number)}
                  >
                    {entry ? 'Edit' : 'Assign'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (!schoolCode) {
    return (
      <Card>
        <Empty description="School code not found. Please contact your administrator." />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={3}>Timetable Manager</Title>

      <Space style={{ marginBottom: 24 }} wrap>
        <Select
          placeholder="Select Class"
          style={{ width: 220 }}
          onChange={(val) => {
            setSelectedClass(val);
            setViewMode('day');
          }}
          value={selectedClass || undefined}
          loading={loading}
        >
          {classInstances.map(cls => (
            <Option key={cls.id} value={cls.id}>
              Grade {cls.grade} - {cls.section}
            </Option>
          ))}
        </Select>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          picker={viewMode === 'day' ? 'date' : 'month'}
        />

        <Select value={viewMode} onChange={setViewMode} style={{ width: 160 }}>
          <Option value="day">🗓️ View by Day</Option>
          <Option value="month">📅 View by Month</Option>
        </Select>

        <DatePicker
          placeholder="Copy from date"
          value={copyFromDate}
          onChange={setCopyFromDate}
          disabled={!selectedClass}
        />

        <Button 
          type="dashed" 
          onClick={handleCopyTimetable} 
          disabled={!selectedClass || loading}
          loading={loading}
        >
          Copy Timetable
        </Button>
      </Space>

      {viewMode === 'day' ? (
        selectedClass ? (
          <Spin spinning={loading}>
            <>
              <Title level={5}>Smart Add Period</Title>
              <Form layout="inline" form={smartForm}>
                <Form.Item label="Duration (mins)">
                  <Select defaultValue={45} style={{ width: 100 }} onChange={handleDurationChange}>
                    {[30, 35, 40, 45, 50, 60].map((d) => (
                      <Option key={d} value={d}>{d} min</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Start Time">
                  <TimePicker format="HH:mm" value={startTime} onChange={handleStartTimeChange} />
                </Form.Item>

                <Form.Item label="End Time">
                  <TimePicker format="HH:mm" value={endTime} disabled />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={handleAddSmartPeriod} loading={loading}>
                    Add Period
                  </Button>
                </Form.Item>
              </Form>

              {periods.length > 0 ? renderGrid() : (
                <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                  No periods defined yet. Add periods using the form above.
                </Text>
              )}
            </>
          </Spin>
        ) : (
          <Empty description="Select a class to manage its timetable" />
        )
      ) : (
        <MonthCalendarView
          classId={selectedClass}
          selectedMonth={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setViewMode('day');
          }}
        />
      )}

      <Modal
        open={modalVisible}
        title={`Assign Subject & Teacher (Period ${editingPeriod})`}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={handleAssign}
        confirmLoading={assigning}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subject_id" label="Subject" rules={[{ required: true, message: 'Please select a subject' }]}>
            <Select placeholder="Select subject">
              {subjects.map(s => (
                <Option key={s.id} value={s.id}>{s.subject_name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true, message: 'Please select a teacher' }]}>
            <Select placeholder="Select teacher">
              {teachers.map(t => (
                <Option key={t.id} value={t.id}>{t.full_name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const MonthCalendarView = ({ classId, selectedMonth, onSelectDate }) => {
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    if (!classId || !selectedMonth) return;
    fetchMonthData();
  }, [classId, selectedMonth]);

  const fetchMonthData = async () => {
    const start = selectedMonth.startOf('month').format('YYYY-MM-DD');
    const end = selectedMonth.endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('timetable')
      .select('class_date, period_number')
      .eq('class_instance_id', classId)
      .gte('class_date', start)
      .lte('class_date', end);

    if (error) {
      message.error(error.message);
      setMonthData([]);
      return;
    }
    setMonthData(data || []);
  };

  const countsByDate = useMemo(() => {
    const map = new Map();
    for (const row of monthData) {
      const key = row.class_date;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [monthData]);

  const dateFullCellRender = (date) => {
    const key = date.format('YYYY-MM-DD');
    const count = countsByDate.get(key) || 0;

    return (
      <div style={{ minHeight: 64, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 12, opacity: 0.6 }}>
          {date.date()}
        </div>
        {count > 0 ? (
          <Tooltip title={`${count} period${count > 1 ? 's' : ''} assigned`}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 20 }}>
              {/* show up to 6 little dots as a quick visual */}
              {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                <Badge key={i} status="processing" />
              ))}
              {count > 6 && <Text type="secondary" style={{ fontSize: 12 }}>+{count - 6}</Text>}
            </div>
          </Tooltip>
        ) : (
          <div style={{ marginTop: 22 }}>
            <Text type="secondary" style={{ fontSize: 12 }}></Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card size="small" bodyStyle={{ padding: 0 }}>
      {classId ? (
        <Calendar
          value={selectedMonth}
          mode="month"
          onSelect={(d) => onSelectDate?.(d)}
          dateFullCellRender={dateFullCellRender}
        />
      ) : (
        <Empty description="Select a class to view its calendar" style={{ padding: 24 }} />
      )}
    </Card>
  );
};

const cellStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center'
};

export default TimetablePage;
