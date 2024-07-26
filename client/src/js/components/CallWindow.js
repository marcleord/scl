/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import { Button, Heading, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react';
import { FaBeer, FaCameraRetro, FaMicrophone, FaMicrophoneSlash, FaPhoneAlt, FaPhoneSlash, FaUndo, FaVideo, FaVideoSlash } from 'react-icons/fa';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall, shareLocationAsync }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [videoFocus, setVideoFocus] = useState('localVideo');
  const [isFullScreen, setFullScreen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("user") // "users", "environment"

  function regularLocationSharing() {
    setTimeout(() => {
      console.log("Gonna SHaring ")
      if(!peerSrc) {
        console.log("------------------------------ NO PEER SRC")
        return
      }

      shareLocationAsync()
      .then((newStatus) => {
        console.log("After sent previous, status = ", newStatus)
      })
      .catch(err => {
        console.log("ERROR sent previous, status = ", newStatus)
        console.error(err)
      })
    }, 10000);
  }

  useEffect(() => {
    console.log("useEffect")
    if (peerVideo.current && peerSrc) {
      console.log("Yes got new peer ", peerSrc)
      peerVideo.current.srcObject = peerSrc;
    }
    else console.log("UNSET PEER SRC")
    if (localVideo.current && localSrc) {
      console.log("Yes got new local ", localSrc)
      localVideo.current.srcObject = localSrc;
    } 
    else console.log("UNSET LOCAL SRC")
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }

    const intervalID = setInterval(() => {
      regularLocationSharing()
    }, 10000);

    return () => clearInterval(intervalID)

  });

  /**
   * Turn on/off a media device
   * @param {'Audio' | 'Video'} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'Video') {
      setVideo(!video);
    }
    if (deviceType === 'Audio') {
      setAudio(!audio);
    }
    mediaDevice.toggle(deviceType);
  };


  if(!peerSrc) return (
    <div className="w-full h-full flex flex-col justify-between px-6 py-4">
    <div></div>
      (
        <VStack className='w-full'>
          <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
              className='w-36 self-center'
              />
          <Heading className='text-2xl'>S.O.S</Heading>
          <Spinner size='md' />
          {/* <Progress value={20} className="" /> */}
          <Text className="text-center">Nous vous mettons en contact avec un agent disponible</Text>
        </VStack>
      )
    <div></div>
  </div>
  )

  return (
    <div className="bg-black h-screen w-full"
    >
      <video id="peerVideo" ref={peerVideo} autoPlay
        className={`border-1 border-white ${videoFocus === 'peerVideo' ? 'h-full' : 'fixed bottom-36 right-4 w-48 rounded-xl'} `}
        onClick={() => videoFocus === 'peerVideo' && setFullScreen(prev => !prev)}
        draggable={videoFocus === 'localVideo'} 
        onDragOver={event => {
          if(videoFocus === 'peerVideo' && localVideo.current) {
            if(event.pageX > 100 && event.pageX < window.innerWidth - 150 && event.pageY > 60) {
              localVideo.current.style.left = event.pageX + "px"
              localVideo.current.style.top = event.pageY + "px"
            }

          }
        }}
        />
      <video id="localVideo" ref={localVideo} autoPlay muted
        className={`border-1 border-white ${videoFocus === 'localVideo' ? 'h-full' : 'fixed bottom-36 right-4 w-48 rounded-xl'} `}
        onClick={() => videoFocus === 'localVideo' && setFullScreen(prev => !prev)}
        draggable={videoFocus === 'peerVideo'}
        onDragOver={event => {
          if(videoFocus === 'localVideo' && localVideo.current) {
            if(event.pageX > 10 && event.pageY > 10) {
              peerVideo.current.style.left = event.pageX + "px"
              peerVideo.current.style.top = event.pageY + "px"
            }

          }
        }}
      />

      {
        !isFullScreen && (
          <div className={`video-control fixed bottom-10 left-10 pr-16 flex w-full justify-between`} >            
            <Button
                  key="btnEnd"
                  // disabled={!audio}
                  onClick={() => endCall(true)}
                  rounded="full"
                  w="50px" h="50px"
                  bg='red.400'
                  className='bg-red-500 rounded-full'
            >{<FaPhoneSlash size="25px" color="white" />}</Button>


            <HStack>
              {/* <Button
                  key="btnUpdateCameraFacing"
                  disabled={!audio}
                  onClick={() => {
                    cameraFacingMode === "user" ? setCameraFacingMode("environment") : setCameraFacingMode("user")
                    mediaDevice.updateCamera({ facingMode: cameraFacingMode })
                  }}
                  rounded="full"
                  w="50px" h="50px"
                  bg='white'
                  borderWidth={1} borderColor={"green"}
              ><FaUndo size="25px" color="green" /></Button> */}

              <Button
                  key="btnAudio"
                  disabled={!audio}
                  onClick={() => toggleMediaDevice('Audio')}
                  rounded="full"
                  w="50px" h="50px"
                  bg={audio ? 'green.400' : 'red.400'}
              >{audio ? <FaMicrophone size="25px" color="white" /> : <FaMicrophoneSlash size="25px" color="white" />}</Button>
              <Button
                  key="btnVideo"
                  disabled={!video}
                  onClick={() => toggleMediaDevice('Video')}
                  rounded="full"
                  w="50px" h="50px"
                  bg={audio ? 'green.400' : 'red.400'}
              >{video ? <FaVideo size="25px" color="white" /> : <FaVideoSlash size="25px" color="white" />}</Button>
            </HStack>
          </div>
        )
      }
    </div>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;
