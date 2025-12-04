import { Layout, Row, Col, Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import './AuthLayout.css';

const { Content } = Layout;

const AuthLayout = ({ children }) => {
    return (
        <Layout className="auth-layout">
            <Content className="auth-content">
                <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
                    <Col xs={22} sm={18} md={12} lg={8} xl={6}>
                        <div className="auth-header">
                            <FileTextOutlined className="auth-logo" />
                            <h1>PDF Management System</h1>
                            <p>Multi-Company Quotation & Item Management</p>
                        </div>
                        <Card className="auth-card">{children}</Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default AuthLayout;
