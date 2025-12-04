import { Card, Typography, Table, Tag, Button, Space, DatePicker } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const History = () => {
    const columns = [
        {
            title: 'Quotation #',
            dataIndex: 'quotation_number',
            key: 'quotation_number',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    draft: 'default',
                    sent: 'blue',
                    accepted: 'green',
                    rejected: 'red',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />}>View</Button>
                    <Button type="link" icon={<DownloadOutlined />}>PDF</Button>
                </Space>
            ),
        },
    ];

    const sampleData = [
        {
            key: '1',
            quotation_number: 'QT-202312-0001',
            company: 'Tech Solutions Inc.',
            customer: 'ABC Corp',
            amount: 5250.00,
            status: 'accepted',
            date: '2023-12-15',
        },
        {
            key: '2',
            quotation_number: 'QT-202312-0002',
            company: 'Tech Solutions Inc.',
            customer: 'XYZ Ltd',
            amount: 3800.50,
            status: 'sent',
            date: '2023-12-14',
        },
    ];

    return (
        <Card>
            <Title level={2}>Quotation History</Title>
            <Paragraph>
                View complete history of all generated quotations and PDFs. Filter by date range, company, or status.
            </Paragraph>

            <Space style={{ marginBottom: 16 }} wrap>
                <RangePicker />
                <Button>Export</Button>
            </Space>

            <Table
                columns={columns}
                dataSource={sampleData}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} quotations`,
                }}
            />

            <Paragraph type="secondary" style={{ marginTop: 24 }}>
                Full implementation includes real-time data from API, advanced filters,
                export functionality, and links to view/download each quotation PDF.
                Admins see all history, company users see only their company's history.
            </Paragraph>
        </Card>
    );
};

export default History;
