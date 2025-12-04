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
    Statistic,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAPI } from '@/api';
import useAuthStore from '@/store/authStore';

const { Search } = Input;
const { Option } = Select;

const CategoriesList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined);
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const isAdmin = user?.role === 'admin';

    // Fetch categories
    const { data, isLoading } = useQuery({
        queryKey: ['categories', searchText, statusFilter],
        queryFn: () =>
            categoryAPI.getAll({
                search: searchText || undefined,
                status: statusFilter,
            }),
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (categoryData) =>
            editingCategory
                ? categoryAPI.update(editingCategory.id, categoryData)
                : categoryAPI.create(categoryData),
        onSuccess: () => {
            message.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['items']); // Refresh items too
            handleCancel();
        },
        onError: (error) => {
            message.error(error.message || 'Failed to save category');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: categoryAPI.delete,
        onSuccess: () => {
            message.success('Category deleted successfully');
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['items']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete category');
        },
    });

    const handleAdd = () => {
        if (!isAdmin) {
            message.warning('Only administrators can create categories');
            return;
        }
        setEditingCategory(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        if (!isAdmin) {
            message.warning('Only administrators can edit categories');
            return;
        }
        setEditingCategory(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!isAdmin) {
            message.warning('Only administrators can delete categories');
            return;
        }
        deleteMutation.mutate(id);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const handleSubmit = (values) => {
        saveMutation.mutate(values);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <TagsOutlined />
                    <strong>{text}</strong>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Items Count',
            dataIndex: 'itemCount',
            key: 'itemCount',
            align: 'center',
            render: (count) => <Tag color="blue">{count || 0} items</Tag>,
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
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={!isAdmin}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete category?"
                        description={
                            record.itemCount > 0
                                ? `This category has ${record.itemCount} items. Delete anyway?`
                                : 'This action cannot be undone.'
                        }
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={!isAdmin}
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={!isAdmin}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const categories = data?.data || [];
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.status === 'active').length;
    const totalItems = categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0);

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Categories"
                            value={totalCategories}
                            prefix={<TagsOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Active Categories"
                            value={activeCategories}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Items" value={totalItems} />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Categories Management"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        disabled={!isAdmin}
                    >
                        Add Category
                    </Button>
                }
            >
                {!isAdmin && (
                    <div
                        style={{
                            padding: '12px',
                            background: '#fff7e6',
                            border: '1px solid #ffd666',
                            borderRadius: '4px',
                            marginBottom: '16px',
                        }}
                    >
                        <strong>Note:</strong> Only administrators can create, edit, or delete
                        categories.
                    </div>
                )}

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={16}>
                        <Search
                            placeholder="Search categories..."
                            allowClear
                            onSearch={setSearchText}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: categories.length,
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} categories`,
                    }}
                />
            </Card>

            <Modal
                title={`${editingCategory ? 'Edit' : 'Add'} Category`}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g., Personal Protective Equipment" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter a brief description of this category"
                        />
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
                                {editingCategory ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesList;
