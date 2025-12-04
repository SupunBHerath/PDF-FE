import { Row, Col, Card, Statistic, Typography, Spin, Empty } from 'antd';
import {
    BankOutlined,
    TeamOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { companyAPI, userAPI, itemAPI, quotationAPI } from '@/api';
import useAuthStore from '@/store/authStore';

const { Title } = Typography;

const Dashboard = () => {
    const { user, isAdmin } = useAuthStore();

    // Fetch dashboard stats based on role
    const { data: companiesData, isLoading: loadingCompanies } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyAPI.getAll({}),
        enabled: isAdmin(),
        retry: false,
    });

    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => userAPI.getAll({}),
        enabled: isAdmin(),
        retry: false,
    });

    // Items are now global, no company_id needed
    const { data: itemsData, isLoading: loadingItems } = useQuery({
        queryKey: ['items-count'],
        queryFn: () => itemAPI.getAll({ limit: 1000 }),
        retry: false,
    });

    const { data: quotationsData, isLoading: loadingQuotations } = useQuery({
        queryKey: ['quotations-count'],
        queryFn: () => quotationAPI.getAll({ limit: 1000 }),
        retry: false,
    });

    const loading =
        loadingCompanies || loadingUsers || loadingItems || loadingQuotations;

    // Calculate stats
    const stats = {
        companies: companiesData?.data?.pagination?.total || 0,
        users: usersData?.data?.pagination?.total || 0,
        items: itemsData?.data?.pagination?.total || 0,
        quotations: quotationsData?.data?.pagination?.total || 0,
        acceptedQuotations:
            quotationsData?.data?.quotations?.filter((q) => q.status === 'accepted')
                .length || 0,
        totalRevenue:
            quotationsData?.data?.quotations
                ?.filter((q) => q.status === 'accepted')
                .reduce((sum, q) => sum + parseFloat(q.total || 0), 0) || 0,
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>
                Welcome back, {user?.name}!
            </Title>
            <p style={{ marginBottom: 24, color: '#666' }}>
                Here's an overview of your {isAdmin() ? 'system' : 'company'} activity.
            </p>

            <Row gutter={[16, 16]}>
                {isAdmin() && (
                    <>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Companies"
                                    value={stats.companies}
                                    prefix={<BankOutlined />}
                                    valueStyle={{ color: '#3b82f6' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Users"
                                    value={stats.users}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#8b5cf6' }}
                                />
                            </Card>
                        </Col>
                    </>
                )}

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Items"
                            value={stats.items}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Quotations"
                            value={stats.quotations}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#f59e0b' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Accepted Quotations"
                            value={stats.acceptedQuotations}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card title="Your Companies">
                        {user?.companies && user.companies.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {user.companies.map((company) => (
                                    <Col xs={24} sm={12} md={8} key={company.id}>
                                        <Card
                                            size="small"
                                            hoverable
                                            style={{
                                                borderColor:
                                                    company.status === 'active' ? '#10b981' : '#ef4444',
                                            }}
                                        >
                                            {company.logo && (
                                                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                                                    <img
                                                        src={company.logo}
                                                        alt={company.name}
                                                        style={{
                                                            maxWidth: '100px',
                                                            maxHeight: '60px',
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <Title level={5}>{company.name}</Title>
                                            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                                                {company.email}
                                            </p>
                                            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                                                {company.phone}
                                            </p>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="No companies assigned" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
