import React, { Component } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';

const getGeoLocation = async () => {
  console.log("INSIDE getGeoLocation() ")
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          function (position) {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              console.log("resolved ", { latitude, longitude })
      resolve({ latitude, longitude })
          },
          function () {
            reject("Permission de Géolocalisation non accordée !")
            alert("Permission de Géolocalisation non accordée !")
          }
    );
    }  else {
      reject("Geolocation is not supported by this browser.")
      alert("Geolocation is not supported by this browser.");
    }
  })
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      socketID: null,
      lastCoordinates: null
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.shareLocationAsync = this.shareLocation.bind(this);
    this.initLocationHandler = this.initLocation.bind(this);
  }

  componentDidMount() {
    socket
      .on('request', ({ from: callFrom }) => {
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .on('init', ({ id }) => {
        this.setState({ socketID: id });
        document.title = `${id} - VideoCall`;
        console.log("my user-id is ", id)
      })
      .emit('init');

      setTimeout(() => {
        
      }, 1000);
  }

  initLocation () {
    getGeoLocation()
    .then((coords) => this.setState(coords) )
    .catch((err) => this.initLocationHandler() )
  }

  startCall(isCaller, friendID, config) {
    this.setState({ callModal: 'active' });
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller);
  }

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) {
      this.pc.stop(isStarter);
    }
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: 'ended',
      callModal: 'ended',
      localSrc: null,
      peerSrc: null
    });
  }

  shareLocation() {
    const context = this
    console.log("Inside func shareLocation ", this.state)
    return new Promise((resolve, reject) => {
      getGeoLocation()
      .then(
        res => {
          const payload = { ...res, userID: context.state.socketID }
          console.log("Payload ", payload)
          socket.emit('share-location', payload);
          resolve(this.state.callModal)
          console.log("Shared to server")
        }
      )
      .catch(reject)
    })
  }

  render() {
    const { callFrom, callModal, callWindow, localSrc, peerSrc, socketID } = this.state;
    return (
      <div className='w-screen h-screen flex justify-center'>
        <MainWindow startCall={this.startCallHandler}
          // startCall={this.startCallHandler} 
          callStatus={callModal}
          shareLocationAsync={this.shareLocationAsync}
          clientID={socketID}
          friendID={"agent"}
        />
        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
            shareLocationAsync={this.shareLocationAsync}
          />
        )}
        { false && <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={callFrom}
          
        />}
      </div>
    );
  }
}

export default App;
