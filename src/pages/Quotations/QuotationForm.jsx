import { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Form,
    Input,
    Select,
    Button,
    Space,
    Table,
    InputNumber,
    message,
    Row,
    Col,
    Divider,
    Tag,
    Alert,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    FileTextOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyAPI, itemAPI, quotationAPI } from '@/api';
import useAuthStore from '@/store/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QuotationForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAdmin } = useAuthStore();

    const [selectedItems, setSelectedItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);

    // Get user's companies
    const userCompanies = user?.companies || [];
    const companyIds = userCompanies.map((c) => c.id);

    // Fetch companies (admin sees all, users see assigned)
    const { data: companiesData } = useQuery({
        queryKey: ['companies-for-quotation'],
        queryFn: () => companyAPI.getAll({}),
        enabled: isAdmin(),
    });

    const availableCompanies = isAdmin()
        ? (companiesData?.data?.companies || companiesData?.data || [])
        : (userCompanies || []);

    // Fetch all items
    const { data: itemsData } = useQuery({
        queryKey: ['items-for-quotation'],
        queryFn: () => itemAPI.getAll({ limit: 1000, status: 'active' }),
    });

    const items = itemsData?.data?.items || [];

    // Create quotation mutation
    const createQuotationMutation = useMutation({
        mutationFn: quotationAPI.create,
        onSuccess: async () => {
            message.success('Quotation created successfully!');
            await queryClient.invalidateQueries(['quotations']);
            setTimeout(() => navigate('/quotations'), 100);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to create quotation');
        },
    });

    // Calculate totals
    useEffect(() => {
        const newSubtotal = selectedItems.reduce((sum, item) => {
            return sum + (item.price || 0) * (item.quantity || 0);
        }, 0);
        setSubtotal(newSubtotal);

        const taxRate = form.getFieldValue('tax_rate') || 0;
        const discount = form.getFieldValue('discount') || 0;
        const tax = (newSubtotal * taxRate) / 100;
        const newTotal = newSubtotal + tax - discount;
        setTotal(Math.max(0, newTotal));
    }, [selectedItems, form]);

    // Handle item selection
    const handleItemSelect = (itemId, index) => {
        const selectedItem = items.find((i) => i.id === itemId);
        if (selectedItem) {
            const newItems = [...selectedItems];
            newItems[index] = {
                item_id: itemId,
                name: selectedItem.name,
                unit_type: selectedItem.unit_type,
                registered_price: selectedItem.unit_price,
                price: selectedItem.unit_price,
                quantity: 1,
            };
            setSelectedItems(newItems);
        }
    };

    // Handle price change
    const handlePriceChange = (value, index) => {
        const item = selectedItems[index];
        if (value >= item.registered_price) {
            const newItems = [...selectedItems];
            newItems[index].price = value;
            setSelectedItems(newItems);
        } else {
            message.warning(
                `Price cannot be less than registered price (LKR ${item.registered_price})`
            );
        }
    };

    const handleQuantityChange = (value, index) => {
        const newItems = [...selectedItems];
        newItems[index].quantity = value;
        setSelectedItems(newItems);
    };

    const addItem = () => {
        setSelectedItems([...selectedItems, {}]);
    };

    const removeItem = (index) => {
        const newItems = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(newItems);
    };

    // Submit handler
    const handleSubmit = async (values) => {
        if (selectedItems.length === 0) {
            message.warning('Please add at least one item');
            return;
        }

        const validItems = selectedItems.filter((item) => item.item_id);
        if (validItems.length === 0) {
            message.warning('Please select items');
            return;
        }

        const quotationData = {
            ...values,
            subject: values.subject,
            signatory_name: values.signatory_name,
            signatory_phone: values.signatory_phone,
            items: validItems,
            subtotal,
            tax: (subtotal * (values.tax_rate || 0)) / 100,
            total,
            generate_pdf: false,
        };

        createQuotationMutation.mutate(quotationData);
    };

    // Table columns
    const columns = [
        {
            title: 'Item',
            key: 'item',
            width: '25%',
            render: (_, record, index) => (
                <Select
                    placeholder="Select item"
                    style={{ width: '100%' }}
                    value={record.item_id}
                    onChange={(value) => handleItemSelect(value, index)}
                    showSearch
                >
                    {items.map((item) => (
                        <Option key={item.id} value={item.id}>
                            {item.name}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Registered Price',
            key: 'registered_price',
            width: '15%',
            render: (_, record) =>
                record.registered_price ? (
                    <Tag color="blue">LKR {parseFloat(record.registered_price).toFixed(2)}</Tag>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Price (LKR)',
            key: 'price',
            width: '15%',
            render: (_, record, index) => (
                <InputNumber
                    min={record.registered_price || 0}
                    value={record.price}
                    onChange={(value) => handlePriceChange(value, index)}
                    style={{ width: '100%' }}
                    disabled={!record.item_id}
                />
            ),
        },
        {
            title: 'Quantity',
            key: 'quantity',
            width: '10%',
            render: (_, record, index) => (
                <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(value) => handleQuantityChange(value, index)}
                    style={{ width: '100%' }}
                    disabled={!record.item_id}
                />
            ),
        },
        {
            title: 'Unit',
            key: 'unit_type',
            width: '10%',
            render: (_, record) => record.unit_type || '-',
        },
        {
            title: 'Total',
            key: 'total',
            width: '15%',
            render: (_, record) => (
                <strong>
                    LKR {((record.price || 0) * (record.quantity || 0)).toFixed(2)}
                </strong>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (_, __, index) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(index)} />
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>
                    <FileTextOutlined /> Create Quotation
                </Title>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                label="Company"
                                name="company_id"
                                rules={[{ required: true, message: 'Please select a company' }]}
                            >
                                <Select placeholder="Select company" showSearch>
                                    {availableCompanies.map((company) => (
                                        <Option key={company.id} value={company.id}>
                                            {company.name}
                                            {!isAdmin() && (
                                                <Tag color="green" style={{ marginLeft: 8 }}>
                                                    Assigned
                                                </Tag>
                                            )}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* NEW SUBJECT SECTION */}
                    <Divider>Quotation Details</Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Subject"
                                name="subject"
                                rules={[{ required: true, message: 'Please enter the subject' }]}
                            >
                                <Input placeholder="Enter subject (ex: Supply of CCTV System)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ITEMS SECTION */}
                    <Divider>Items</Divider>

                    <Table
                        dataSource={selectedItems}
                        columns={columns}
                        pagination={false}
                        rowKey={(record, index) => index}
                        footer={() => (
                            <Button
                                type="dashed"
                                onClick={addItem}
                                icon={<PlusOutlined />}
                                block
                            >
                                Add Item
                            </Button>
                        )}
                    />


                    {/* SUMMARY */}
                    <Divider>Summary & Additional Details</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Tax Rate (%)" name="tax_rate" initialValue={0}>
                                <InputNumber
                                    min={0}
                                    max={100}
                                    style={{ width: '100%' }}
                                    onChange={() => setSelectedItems([...selectedItems])}
                                />
                            </Form.Item>

                            <Form.Item label="Discount (LKR)" name="discount" initialValue={0}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    onChange={() => setSelectedItems([...selectedItems])}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Card size="small">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Row justify="space-between">
                                        <Text>Subtotal:</Text>
                                        <Text strong>LKR {subtotal.toFixed(2)}</Text>
                                    </Row>
                                    <Row justify="space-between">
                                        <Text>Tax:</Text>
                                        <Text>
                                            LKR {((subtotal * (form.getFieldValue('tax_rate') || 0)) / 100).toFixed(2)}
                                        </Text>
                                    </Row>
                                    <Row justify="space-between">
                                        <Text>Discount:</Text>
                                        <Text>- LKR {(form.getFieldValue('discount') || 0).toFixed(2)}</Text>
                                    </Row>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Row justify="space-between">
                                        <Title level={4} style={{ margin: 0 }}>
                                            Total:
                                        </Title>
                                        <Title level={4} style={{ margin: 0 }} type="success">
                                            <DollarOutlined /> LKR {total.toFixed(2)}
                                        </Title>
                                    </Row>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Form.Item label="Notes" name="notes">
                        <TextArea rows={3} placeholder="Add any notes..." />
                    </Form.Item>

                    <Form.Item label="Terms & Conditions" name="terms">
                        <TextArea rows={3} placeholder="Add terms..." />
                    </Form.Item>
                    {/* SIGNATORY DETAILS */}
                    <Divider>Signatory Details</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Signatory Name"
                                name="signatory_name"
                                initialValue={user?.name}
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Signatory Name" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Signatory Phone"
                                name="signatory_phone"
                                initialValue={user?.phone}
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Signatory Phone" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <br />
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createQuotationMutation.isPending}
                                size="large"
                                icon={<FileTextOutlined />}
                            >
                                Generate PDF Quotation
                            </Button>
                            <Button size="large" onClick={() => navigate('/quotations')}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default QuotationForm;
