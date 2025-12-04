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
    message,
    Popconfirm,
    Card,
    Transfer,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, companyAPI } from '@/api';

const { Search } = Input;
const { Option } = Select;

const Users = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [targetKeys, setTargetKeys] = useState([]);
    const queryClient = useQueryClient();

    // Fetch users
    const { data, isLoading } = useQuery({
        queryKey: ['users', searchText, roleFilter],
        queryFn: () =>
            userAPI.getAll({
                search: searchText || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
            }),
    });

    // Fetch companies for assignment
    const { data: companiesData } = useQuery({
        queryKey: ['companies-all'],
        queryFn: () => companyAPI.getAll({ limit: 1000 }),
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (userData) =>
            editingUser ? userAPI.update(editingUser.id, userData) : userAPI.create(userData),
        onSuccess: () => {
            message.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries(['users']);
            handleCancel();
        },
        onError: (error) => {
            message.error(error.message || 'Failed to save user');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: userAPI.delete,
        onSuccess: () => {
            message.success('User deleted successfully');
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete user');
        },
    });

    // Assign companies mutation
    const assignMutation = useMutation({
        mutationFn: ({ id, companyIds }) => userAPI.assignCompanies(id, companyIds),
        onSuccess: () => {
            message.success('Companies assigned successfully');
            queryClient.invalidateQueries(['users']);
            setIsCompanyModalOpen(false);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to assign companies');
        },
    });

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            ...record,
            company_ids: record.companies?.map((c) => c.id) || [],
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        saveMutation.mutate(values);
    };

    const handleManageCompanies = (record) => {
        setSelectedUser(record);
        setTargetKeys(record.companies?.map((c) => c.id) || []);
        setIsCompanyModalOpen(true);
    };

    const handleAssignCompanies = () => {
        assignMutation.mutate({
            id: selectedUser.id,
            companyIds: targetKeys,
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'purple' : 'blue'}>
                    {role === 'admin' ? 'ADMIN' : 'COMPANY USER'}
                </Tag>
            ),
        },
        {
            title: 'Companies',
            dataIndex: 'companies',
            key: 'companies',
            render: (companies) => (
                <Space wrap>
                    {companies?.map((company) => (
                        <Tag key={company.id}>{company.name}</Tag>
                    )) || '-'}
                </Space>
            ),
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
                        icon={<TeamOutlined />}
                        onClick={() => handleManageCompanies(record)}
                    >
                        Assign
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete user?"
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
                title="Users"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add User
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16 }} wrap>
                    <Search
                        placeholder="Search users..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                    />
                    <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 150 }}>
                        <Option value="all">All Roles</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="company_user">Company User</Option>
                    </Select>
                </Space>

                <Table
                    columns={columns}
                    dataSource={data?.data?.users || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: data?.data?.pagination?.total,
                        pageSize: 10,
                    }}
                />
            </Card>

            <Modal
                title={`${editingUser ? 'Edit' : 'Add'} User`}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' },
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 6, message: 'Password must be at least 6 characters' },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}

                    <Form.Item name="role" label="Role" initialValue="company_user">
                        <Select>
                            <Option value="admin">Admin</Option>
                            <Option value="company_user">Company User</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="status" label="Status" initialValue="active">
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saveMutation.isPending}
                            >
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Assign Companies - ${selectedUser?.name}`}
                open={isCompanyModalOpen}
                onCancel={() => setIsCompanyModalOpen(false)}
                onOk={handleAssignCompanies}
                okButtonProps={{ loading: assignMutation.isPending }}
                width={700}
            >
                <Transfer
                    dataSource={
                        companiesData?.data?.companies?.map((c) => ({
                            key: c.id,
                            title: c.name,
                        })) || []
                    }
                    titles={['Available', 'Assigned']}
                    targetKeys={targetKeys}
                    onChange={setTargetKeys}
                    render={(item) => item.title}
                    listStyle={{
                        width: 300,
                        height: 400,
                    }}
                />
            </Modal>
        </div>
    );
};

export default Users;
