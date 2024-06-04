import { useCallback, useEffect, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { ChromePicker } from 'react-color'
import { io } from 'socket.io-client'
import { drawLine, generateBackendUrl } from '../utils/helperFunctions'
import Loader from '../components/loader'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard';
const socket = io(import.meta.env.VITE_APP_BACKEND_SOCKET_URL, { path: '/socket' })

type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const WhiteBoard = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [roomId] = useState(params.roomId as string)
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown } = useDraw(createLine)
  const [isPending, setIsPending] = useState(true)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDiagramSaving, setIsDiagramSaving] = useState(false)

  const fetchRoom = useCallback(async () => {
    const response = await fetch(generateBackendUrl(`/api/join-room/${roomId}`), {
      method: 'GET'
    })
    const data = await response.json()
    if (!data.roomId) {
      toast.error('Room not found')
      navigate('/')
      return
    }
    localStorage.setItem('roomToken', data.token)
    socket.emit('join-room', { roomToken: data.token })
    setIsPending(false)
    if (data.diagramBase64URL) {
      const image = new Image()
      image.src = data.diagramBase64URL
      image.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return
        // Get the aspect ratio of the image
        const aspectRatio = image.width / image.height

        // Calculate the new dimensions of the image
        let newWidth = canvas.width
        let newHeight = newWidth / aspectRatio

        // If the new height is larger than the canvas, adjust the dimensions
        if (newHeight > canvas.height) {
          newHeight = canvas.height
          newWidth = newHeight * aspectRatio
        }

        // Calculate the starting x and y coordinates to center the image
        const startX = (canvas.width - newWidth) / 2
        const startY = (canvas.height - newHeight) / 2

        // Draw the image on the canvas
        ctx.drawImage(image, startX, startY, newWidth, newHeight)
      }
    }

  }, [navigate, roomId, canvasRef])

  const saveDiagram = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const diagramBase64URL = canvas.toDataURL()
    setIsDiagramSaving(true)
    const response = await fetch(generateBackendUrl('/api/save-diagram'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('roomToken')}`
      },
      body: JSON.stringify({ diagramBase64URL })
    })
    const data = await response.json()
    setIsDiagramSaving(false)
    if (data.error) {
      toast.error(data.error)
    }
    else {
      toast.success(data.message)
    }
  }, [canvasRef])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  useEffect(() => {

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    return () => {
      socket.off('draw-line')
    }
  }, [canvasRef])

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color, roomToken: localStorage.getItem('roomToken') })
    drawLine({ prevPoint, currentPoint, ctx, color })
  }

  return (
    <div>
      {isPending ? (
        <Loader /> // Show the Loader component while isPending is true
      ) : (
        <>
          <div className='toolbar absolute top-8 left-[10%] flex justify-center w-4/5'>
            <div className='flex flex-col md:flex-row justify-between w-full rounded-md shadow-lg bg-white p-2'>
              <div className='flex ml-5 flex-row'>
                <input
                  type='text'
                  value={roomId}
                  disabled
                  className='p-2 rounded-md border border-black mr-3 bg-white'
                />
                <CopyToClipboard text={roomId}>
                  <button
                    type='button'
                    className='rounded-md text-sm font-medium bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 mr-2'>
                    Copy Room ID
                  </button>
                </CopyToClipboard>
              </div>
              <div className='flex mr-5 pt-3 md:pt-0 justify-center ml-6'>
                <button onClick={() => setShowColorPicker(!showColorPicker)} className='rounded-md text-sm font-medium bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 mr-2'>{showColorPicker ? "Close ColorPicker" : "Open ColorPicker"}</button>
                <button onClick={saveDiagram} className='rounded-md text-sm font-medium bg-green-500 py-2 px-4 text-white hover:bg-green-600'><span className={isDiagramSaving ? 'fas fa-spinner fa-pulse' : ''}>{!isDiagramSaving ? "Save Diagram" : ""}</span></button>
              </div>
            </div>
          </div>
          <div className={showColorPicker ? 'absolute right-32 top-40 md:right-60 md:top-24' : 'hidden'}>
            <div className='relative flex flex-col'>
              <ChromePicker className='mt-4 left-4' color={color} onChange={(e) => setColor(e.hex)} />
            </div>
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </>
      )}
    </div>
  )

}

export default WhiteBoard