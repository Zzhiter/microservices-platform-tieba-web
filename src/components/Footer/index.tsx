import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'buaa-soft',
  });

  // const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${2023} ${defaultMessage}`}
      links={[
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/Zzhiter/microservices-platform-tieba',
          blankTarget: true,
        },
        {
          key: 'beian',
          title: 'buaa',
          href: 'https://beian.miit.gov.cn/',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
