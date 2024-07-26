import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActionButton from './ActionButton';
import { socket } from '../communication';
import { Avatar, Button, Heading, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spacer, Spinner, Text, useDisclosure, VStack } from '@chakra-ui/react';
// import { Progress } from "..//components/ui/progress"

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

function ModalCameraPermissions ({ isOpen, onGranted, onRejected }) {
  const [rejected, setRejected] = useState(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(() => {
      console.log("Perm Device granted")
      onGranted()
    })
    .catch(() => {
      console.error("Perm Device rejected")
      setRejected(true)
    })
  }, [])

  const requestCamera = () => {
    if(rejected) {
      window.location.replace(window.location.host + "/?request=true")
      // window.location.reload()
    }
    navigator.mediaDevices.getUserMedia({ video: true })
  }
  return (
    <div className='w-full flex justify-center mt-[250px]'>
      <VStack className='py-4 right-10 bg-slate-300 max-w-[480px] self-center rounded-xl'>
          <Heading color="primary" className="font-bold text-md text-center" >Permissions pour activer votre caméra</Heading>

          <VStack px="10" py="4"  >
              <HStack className="w-full justify-center">
                <FontAwesomeIcon icon={faVideo} color="red" size='2xl' />
              </HStack>

              {
                !rejected ? 
                <Text className='mt-4 text-center'>Une notification vient d'être envoyée. Acceptez pour pouvoir nous montrez l'urgence !</Text>
                :
                <Text className='mt-4 text-center text-red-500'>Permission rejetée !</Text>
              }
              {
                rejected && <Button
                  bgGradient='linear(to-r, orange, red)'
                  className="mt-8 w-full"
                  color="white"
                  onClick={requestCamera}
              >Ressayer</Button>
              }
          </VStack>

      </VStack>
    </div>
  )
}

function MainWindow({ startCall, shareLocationAsync, callStatus, requestAgent, clientID, friendID, children }) {
  const [granted, setGranted] = useState(false)
  const [requested, setRequested] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => friendID && startCall(true, friendID, config);
  };

  console.log("callStatus ", callStatus, clientID)
  console.log("req & grant ", requested, granted)
  // useMemo(() => {
  //   // if(granted && !agentSearchStatus) {
  //   //   setAgentSearchSTatus('started')
  //   //   socket
  //   //   .emit('request', { id: clientID })  
  //   // }
  //   if(granted) {
  //     requestAgent()
  //   }
  // }, [granted])

  // useMemo(() => {
  //   if(callStatus === 'ended') {
  //     setAgentID(null)
  //   }
  // }, [callStatus])

  // useEffect(() => {
  //   socket
  //   .on('response-request-for-agent', ({ agent }) => {
  //     console.log("response-request-for-agent", agent)
  //     startCall(true, agent, { audio: true, video: true })
  //     setTimeout(() => {
  //       setAgentID(agent)
  //     }, 1000);

  //     function regularLocationSharing() {
  //       setTimeout(() => {
  //         console.log("Gonna SHaring ")
  //         shareLocationAsync()
  //         .then((newStatus) => {
  //           console.log("After sent previous, status = ", callStatus, newStatus)
  //           if(callStatus === 'active' || newStatus === 'active') {
  //             regularLocationSharing()
  //           }
  //         })
  //         .catch(console.error)
  //       }, 10000);
  //     }

  //     regularLocationSharing()
  //   } )
  //   if(callStatus && !granted) {
  //     console.log("Requesting camera")
  //     setRequested(true)
  //   }
  // }, [])

  if(callStatus === 'active') return children

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 py-4">
      {/* {
          requested && !granted && <ModalCameraPermissions 
          isOpen={true}  onGranted={() => setGranted(true)} />
      } */}
      {
        granted ? (
          <>
            <div></div>
            {
              callStatus === 'reconnecting' ? (
                <VStack className='w-full'>
                  <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
                      className='w-36 self-center'
                    />
                  <Heading className='text-2xl'>S.O.S</Heading>
                  <Spinner size='md' />
                  <Text className="text-center text-blue-600 font-bold">Reconnnexion à l'appel...</Text>
                </VStack>
              ) :
              callStatus === 'ended' ? (
                <VStack className='w-full'>
                  <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
                      className='w-36 self-center'
                    />
                  <Heading className='text-2xl'>S.O.S</Heading>
                  <Text className="text-center text-green-600 font-bold">Appel terminé</Text>
                </VStack>
              ) :
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
            }
            <div></div>
          </>
        ) : (
          <>
            <div></div>
            {
              requested ? (
                <ModalCameraPermissions 
                  isOpen={true}  
                  onGranted={() => {
                    setGranted(true)
                    callWithVideo(true)()
                  }}
                />
              ) : callStatus === 'reconnecting' ? (
                <VStack className='w-full'>
                  <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
                      className='w-36 self-center'
                    />
                  <Heading className='text-2xl'>S.O.S</Heading>
                  <Spinner size='md' />
                  <Text className="text-center text-blue-600 font-bold">Reconnnexion à l'appel...</Text>
                </VStack>
              ) :
              callStatus === 'ended' ? (
                <VStack className='w-full'>
                  <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
                      className='w-36 self-center'
                    />
                  <Heading className='text-2xl'>S.O.S</Heading>
                  <Text className="text-center text-green-600 font-bold">Appel terminé</Text>
                  <Text className="text-md text-center text-slate-400">Merci de nous avoir contacté !</Text>
                </VStack>
              ) : (
                <>
                <VStack className="w-full">
                  <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu-UQogk1KVet3JOXexIabYbB48MNckILsfw&s"
                    className='w-36 self-center'
                    />
                    <Heading className='text-2xl'>S.O.S</Heading>
                    <Text>Contactez les secours et montrez les faits !</Text>  
                </VStack>
                <VStack className='w-full'>
                    <Button 
                      className='w-full bg-red-500 text-white rounded-lg min-h-[60px]'
                      colorScheme='red'
                      isLoading={!clientID}
                      onClick={() => {
                        if(granted) return callWithVideo(true)()
                        setRequested(true)
                      }}
                    >Contactez un agent</Button>
                    {/* <ActionButton icon={faVideo} onClick={callWithVideo(true)} />
                    <ActionButton icon={faPhone} onClick={callWithVideo(false)} /> */}
                  </VStack>
                </>
              )
            }
          <div></div>
          </>
          )
      }      

        
    </div>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
