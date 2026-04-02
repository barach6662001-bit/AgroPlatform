import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import s from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...items.map((item) =>
      item.path
        ? { title: <Link to={item.path}>{item.label}</Link> }
        : { title: item.label },
    ),
  ];

  return (
    <Breadcrumb
      className={s.text13}
      items={breadcrumbItems}
    />
  );
}
