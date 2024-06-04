import { useEffect, useRef, useState } from 'react'

export const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
    const [drawing, setDrawing] = useState(false)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    const startDrawing = () => setDrawing(true)
    const stopDrawing = () => {
        setDrawing(false)
        prevPoint.current = null
    }

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (!drawing) return
            const currentPoint = computePointInCanvas(e)

            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx || !currentPoint) return

            onDraw({ ctx, currentPoint, prevPoint: prevPoint.current })
            prevPoint.current = currentPoint
        }

        const computePointInCanvas = (e: MouseEvent | TouchEvent) => {
            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left
            const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top

            return { x, y }
        }

        // Add event listeners
        canvasRef.current?.addEventListener('mousemove', handler)
        canvasRef.current?.addEventListener('touchmove', handler)
        window.addEventListener('mouseup', stopDrawing)
        window.addEventListener('touchend', stopDrawing)

        // Remove event listeners
        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
            canvasRef.current?.removeEventListener('touchmove', handler)
            window.removeEventListener('mouseup', stopDrawing)
            window.removeEventListener('touchend', stopDrawing)
        }
    }, [onDraw])

    return { canvasRef, startDrawing, stopDrawing }
}