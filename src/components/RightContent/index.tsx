import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';
import { useModel } from 'umi';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <span
        className={styles.action}
        onClick={() => {
          // window.open('https://www.kancloud.cn/zlt2000/microservices-platform');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      <span
        className={styles.action}
        onClick={() => {
          // window.open('https://github.com/zlt2000/microservices-platform');
        }}
      >
        <GithubOutlined />
      </span>
      <AvatarDropdown menu />
    </Space>
  );
};
export default GlobalHeaderRight;
