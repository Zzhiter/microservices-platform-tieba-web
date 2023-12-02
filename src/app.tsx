import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import {
  AppstoreOutlined,
  MenuOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  CaretDownFilled,
  CrownOutlined,
} from '@ant-design/icons';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import { Divider, Dropdown, Menu, Space } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser, fetchMenuData } from './services/login/api';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// 详情看：https://v3.umijs.org/zh-CN/plugins/plugin-layout

/** 获取用户信息比较慢的时候会展示一个 loading */
// https://pro.ant.design/zh-CN/config/runtime-api#initialstateconfig
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
// 这是默认的，umi提供的针对antd-pro的插件
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      // TODO
      return msg.datas;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />, // antd-pro默认的
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    // 页面切换时触发	
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
          // <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          //   <LinkOutlined />
          //   <span>OpenAPI 文档</span>
          // </Link>,
          // <Link to="/~docs" key="docs">
          //   <BookOutlined />
          //   <span>业务组件文档</span>
          // </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    
    // 参考：https://beta-pro.ant.design/docs/advanced-menu-cn
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?.userId,
      },
      request: async () => {
        // initialState.currentUser 中包含了所有用户信息
        const menuData = await fetchMenuData();

        const mapIcon = (css: string | undefined) => {
          switch (css) {
            case 'layui-icon-set':
              return <SettingOutlined />;
            case 'layui-icon-friends':
              return <UserOutlined />;
            case 'layui-icon-user':
              return <TeamOutlined />;
            case 'layui-icon-menu-fill':
              return <MenuOutlined />;
            default:
              return <AppstoreOutlined />;
          }
        };

        const mapMenu = (value: API.Menu[]): MenuDataItem[] => {
          return value.map((item) => {
            return {
              key: item.id + '',
              name: item.name,
              locale: false,
              path:
                item.path?.endsWith('.html') || item.path?.startsWith('http')
                  ? item.path
                  : undefined,
              icon: mapIcon(item.css),
              children: item.subMenus && mapMenu(item.subMenus),
            };
          });
        };
        const menus = mapMenu(menuData);
        return [
          { key: 'welcome', name: ' 首页', path: '/welcome', icon: <CrownOutlined /> },
          ...menus,
        ];
      },
    },
    headerContentRender: () => {
      return (
        <Space>
          {/* <Divider type="vertical" />
          <Dropdown
            placement="top"
            overlay={
              <Menu
                items={[
                  {
                    key: '1',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.kancloud.cn/zlt2000/microservices-platform/936235"
                      >
                        项目更新日志
                      </a>
                    ),
                  },
                  {
                    key: '2',
                    label: (
                      <a target="_blank" rel="noopener noreferrer" href="https://zlt2000.gitee.io/">
                        个人博客
                      </a>
                    ),
                  },
                  {
                    key: '3',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://gitee.com/zlt2000/"
                      >
                        个人公众号
                      </a>
                    ),
                  },
                  {
                    key: '4',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://gitbook.cn/gitchat/author/5b2362320398d50d7b7ab29e"
                      >
                        GitChat
                      </a>
                    ),
                  },
                  {
                    key: '5',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.aliyun.com/minisite/goods?userCode=dickv1kw&share_source=copy_link"
                      >
                        阿里云优惠
                      </a>
                    ),
                  },
                  {
                    key: '6',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://cloud.tencent.com/act/cps/redirect?redirect=1074&cps_key=5516bbd5876cd224d90bd41d53d3f7fe&from=console"
                      >
                        腾讯云优惠
                      </a>
                    ),
                  },
                  {
                    key: '7',
                    label: (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://activity.huaweicloud.com/discount_area_v5/index.html?fromacct=a87e1945-e6c4-4e04-bb43-e0472a54e454&utm_source=V1g3MDY4NTY=&utm_medium=cps&utm_campaign=201905"
                      >
                        华为云优惠
                      </a>
                    ),
                  },
                ]}
              />
            }
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space size="small">
                相关链接
                <CaretDownFilled />
              </Space>
            </a>
          </Dropdown> */}
        </Space>
      );
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

const authHeaderInterceptor = (url: string, options: RequestConfig) => {
  const accessToken = sessionStorage.getItem('access_token');
  const authHeader = {};
  if (accessToken && !url.includes('/api-uaa/oauth/token')) {
    authHeader.Authorization = `Bearer ${accessToken}`;
  }
  const newHeaders = { ...options.headers, ...authHeader };
  return {
    url,
    options: { ...options, interceptors: true, headers: newHeaders },
  };
};

const unauthorizedInterceptor = (response: Response) => {
  if (response.status === 401) {
    const { location } = history;
    // 如果没有登录，重定向到 login
    if (location.pathname !== loginPath) {
      history.push(loginPath);
    }
  }
  return response;
};

export const request: RequestConfig = {
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor], // 请求拦截器数组。在请求发送前会执行这些拦截器，这里包含了 authHeaderInterceptor，它是一个用于在请求中自动添加 AccessToken 的拦截器。
  responseInterceptors: [unauthorizedInterceptor], // 响应拦截器数组。在收到响应后会执行这些拦截器，这里包含了 unauthorizedInterceptor，可能用于处理未授权的响应。
  errorConfig: { // 错误适配器（adaptor），用于对错误信息进行处理。在这个例子中，它简单地将错误信息的结构进行了修改，并添加了一个默认的错误消息。
    adaptor: (resData) => {
      return {
        ...resData,
        errorMessage: '请求错误',
      };
    },
  },
};