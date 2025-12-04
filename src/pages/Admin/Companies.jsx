import { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    message,
    Popconfirm,
    Card,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAPI } from '@/api';

const { Search } = Input;
const { Option } = Select;

const Companies = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    // Fetch companies
    const { data, isLoading } = useQuery({
        queryKey: ['companies', searchText, statusFilter],
        queryFn: () =>
            companyAPI.getAll({
                search: searchText || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            }),
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (formData) =>
            editingCompany
                ? companyAPI.update(editingCompany.id, formData)
                : companyAPI.create(formData),
        onSuccess: () => {
            message.success(
                `Company ${editingCompany ? 'updated' : 'created'} successfully`
            );
            queryClient.invalidateQueries(['companies']);
            handleCancel();
        },
        onError: (error) => {
            message.error(error.message || 'Failed to save company');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: companyAPI.delete,
        onSuccess: () => {
            message.success('Company deleted successfully');
            queryClient.invalidateQueries(['companies']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete company');
        },
    });

    const handleAdd = () => {
        setEditingCompany(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingCompany(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
            if (values[key] !== undefined && values[key] !== null) {
                if (key === 'logo' && values[key]?.file) {
                    formData.append('logo', values[key].file);
                } else {
                    formData.append(key, values[key]);
                }
            }
        });
        saveMutation.mutate(formData);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {record.logo && (
                        <img
                            src={record.logo}
                            alt={text}
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                        />
                    )}
                    <strong>{text}</strong>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete company?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title="Companies"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Company
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16 }} wrap>
                    <Search
                        placeholder="Search companies..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 120 }}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Space>

                <Table
                    columns={columns}
                    dataSource={data?.data?.companies || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: data?.data?.pagination?.total,
                        pageSize: 10,
                    }}
                />
            </Card>

            <Modal
                title={`${editingCompany ? 'Edit' : 'Add'} Company`}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Company Name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                    >
                        <Input placeholder="Enter company name" />
                    </Form.Item>

                    <Form.Item name="email" label="Email">
                        <Input type="email" placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item name="address" label="Address">
                        <Input.TextArea rows={3} placeholder="Enter address" />
                    </Form.Item>

                    <Form.Item name="logo" label="Logo">
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="status" label="Status" initialValue="active">
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
                                {editingCompany ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Companies;
