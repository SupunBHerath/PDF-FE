import { useState } from 'react';
import { Tabs } from 'antd';
import { AppstoreOutlined, TagsOutlined } from '@ant-design/icons';
import ItemsList from '@/components/Items/ItemsList';
import CategoriesList from '@/components/Items/CategoriesList';

const Items = () => {
    const [activeTab, setActiveTab] = useState('items');

    const items = [
        {
            key: 'items',
            label: (
                <span>
                    <AppstoreOutlined />
                    Items
                </span>
            ),
            children: <ItemsList />,
        },
        {
            key: 'categories',
            label: (
                <span>
                    <TagsOutlined />
                    Categories
                </span>
            ),
            children: <CategoriesList />,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </div>
    );
};

export default Items;
