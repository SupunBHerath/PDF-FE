import { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Input,
    Card,
    Popconfirm,
    message,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { quotationAPI } from '@/api';
import useAuthStore from '@/store/authStore';
import dayjs from 'dayjs';
import { generateQuotationPDF } from '@/utils/pdfGenerator';

const { Search } = Input;

const QuotationList = () => {
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAdmin } = useAuthStore();

    // Fetch quotations
    const { data, isLoading } = useQuery({
        queryKey: ['quotations', searchText, page],
        queryFn: () =>
            quotationAPI.getAll({
                search: searchText || undefined,
                page,
                limit: 10,
            }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: quotationAPI.delete,
        onSuccess: () => {
            message.success('Quotation deleted successfully');
            queryClient.invalidateQueries(['quotations']);
        },
        onError: (error) => {
            message.error(error.message || 'Failed to delete quotation');
        },
    });

    const handleDelete = (record) => {
        if (record.status === 'sent' && !isAdmin()) {
            message.warning('Only administrators can delete sent quotations');
            return;
        }
        deleteMutation.mutate(record.id);
    };

    // ↓↓↓ CLIENT-SIDE PDF GENERATION ↓↓↓
    const handleDownload = async (quotationId, quotationNumber) => {
        try {
            // Fetch the full quotation details
            const quotationData = await quotationAPI.getOne(quotationId);
            const quotation = quotationData.data;
            
            // Generate PDF on the client side
            generateQuotationPDF(quotation, quotation.company);
            
            message.success('PDF generated successfully');
        } catch (error) {
            message.error('Failed to generate PDF');
            console.error('PDF generation error:', error);
        }
    };

    const columns = [
        {
            title: 'Quotation #',
            dataIndex: 'quotation_number',
            key: 'quotation_number',
            render: (text) => <strong>{text}</strong>,
            width: 150,
            fixed: 'left',
        },
        {
            title: 'Company',
            dataIndex: ['company', 'name'],
            key: 'company',
        },
        {
            title: 'Total (LKR)',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `LKR ${parseFloat(total).toFixed(2)}`,
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm'),
        },
        {
            title: 'Created By',
            dataIndex: ['user', 'name'],
            key: 'user',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 280,
            fixed: 'right',
            render: (_, record) => {
                const isDeletable = isAdmin() || record.status !== 'sent';

                return (
                    <Space size="small">
                        {/* PDF button ALWAYS visible */}
                        <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record.id, record.quotation_number)}
                        >
                            PDF
                        </Button>

                        {isDeletable ? (
                            <Popconfirm
                                title="Delete quotation?"
                                description="This action cannot be undone."
                                onConfirm={() => handleDelete(record)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        ) : (
                            <Tooltip title="Only administrators can delete sent quotations">
                                <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled>
                                    Delete
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
    ];

    const quotations = data?.data?.quotations || [];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <span>
                        Quotations History
                        {isAdmin() ? (
                            <Tag color="purple" style={{ marginLeft: 8 }}>All Quotations</Tag>
                        ) : (
                            <Tag color="blue" style={{ marginLeft: 8 }}>My Quotations</Tag>
                        )}
                    </span>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/quotations/new')}
                    >
                        New Quotation
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16 }} wrap>
                    <Search
                        placeholder="Search quotations..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={quotations}
                    rowKey="id"
                    loading={isLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: page,
                        total: data?.data?.pagination?.total,
                        pageSize: 10,
                        onChange: setPage,
                        showTotal: (total) => `Total ${total} quotations`,
                    }}
                />
            </Card>
        </div>
    );
};

export default QuotationList;
