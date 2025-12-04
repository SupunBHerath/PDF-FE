import { Card, Typography, Descriptions, Button, Space, Tag } from 'antd';
import { DownloadOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const QuotationDetail = () => {
    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Quotation Details</Title>
                <Space>
                    <Button icon={<DownloadOutlined />}>Download PDF</Button>
                    <Button icon={<PrinterOutlined />}>Print</Button>
                    <Button type="primary" icon={<EditOutlined />}>Edit</Button>
                </Space>
            </div>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="Quotation #">QT-202312-0001</Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color="green">SENT</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Company">Sample Company Inc.</Descriptions.Item>
                <Descriptions.Item label="Created By">John Doe</Descriptions.Item>
                <Descriptions.Item label="Date">2023-12-15</Descriptions.Item>
                <Descriptions.Item label="Valid Until">2024-01-15</Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginTop: 24 }}>Customer Information</Title>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">ABC Corporation</Descriptions.Item>
                <Descriptions.Item label="Email">contact@abc.com</Descriptions.Item>
                <Descriptions.Item label="Phone">+1 (555) 123-4567</Descriptions.Item>
                <Descriptions.Item label="Address">123 Business St, City, State 12345</Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginTop: 24 }}>Items</Title>
            <Paragraph type="secondary">
                Full implementation shows itemized table with quantities, unit prices, and amounts.
                Includes subtotal, tax, discount, and grand total calculations.
            </Paragraph>

            <Title level={4} style={{ marginTop: 24 }}>PDF Preview</Title>
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                padding: 24,
                backgroundColor: '#fafafa',
                textAlign: 'center',
                minHeight: 400
            }}>
                <Paragraph type="secondary">
                    PDF preview would be displayed here using react-pdf or an iframe
                    showing the generated PDF quotation.
                </Paragraph>
            </div>

            <Paragraph type="secondary" style={{ marginTop: 24 }}>
                Full implementation includes PDF viewer, complete item breakdown,
                pricing summary, and action buttons for download, print, email, and edit.
            </Paragraph>
        </Card>
    );
};

export default QuotationDetail;
