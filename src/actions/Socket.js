import {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {BASEURL} from './_apiUrls';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Disconnect the old socket connection, if it exists
    if (socket) {
      socket?.disconnect();
    }

    // Create a new socket connection
    const newSocket = io(BASEURL.slice(0, -1));

    // Set the new socket connection
    setSocket(newSocket);

    // Event listener for 'connect' event
    const handleConnect = () => {
      
    };

    // Add event listener for 'connect' event
    newSocket?.on('connect', handleConnect);

    // Cleanup function
    return () => {
      // Disconnect the socket connection
      newSocket?.disconnect();
    };
  }, []);

  // Return the socket instance
  return socket;
};
