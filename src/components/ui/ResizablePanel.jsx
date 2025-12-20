import React, { useState, useRef, useEffect } from 'react'
import { GripVertical } from 'lucide-react'

export default function ResizablePanel({ 
  children, 
  defaultWidth = 320, 
  minWidth = 200, 
  maxWidth = 600,
  className = '',
  resizerClassName = ''
}) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = (e) => {
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div className="flex h-full">
      <div 
        ref={panelRef}
        className={`flex-shrink-0 ${className}`}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
      
      {/* Resizer */}
      <div 
        className={`group relative flex items-center justify-center w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors duration-200 ${resizerClassName}`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Active resize indicator */}
        {isResizing && (
          <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 dark:bg-blue-400" />
        )}
      </div>
    </div>
  )
}