import { useState, useRef, useEffect, useCallback } from 'react'
import { Globe, X } from 'lucide-react'
import { useEnvironmentStore } from '../../stores/environmentStore'

/**
 * URL input with inline variable highlighting (Postman-style).
 * Uses a layered approach: a transparent <input> on top of a <div>
 * that renders highlighted tokens underneath.
 */
export default function VariableHighlightInput({
  value,
  onChange,
  placeholder,
  className = ''
}) {
  const { currentEnvironment } = useEnvironmentStore()
  const [showPopover, setShowPopover] = useState(false)
  const [scrollLeft, setScrollLeft] = useState(0)
  const inputRef = useRef(null)
  const mirrorRef = useRef(null)
  const popoverRef = useRef(null)

  // Sync horizontal scroll between input and mirror div
  const handleScroll = useCallback(() => {
    if (inputRef.current) {
      setScrollLeft(inputRef.current.scrollLeft)
    }
  }, [])

  useEffect(() => {
    const input = inputRef.current
    if (input) {
      input.addEventListener('scroll', handleScroll)
      return () => input.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPopover])

  // Parse the URL into segments: plain text and {{variable}} tokens
  const parseSegments = (text) => {
    if (!text) return []
    const regex = /(\{\{[^}]*\}\})/g
    const parts = text.split(regex)
    return parts.map((part) => {
      const isVar = /^\{\{[^}]*\}\}$/.test(part)
      if (!isVar) return { type: 'text', value: part }
      const varName = part.slice(2, -2).trim()
      const resolved = currentEnvironment?.variables?.[varName]
      const found = varName !== '' && currentEnvironment?.variables && varName in currentEnvironment.variables
      return { type: 'var', value: part, varName, found, resolved }
    })
  }

  const segments = parseSegments(value || '')
  const hasVariables = segments.some(s => s.type === 'var')
  const hasMissingVars = segments.some(s => s.type === 'var' && !s.found)

  // Build variable info list for popover
  const variableInfo = segments
    .filter(s => s.type === 'var')
    .reduce((acc, s) => {
      if (!acc.find(v => v.name === s.varName)) {
        acc.push({ name: s.varName, value: s.resolved, found: s.found })
      }
      return acc
    }, [])

  // Strip flex-1 from className — wrapper handles it
  const inputClass = className.replace(/\bflex-1\b/g, '').trim()

  return (
    <div className="relative flex-1 min-w-0">
      {/* Mirror layer — renders highlighted tokens, sits behind the input */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none overflow-hidden rounded-lg ${inputClass}`}
        style={{ zIndex: 0 }}
      >
        <div
          ref={mirrorRef}
          className="flex items-center h-full whitespace-pre text-transparent select-none"
          style={{
            transform: `translateX(-${scrollLeft}px)`,
            paddingLeft: '1rem',   // matches px-4
            paddingRight: hasVariables ? '2.5rem' : '1rem',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            letterSpacing: 'inherit',
          }}
        >
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return (
                <span key={i} className="text-transparent">
                  {seg.value}
                </span>
              )
            }
            // Variable token highlight
            return (
              <span
                key={i}
                className={`rounded px-0.5 ${
                  seg.found
                    ? 'bg-orange-200 dark:bg-orange-800/60 text-transparent'
                    : 'bg-red-200 dark:bg-red-800/60 text-transparent'
                }`}
              >
                {seg.value}
              </span>
            )
          })}
        </div>
      </div>

      {/* Actual input — transparent background so mirror shows through */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className={`relative w-full bg-transparent ${inputClass} ${hasVariables ? 'pr-10' : ''}`}
        style={{ zIndex: 1, caretColor: 'auto' }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Globe icon — opens variable popover */}
      {hasVariables && (
        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors z-10 ${
            hasMissingVars
              ? 'text-orange-500 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20'
              : 'text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
          }`}
          title={hasMissingVars ? 'Some variables are missing' : 'View variables'}
        >
          <Globe className="h-4 w-4" />
        </button>
      )}

      {/* Variable Popover */}
      {showPopover && variableInfo.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Variables in {currentEnvironment?.name || 'Environment'}
              </span>
            </div>
            <button
              onClick={() => setShowPopover(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {variableInfo.map((varInfo, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    varInfo.found
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <code className={`text-xs font-semibold ${
                          varInfo.found
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-orange-700 dark:text-orange-400'
                        }`}>
                          {`{{${varInfo.name}}}`}
                        </code>
                        <span className={`text-xs ${
                          varInfo.found ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'
                        }`}>
                          {varInfo.found ? '✓' : '⚠'}
                        </span>
                      </div>
                      {varInfo.found ? (
                        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-gray-900/50 px-2 py-1 rounded">
                          {varInfo.value}
                        </div>
                      ) : (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          Not defined in current environment
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {variableInfo.filter(v => v.found).length} of {variableInfo.length} variables resolved
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
