import React from 'react'
import { FaWifi, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { useNetworkStatus } from '../utils/networkUtils'

const NetworkStatus = ({ className = '' }) => {
  const { isOnline, isConnecting } = useNetworkStatus()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnecting ? (
        <div className="flex items-center gap-1 text-blue-600">
          <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Test connexion...</span>
        </div>
      ) : isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <FaCheckCircle className="text-sm" />
          <span className="text-sm">En ligne</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <FaExclamationTriangle className="text-sm" />
          <span className="text-sm">Hors ligne</span>
        </div>
      )}
    </div>
  )
}

export default NetworkStatus
