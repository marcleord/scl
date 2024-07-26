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
import { BlogPostList, BlogPostCreate, BlogPostEdit, BlogPostShow } from "./pages/blog-posts";
import { CategoryList, CategoryCreate, CategoryEdit, CategoryShow } from "./pages/categories";
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

class SocketWrapper extends Component {
    constructor() {
        super();
        this.state = {
          callWindow: '',
          callModal: '',
          callFrom: '',
          localSrc: null,
          peerSrc: null,
          socketID: null,
          peerLocation: null
        };
        this.pc = {};
        this.config = null;
        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);
      }
    
      componentDidMount() {
        console.log("Mounted authenticated")
        supabaseClient.auth.getSession()
          .then(session => {
            if(session.data) {
              console.log("session ", session)
              socket
              .on('request', ({ from: callFrom }) => {
                  this.setState({ callModal: 'request', callFrom });
                  console.log("Update callModal to request ")
                  // this.startCallHandler(false, callFrom, { audio: true, video: true })
                })
                .on('maganak', ({ from: callFrom }) => {
                  console.log("Got managk")
                  this.config = { audio: true, video: true }
                  this.setState({ callModal: 'request', callFrom });
                  // this.startCallHandler(false, callFrom, { audio: true, video: false })
                })
                .on('caller-location', ({ latitude, longitude }) => {
                  console.log("Got caller -location ",latitude, longitude)
                  this.setState({ peerLocation: { latitude, longitude } });
                })
                .on('call', (data) => {
                  console.log("ON CALL ", data)
                  if (data.sdp) {
                    this.pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') this.pc.createAnswer();
                  } else this.pc.addIceCandidate(data.candidate);
                })
                .on('reconnect', data => {
                  console.log('INSIDE RECONNECTION ', data)
                  this.endCallHandler(true)
                  setTimeout(() => {
                    console.log("STZRTING NEW CONNECTION ", this.state.callFrom, this.config)
                    this.startCallHandler(true, this.state.callFrom, { audio: true, video: false })
                  }, 1500);
                })
                .on('end', this.endCall.bind(this, false))
                .on('init-agent', ({ id }) => {
                  console.log("my user-id is ", id)
                  this.setState(prev => ({ ...prev, socketID: id }));
                  document.title = `${id} - S.O.S`;
                })
                .emit('init-agent', { userID: session.data.session?.user.id, sessionToken: session.data.session?.access_token });

            }
          })
      }
    
      startCall(isCaller, friendID, config) {
        this.setState({ callModal: 'active' });
        console.log("STATRED CALL")
        this.config = config;
        this.pc = new PeerConnection(friendID)
          .on('localStream', (src) => {
            const newState = { callWindow: 'active', localSrc: src };
            // if (!isCaller) newState.callModal = '';
            this.setState(newState);
          })
          .on('peerStream', (src) => this.setState({ peerSrc: src }))
          .start(isCaller);

          // setTimeout(() => {
          //   socket.emit("agent-maganak-accepted", { callerID: friendID, agentID: this.state.socketID })
          // }, 2000);
      }
    
      rejectCall() {
        const { callFrom } = this.state;
        socket.emit('end', { to: callFrom });
        this.setState({ callModal: '', CallWindow: '' });
      }
    
      endCall(isStarter) {
        if (_.isFunction(this.pc.stop)) {
          this.pc.stop(isStarter);
        }
        this.pc = {};
        this.config = null;
        this.setState({
          callWindow: '',
          callModal: '',
          localSrc: null,
          peerSrc: null
        });
      }

      
    render(): ReactNode {
        const { callFrom, callModal, callWindow, localSrc, peerSrc, peerLocation } = this.state;
        // console.log("this.config ", this.config,  localSrc, peerSrc, this.state)
        console.log("this.state ", this.state)
        return (
            <>
                <CallWindow
                  status={callModal}
                  localSrc={localSrc}
                  peerSrc={peerSrc}
                  config={{video: true}}
                  mediaDevice={this.pc.mediaDevice}
                  endCall={this.endCallHandler}

                  startCall={() => this.startCallHandler(false, callFrom, this.config)}
                  peerLocation={peerLocation}
                  />

                {this.props.children}

            </>
        )
    }
    
};

export default SocketWrapper;
