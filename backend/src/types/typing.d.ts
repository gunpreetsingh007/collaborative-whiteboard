declare module 'http' {
    interface IncomingMessage {
        cookies: { [key: string]: string };
    }
}

type Point = { x: number; y: number }

type DrawLine = {
  prevPoint: Point | null
  currentPoint: Point
  color: string,
  roomToken: string
}

type JwtDecodedPayload = {
  roomId: string
}

type SaveDiagramPayload = {
  diagramBase64URL: string
  roomToken: string
}