import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { generateBackendUrl } from '../utils/helperFunctions';

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isPendingForJoinRoomBtn, setIsPendingForJoinRoomBtn] = useState(false);
  const [isPendingForCreateRoomBtn, setIsPendingForCreateRoomBtn] = useState(false);
  const joinRoom = useCallback(async () => {
    if (roomId) {
      setIsPendingForJoinRoomBtn(true);
      const response = await fetch(generateBackendUrl(`/api/check-room/${roomId}`));
      const data = await response.json();
      if (!data.roomId) {
        toast.error('Room not found');
        return;
      }
      navigate(`/whiteboard/${roomId}`);
    } else {
      toast.error('Please enter a room ID');
    }
  }, [roomId, navigate]);

  const createRoom = useCallback(async () => {
    setIsPendingForCreateRoomBtn(true);
    const response = await fetch(generateBackendUrl('/api/create-room'), {
      method: 'POST',
    });
    const data = await response.json();
    navigate(`/whiteboard/${data.roomId}`);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Welcome to the Collaborative Whiteboard</h1>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 text-left"
              htmlFor="room-id"
            >
              Enter room ID
            </label>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-10 border px-3 py-2 text-sm mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="room-id"
              placeholder="Enter room ID"
            />
          </div>
          <button onClick={joinRoom} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-full bg-blue-500 py-2 px-4 text-white hover:bg-blue-600">
            <span className={isPendingForJoinRoomBtn ? "fas fa-spinner fa-pulse" : "uppercase"}>{!isPendingForJoinRoomBtn ? 'Join Room' : ''}</span>
          </button>
          <p className='text-center'>OR</p>
          <button onClick={createRoom} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-full bg-green-500 py-2 px-4 text-white hover:bg-green-600">
            <span className={isPendingForCreateRoomBtn ? "fas fa-spinner fa-pulse" : "uppercase"}>{!isPendingForCreateRoomBtn ? 'Create Room' : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;