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
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { mockDataProvider } from "./providers/mockDataProvider";
import { SampleClassList } from "./pages/sample-classes";
import { SampleList } from "./pages/samples";
import { TrainingJobList } from "./pages/training-jobs";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={mockDataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                resources={[
                  {
                    name: "sample-classes",
                    list: "/sample-classes",
                    meta: {
                      label: "类别统计",
                    },
                  },
                  {
                    name: "samples",
                    list: "/samples",
                    meta: {
                      label: "样本管理",
                    },
                  },
                  {
                    name: "training-jobs",
                    list: "/training-jobs",
                    meta: {
                      label: "训练任务",
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
                      element={<NavigateToResource resource="sample-classes" />}
                    />
                    <Route path="/sample-classes">
                      <Route index element={<SampleClassList />} />
                    </Route>
                    <Route path="/samples">
                      <Route index element={<SampleList />} />
                    </Route>
                    <Route path="/training-jobs">
                      <Route index element={<TrainingJobList />} />
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
