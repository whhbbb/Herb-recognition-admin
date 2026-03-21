import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { mockDataProvider } from "./providers/mockDataProvider";

// 导入已有页面
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";

// 导入新增页面
import {
  HerbCreate,
  HerbEdit,
  HerbList,
  HerbShow,
} from "./pages/herbs/index";
import {
  FeedbackList,
  FeedbackShow,
} from "./pages/feedbacks/index";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                // 替换为你真实的后端地址，例如 http://localhost:3000
                dataProvider={mockDataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                resources={[
                  {
                    name: "herbs",
                    list: "/herbs",
                    create: "/herbs/create",
                    edit: "/herbs/edit/:id",
                    show: "/herbs/show/:id",
                    meta: {
                      label: "中草药管理",
                      canDelete: true,
                    },
                  },
                  {
                    name: "feedbacks",
                    list: "/feedbacks",
                    show: "/feedbacks/show/:id",
                    meta: {
                      label: "AI识别反馈",
                    },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: {
                      canDelete: true,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "6UeWsY-GlxS89-a7Rpuc",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ThemedLayout
                        Header={() => <Header sticky />}
                        Sider={(props) => <ThemedSider {...props} fixed />}
                      >
                        <Outlet />
                      </ThemedLayout>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="herbs" />}
                    />
                    {/* Herbs 路由 */}
                    <Route path="/herbs">
                      <Route index element={<HerbList />} />
                      <Route path="create" element={<HerbCreate />} />
                      <Route path="edit/:id" element={<HerbEdit />} />
                      <Route path="show/:id" element={<HerbShow />} />
                    </Route>
                    {/* Feedbacks 路由 */}
                    <Route path="/feedbacks">
                      <Route index element={<FeedbackList />} />
                      <Route path="show/:id" element={<FeedbackShow />} />
                    </Route>
                    {/* Categories 路由 */}
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;