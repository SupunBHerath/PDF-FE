import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Button,
    theme,
    Typography,
} from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    HistoryOutlined,
    TeamOutlined,
    BankOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FileProtectOutlined,
} from '@ant-design/icons';
import useAuthStore from '@/store/authStore';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    // Navigation menu items
    const getMenuItems = () => {
        const items = [
            {
                key: '/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => navigate('/dashboard'),
            },
        ];

        // Admin-only items
        if (isAdmin()) {
            items.push(
                {
                    key: '/companies',
                    icon: <BankOutlined />,
                    label: 'Companies',
                    onClick: () => navigate('/companies'),
                },
                {
                    key: '/users',
                    icon: <TeamOutlined />,
                    label: 'Users',
                    onClick: () => navigate('/users'),
                }
            );
        }

        // Company user items
        items.push(
            {
                key: '/items',
                icon: <ShoppingOutlined />,
                label: 'Items',
                onClick: () => navigate('/items'),
            },
            {
                key: '/quotations',
                icon: <FileTextOutlined />,
                label: 'Quotations',
                onClick: () => navigate('/quotations'),
            },
            // {
            //     key: '/pdf-templates',
            //     icon: <FileProtectOutlined />,
            //     label: 'PDF Templates',
            //     onClick: () => navigate('/pdf-templates'),
            // }
        );

        return items;
    };

    // Get current path for menu selection
    const getCurrentPath = () => {
        const path = location.pathname;
        if (path.startsWith('/quotations')) return '/quotations';
        if (path.startsWith('/items')) return '/items';
        if (path.startsWith('/companies')) return '/companies';
        if (path.startsWith('/users')) return '/users';
        if (path.startsWith('/history')) return '/history';
        if (path.startsWith('/pdf-templates')) return '/pdf-templates';
        return path;
    };

    return (
        <Layout className={`main-layout ${collapsed ? 'collapsed' : ''}`}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="main-sider"
                width={250}
            >
                <div className="logo">
                    <FileTextOutlined style={{ fontSize: 24 }} />
                    {!collapsed && <span>PDF System</span>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[getCurrentPath()]}
                    items={getMenuItems()}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div className="header-right">
                        <Text>
                            Welcome, <strong>{user?.name}</strong>
                        </Text>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Avatar
                                style={{
                                    backgroundColor: '#3b82f6',
                                    cursor: 'pointer',
                                    marginLeft: 16,
                                }}
                                icon={<UserOutlined />}
                            />
                        </Dropdown>
                    </div>
                </Header>
                <Content className="main-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
