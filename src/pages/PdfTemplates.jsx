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
    Switch,
    message,
    Popconfirm,
    Card,
    Row,
    Col,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FileTextOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pdfTemplateAPI, companyAPI } from '@/api';
import useAuthStore from '@/store/authStore';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const PdfTemplates = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const isAdmin = user?.role === 'admin';

    // Fetch templates
    const { data, isLoading } = useQuery({
        queryKey: ['pdf-templates'],
        queryFn: () => pdfTemplateAPI.getAll({}),
    });

    // Fetch companies (for admin)
    const { data: companiesData } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyAPI.getAll({}),
        enabled: isAdmin,
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (templateData) =>
            editingTemplate
                ? pdfTemplateAPI.update(editingTemplate.id, templateData)
                : pdfTemplateAPI.create(templateData),
        onSuccess: () => {
            message.success(`Template ${editingTemplate ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries(['pdf-templates']);
            handleCancel();
        },
        onError: (error) => {
            message.error(error.message || 'Failed to save template');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: pdfTemplateAPI.delete,
        onSuccess: () => {
            message.success('Template deleted successfully');
            queryClient.invalidateQueries(['pdf-templates']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete template');
        },
    });

    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingTemplate(record);
        form.setFieldsValue({
            ...record,
            company_id: record.company?.id || null,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
        form.resetFields();
    };

    const handleSubmit = (values) => {
        saveMutation.mutate(values);
    };

    const columns = [
        {
            title: 'Template Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <FileTextOutlined />
                    <strong>{text}</strong>
                    {record.is_default && <StarOutlined style={{ color: '#faad14' }} />}
                </Space>
            ),
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
            render: (company) =>
                company ? (
                    <Tag color="blue">{company.name}</Tag>
                ) : (
                    <Tag color="purple">Global Template</Tag>
                ),
        },
        {
            title: 'Show Logo',
            dataIndex: 'show_company_logo',
            key: 'show_company_logo',
            align: 'center',
            render: (show) => (show ? '✓' : '✗'),
        },
        {
            title: 'Show Images',
            dataIndex: 'show_item_images',
            key: 'show_item_images',
            align: 'center',
            render: (show) => (show ? '✓' : '✗'),
        },
        {
            title: 'Default',
            dataIndex: 'is_default',
            key: 'is_default',
            align: 'center',
            render: (isDefault) =>
                isDefault ? <Tag color="gold">Default</Tag> : <Tag>No</Tag>,
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
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete template?"
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

    const templates = data?.data || [];
    const companies = companiesData?.data?.companies || companiesData?.data || [];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="PDF Templates Management"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Template
                    </Button>
                }
            >
                <p style={{ marginBottom: 16, color: '#666' }}>
                    Manage quotation PDF templates. Set default templates for each company or create
                    global templates.
                </p>

                <Table
                    columns={columns}
                    dataSource={templates}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Total ${total} templates`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title={`${editingTemplate ? 'Edit' : 'Add'} PDF Template`}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Template Name"
                                rules={[{ required: true, message: 'Please enter template name' }]}
                            >
                                <Input placeholder="e.g., Company Standard Template" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="company_id" label="Company (Optional)">
                                <Select
                                    placeholder="Select company or leave blank for global"
                                    allowClear
                                >
                                    {companies.map((company) => (
                                        <Option key={company.id} value={company.id}>
                                            {company.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Template Content</Divider>

                    <Form.Item name="header_text" label="Header Text">
                        <TextArea rows={2} placeholder="Text to appear at the top of quotation" />
                    </Form.Item>

                    <Form.Item name="footer_text" label="Footer Text">
                        <TextArea rows={2} placeholder="Text to appear at the bottom" />
                    </Form.Item>

                    <Form.Item name="terms_conditions" label="Terms & Conditions">
                        <TextArea rows={3} placeholder="Enter terms and conditions" />
                    </Form.Item>

                    <Form.Item name="additional_notes" label="Additional Notes">
                        <TextArea rows={2} placeholder="Any additional notes or disclaimers" />
                    </Form.Item>

                    <Divider>Display Options</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="show_company_logo"
                                label="Show Company Logo"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="show_item_images"
                                label="Show Item Images"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="is_default"
                                label="Set as Default Template"
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Status" initialValue="active">
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Styling (Optional)</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="font_family"
                                label="Font Family"
                                initialValue="Helvetica"
                            >
                                <Select>
                                    <Option value="Helvetica">Helvetica</Option>
                                    <Option value="Times">Times New Roman</Option>
                                    <Option value="Courier">Courier</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="primary_color"
                                label="Primary Color"
                                initialValue="#000000"
                            >
                                <Input type="color" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saveMutation.isPending}
                            >
                                {editingTemplate ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PdfTemplates;
