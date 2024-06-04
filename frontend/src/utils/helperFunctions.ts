export const drawLine = ({ prevPoint, currentPoint, ctx, color }: DrawLineProps) => {
    const { x: currX, y: currY } = currentPoint
    const lineColor = color
    const lineWidth = 5

    let startPoint = prevPoint ?? currentPoint
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(currX, currY)
    ctx.stroke()

    ctx.fillStyle = lineColor
    ctx.beginPath()
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
    ctx.fill()
}

export const generateBackendUrl = (path?: string) => {
    const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL
    if (!backendUrl) throw new Error('REACT_APP_BACKEND_URL is not defined')
    return `${backendUrl}${path ?? ''}`
}