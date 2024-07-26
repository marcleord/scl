/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Heading, HStack, Image, Spacer, Spinner, Text, VStack } from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
// import { ChevronDownIcon } from '@tabler/icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FaBeer, FaCameraRetro, FaMicrophone, FaMicrophoneSlash, FaPhoneAlt, FaPhoneSlash, FaUndo, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { MapContainer as Map, TileLayer, FeatureGroup, Polygon as PolygonShape, Marker, Polyline, Popup } from "react-leaflet";
import LocationMarker from "../components/LocationMarker";

function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall, startCall, rejectCall, peerLocation }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const mapRef = useRef(null);
  const [video, setVideo] = useState(Boolean(config.video));
  const [audio, setAudio] = useState(Boolean(config.audio));
  const [myLocation, setLocation] = useState(null)

  useEffect(() => {
    if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
  });

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }
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

  const getGeoLocation = async () => {
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

  console.log("myLocation ", myLocation, " peerLocation ", peerLocation)
  useEffect(() => {
	getGeoLocation()
	.then(res => {
		setLocation(res)
	})

  }, [setLocation])

  console.log("------- INSIDE CallWindow status ", status)
  // console.log("INSIDE CallWindow  peerSrc ", peerSrc)
  // console.log("INSIDE CallWindow  localSrc ", localSrc)
  return (
    <>
      {
        status === 'request'  && (
          <HStack className="w-full h-[50px] px-6  border-1 border-slate-300">
            <Heading>Demande d'assistance</Heading>
            <Spacer />
            <HStack>
                <Button
                  colorScheme='red'
                  variant={'outline'}
                  onClick={startCall}
                  className='border-2 rounded-lg hover:bg-slate-200 px-4 py-2'
                >Accepter</Button>
            </HStack>
          </HStack>
        )
      }
     {
        (peerSrc || localSrc) && (
          <Accordion allowMultiple >
            <AccordionItem  className='rounded-lg'>
              <h2>
                <AccordionButton flexDir={'column'}  w='100%' >
                  <Box  className='h-[60px] w-full py-2 px-4 text-xl text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg'  flex='1' textAlign='center'  >
                      Assistance en cours
                    </Box>
                    <Text>Cliquez pour agrandir </Text>
                    <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                  <div className="" >
                    <div className="w-full flex flex-col">
                        <div className="w-full">
                            <video id="peerVideo" ref={peerVideo} autoPlay className='border-1 w-full bg-black' />
                            <HStack  spacing={30} className="justify-between">
                                <video id="localVideo" ref={localVideo} autoPlay muted className='border-1 w-36 bg-black' />

                                <HStack>
                                  <Button
                                      key="btnAudio"
                                      disabled={!audio}
                                      onClick={() => toggleMediaDevice('Audio')}
                                      className={`w-12 h-12 border-2 rounded-full ${audio ?  "bg-green-500" : "bg-red-500"}`}

                                  >{audio ? <FaMicrophone size="25px" color="white" /> : <FaMicrophoneSlash size="25px" color="white" />}</Button>
                                  <Button
                                      key="btnVideo"
                                      disabled={!audio}
                                      onClick={() => toggleMediaDevice('Video')}
                                      className={`w-12 h-12 border-2 rounded-full ${video ?  "bg-green-500" : "bg-red-500"}`}
                                  >{audio ? <FaVideo size="25px" color="white" /> : <FaVideoSlash size="25px" color="white" />}</Button>
                                </HStack>
                                
                                <Button
                                      key="btnEnd"
                                      disabled={!audio}
                                      onClick={() => endCall(true)}
                                      className='w-12 h-12 border-2 border-red-600 rounded-full bg-red-600'
                                >
                                  {<FaPhoneSlash size="25px" color="white" />}
                                </Button>

                            </HStack>

                        </div>
                      
                        <div className="w-full flex justify-start rounded-md">
                            <Map
                              // className="w-full h-[500px] md:mr-[60px]"
                              style={{
                                width: "70%",
                                height: "450px"
                              }}
                              zoom={17}
                              center={[-5.5151, 4.261651]}
                              ref={mapRef}
                              scrollWheelZoom
                              whenReady={() => {
                                console.log("################################# INSIDE READY MAP ", myLocation, peerLocation)
                                function fitMapBound() {
                                    let coords = []
                                    if(myLocation) coords.push([ myLocation.latitude, myLocation.longitude ])
                                    if(peerLocation) coords.push([ peerLocation.latitude, peerLocation.longitude ])
                                    console.log("FIT bounds around ", coords)
                                    if(coords.length > 0) {
                                    console.log("mapRef.current ", mapRef.current?.fitBounds, mapRef.current)
                                    if(!mapRef.current)  {
                                      return setTimeout(() => {
                                        fitMapBound()
                                      }, 2000);
                                    } else mapRef.current.fitBounds(coords)
                                  }
                                }
                                fitMapBound()
                              }}

                            >
                              <TileLayer
                                url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
                                accessToken={"pk.eyJ1IjoibS16b21hZGktYnl0ZS1vcHMteHl6IiwiYSI6ImNseWZ4N2EwMzA0MjMyaXM1cWtsZGJtdnkifQ.tTpfEVHbstMSA5-_UfKiTg"}
                                id="mapbox/satellite-streets-v12"
                              />
                              {
                                peerLocation && (
                                  <LocationMarker latitude={peerLocation.latitude} 
                                    longitude={peerLocation.longitude}
                                    text="L'appelant"
                                    draggable={false}
                                    customIcon
                                  />
                                )
                              }
                              {
                                myLocation && (
                                  <LocationMarker 
                                    latitude={myLocation.latitude} 
                                    longitude={myLocation.longitude}
                                    text="Moi"
                                    draggable={false}
                                  />
                                )
                              }
                            </Map>
                            <div className=''>
                              {
                                !peerLocation ? (
                                  <div className='flex flex-col mt-14 text-xl'>
                                    <Spinner size="xl"  className='self-center'/>
                                    <Text>Récupération de la position de l'appelant...</Text>
                                  </div>
                                ) : (
                                  !myLocation && (
                                    <div className='flex flex-col mt-14 text-xl'>
                                      <Spinner size="xl"  className='self-center'/>
                                      <Button onClick={() => getGeoLocation().then(setLocation)} >Autoriser la géolocalisation</Button>
                                    </div>
                                  )
                                )
                              }

                              <div className='mt-4'>
                                  <HStack>
                                    <Image src="/common-marker.png" 
                                      className={`w-8 ${myLocation && 'cursor-pointer'}`} 
                                      onClick={() => myLocation && mapRef.current?.fitBounds([ [myLocation.latitude, myLocation.longitude] ])}
                                    />
                                    <Text>Ma position</Text>
                                    { !myLocation && <Spinner boxSize="20px" /> }
                                  </HStack>
                                  <HStack>
                                    <Image src="/marker.png" 
                                      className={`w-8 mt-4 ${peerLocation && 'cursor-pointer'}`} 
                                      onClick={() => peerLocation && mapRef.current?.fitBounds([ [peerLocation.latitude, peerLocation.longitude] ])}
                                      />
                                    <Text>La position de l'appelant</Text>
                                    { !peerLocation && <Spinner boxSize="20px" /> }
                                  </HStack>
                              </div>
                            </div>

                        </div>

                    </div>
                  </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
     }
    </>
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
