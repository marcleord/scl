import { 
    Refine,
    GitHubBanner, 
    WelcomePage,
    Authenticated, 
} from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { AuthPage,ErrorComponent
,useNotificationProvider
,ThemedLayoutV2
,ThemedSiderV2} from '@refinedev/antd';
import "@refinedev/antd/dist/reset.css";

import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp, Image, Space } from "antd"
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import routerBindings, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";
import { CallList } from "./pages/calls";
import { supabaseClient } from "./utility";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import authProvider from "./authProvider";
import { Heading, Text } from '@chakra-ui/react';
import { Component, ReactNode, useEffect, useState } from 'react';
import { socket, PeerConnection } from './communication'
import _ from 'lodash';
import CallWindow from './components/CallWindow'
import MainRouter from './MainRouter';
import SocketWrapper from './SocketWrapper';

function useClientID() {
    const [clientID, setClientID] = useState('');
  
    useEffect(() => {
      socket
        .on('init', ({ id }) => {
          setClientID(id);
          document.title = `${id} - VideoCall`;
          console.log("my user-id is ", id)
        });
    }, []);
  
    return clientID;
  }

      
function App(): ReactNode {
        return (
            <BrowserRouter>
            <RefineKbarProvider>
                <ColorModeContextProvider>
    <AntdApp>
                <DevtoolsProvider>
                    <Refine dataProvider={dataProvider(supabaseClient)}
                            liveProvider={liveProvider(supabaseClient)}
                            authProvider={authProvider}
                            routerProvider={routerBindings}
                            notificationProvider={useNotificationProvider} 
                            resources={[
                                {
                                    name: "Agent",
                                    meta: {
                                        hide: true
                                    },
                                },
                                {
                                    name: "Call",
                                    list: "/dashboard/appels",
                                    meta: {
                                        canDelete: false,
                                        label: "Mes appels"
                                    },
                                },
                            ]}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                            
                        }}
                    >
                        <Routes>
                            <Route
                                element={
                                    <Authenticated
                                        key="authenticated-inner"
                                        fallback={<CatchAllNavigate to="/login" />}
                                    >
                                                <ThemedLayoutV2
                                                    Header={Header}
                                                    Sider={(props) => <ThemedSiderV2 {...props} fixed
                                                    Title={() => <Space>
                                                            <Image src="/logo.png" width={50} />
                                                            <Text>SOS</Text>
                                                            <Text>Cam Link</Text>
                                                        </Space>}
                                                    />}
                                                    >
                                                    <SocketWrapper>
                                                        <Outlet />
                                                    </SocketWrapper>
                                                </ThemedLayoutV2>
                                    </Authenticated>
                                }
                            >
                                <Route index element={
                                        <NavigateToResource resource="blog_posts" />
                                } />
                                <Route path="/dashboard/appels">
                                    <Route index element={<CallList />} />
                                </Route>
                                <Route path="*" element={<ErrorComponent />} />
                            </Route>
                            <Route
                                element={
                                    <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                                        <NavigateToResource />
                                    </Authenticated>
                                }
                            >
                                    <Route
                                        path="/login"
                                        element={(
                                            <AuthPage
                                            title="SCL - Dashboard"
                                                type="login"
                                                formProps={{ initialValues:{  } }}
                                            />
                                        )}
                                    />
                                    <Route
                                        path="/register"
                                        element={<AuthPage type="register" />}
                                    />
                                    <Route
                                        path="/forgot-password"
                                        element={<AuthPage type="forgotPassword" />}
                                    />
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
