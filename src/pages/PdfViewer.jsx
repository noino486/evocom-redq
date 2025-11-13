import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa'

function useQueryParams() {
  const { search } = useLocation()

  return useMemo(() => {
    const params = new URLSearchParams(search)
    const entries = {}

    for (const [key, value] of params.entries()) {
      entries[key] = value
    }

    return entries
  }, [search])
}

const PdfViewer = () => {
  const navigate = useNavigate()
  const params = useQueryParams()

  const pdfUrl = params.url ? decodeURIComponent(params.url) : null
  const title = params.title ? decodeURIComponent(params.title) : 'Document'
  const from = params.from ? decodeURIComponent(params.from) : null

  const isEmbeddable = pdfUrl ? !pdfUrl.includes('gamma.app') : false
  const handleBack = () => {
    if (from && from.startsWith('/')) {
      navigate(from, { replace: true })
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            <FaArrowLeft />
            Retour
          </button>

          {pdfUrl && (
            <button
              onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <FaExternalLinkAlt />
              Ouvrir dans un nouvel onglet
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaFilePdf className="text-primary" />
              {title}
            </h1>
          </div>

          <div className="h-[85vh] bg-gray-50">
            {!pdfUrl ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-gray-600 px-8">
                <p className="text-lg font-medium">Aucun PDF sélectionné</p>
                <p className="text-sm">Veuillez revenir au dashboard et sélectionner un document.</p>
              </div>
            ) : isEmbeddable ? (
              <iframe
                src={pdfUrl}
                title={title}
                className="w-full h-full border-0"
                allow="fullscreen"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-600 px-8">
                <p className="text-lg font-medium">
                  Ce document ne peut pas être intégré pour des raisons de sécurité.
                </p>
                <p className="text-sm">
                  Vous pouvez l&apos;ouvrir dans un nouvel onglet via le bouton ci-dessus.
                </p>
                <button
                  onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <FaExternalLinkAlt />
                  Ouvrir dans un nouvel onglet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PdfViewer


