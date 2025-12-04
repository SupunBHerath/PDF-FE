import { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api';
import useAuthStore from '@/store/authStore';

const Login = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const loginMutation = useMutation({
        mutationFn: authAPI.login,
        onSuccess: (response) => {
            if (response.success) {
                const { user, token } = response.data;
                setAuth(user, token);
                message.success('Login successful!');
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            message.error(error.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        },
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        loginMutation.mutate(values);
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Sign In</h2>
            <Form
                form={form}
                name="login"
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Email"
                        autoComplete="email"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Sign In
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>Demo Credentials</Divider>

            <div style={{ fontSize: 12, color: '#666' }}>
                <p>
                    <strong>Admin:</strong> admin@system.com / admin123
                </p>
                <p>
                    <strong>User:</strong> john@techsolutions.com / password123
                </p>
            </div>
        </div>
    );
};

export default Login;
