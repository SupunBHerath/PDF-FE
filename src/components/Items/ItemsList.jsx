import { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Popconfirm,
    Card,
    Image,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemAPI, categoryAPI } from '@/api';

const { Search } = Input;
const { Option } = Select;

const ItemsList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(undefined);
    const [statusFilter, setStatusFilter] = useState(undefined);
    const queryClient = useQueryClient();

    // Fetch items
    const { data, isLoading } = useQuery({
        queryKey: ['items', searchText, categoryFilter, statusFilter],
        queryFn: () =>
            itemAPI.getAll({
                search: searchText || undefined,
                category_id: categoryFilter,
                status: statusFilter,
                limit: 50,
            }),
    });

    // Fetch categories for dropdown
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryAPI.getAll({ status: 'active' }),
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (formData) =>
            editingItem ? itemAPI.update(editingItem.id, formData) : itemAPI.create(formData),
        onSuccess: () => {
            message.success(`Item ${editingItem ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries(['items']);
            handleCancel();
        },
        onError: (error) => {
            message.error(error.message || 'Failed to save item');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: itemAPI.delete,
        onSuccess: () => {
            message.success('Item deleted successfully');
            queryClient.invalidateQueries(['items']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete item');
        },
    });

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            category_id: record.category?.id,
            image: record.image ? [{ url: record.image }] : undefined,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
            if (values[key] !== undefined && values[key] !== null) {
                if (key === 'image' && values[key]?.file) {
                    formData.append('image', values[key].file);
                } else if (key !== 'image') {
                    formData.append(key, values[key]);
                }
            }
        });
        saveMutation.mutate(formData);
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image, record) =>
                image ? (
                    <Image
                        src={image}
                        alt={record.name}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: '#999',
                        }}
                    >
                        No Image
                    </div>
                ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) =>
                category ? <Tag color="blue">{category.name}</Tag> : <Tag>Uncategorized</Tag>,
        },
        {
            title: 'Unit Price',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: (price) => `LKR ${parseFloat(price).toFixed(2)}`,
        },
        {
            title: 'Unit Type',
            dataIndex: 'unit_type',
            key: 'unit_type',
            render: (type) => <Tag>{type}</Tag>,
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
            width: 250,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete item?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const categories = categoriesData?.data || [];

    return (
        <div>
            <Card
                title="Items Management"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Item
                    </Button>
                }
            >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Search items..."
                            allowClear
                            onSearch={setSearchText}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filter by category"
                            allowClear
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            style={{ width: '100%' }}
                        >
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
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
                    dataSource={data?.data?.items || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        total: data?.data?.pagination?.total,
                        pageSize: data?.data?.pagination?.limit || 50,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title={`${editingItem ? 'Edit' : 'Add'} Item`}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                    >
                        <Input placeholder="Enter item name" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} placeholder="Enter description" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="unit_price"
                                label="Unit Price (LKR)"
                                rules={[{ required: true, message: 'Please enter unit price' }]}
                            >
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    placeholder="0.00"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="unit_type"
                                label="Unit Type"
                                initialValue="Each"
                                rules={[{ required: true, message: 'Please select unit type' }]}
                            >
                                <Select placeholder="Select unit type">
                                    <Option value="Each">Each</Option>
                                    <Option value="Pair">Pair</Option>
                                    <Option value="Set">Set</Option>
                                    <Option value="Box">Box</Option>
                                    <Option value="Pack">Pack</Option>
                                    <Option value="Dozen">Dozen</Option>
                                    <Option value="pcs">Pieces (pcs)</Option>
                                    <Option value="kg">Kilogram (kg)</Option>
                                    <Option value="g">Gram (g)</Option>
                                    <Option value="lbs">Pounds (lbs)</Option>
                                    <Option value="m">Meter (m)</Option>
                                    <Option value="ft">Feet (ft)</Option>
                                    <Option value="l">Liter (l)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="category_id" label="Category">
                        <Select placeholder="Select category (optional)" allowClear>
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="image" label="Item Image">
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            listType="picture"
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Upload Image</Button>
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
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saveMutation.isPending}
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default ItemsList;
