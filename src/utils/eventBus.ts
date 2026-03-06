import type { PreviewImageEvent } from '@/views/backend/documentProcessing/pdfProcessing/type'
import mitt from 'mitt'

export interface EventMap {
  [key: string]: unknown
  [key: symbol]: unknown
  'update-conversation-history': void
  'preview-image': PreviewImageEvent
  'zoom-in': void
  'zoom-out': void
  rotate: void
  'select-remake': void
}

const emitter = mitt<EventMap>()

export default emitter
