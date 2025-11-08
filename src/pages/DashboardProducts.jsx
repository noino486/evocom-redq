import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'

const DashboardProducts = () => {
  const { profile, hasProductAccess } = useAuth()

  const products = useMemo(() => [
    {
      id: 'STFOUR',
      name: 'Pack Global Sourcing',
      description: 'Fichiers et ressources pour trouver des fournisseurs',
      accessLevel: 1,
      downloadUrl: 'https://packs.evoecom.com/stfour'
    },
    {
      id: 'GLBNS',
      name: 'Pack Global Business',
      description: 'Ressources complètes pour développer votre business',
      accessLevel: 2,
      downloadUrl: 'https://packs.evoecom.com/glbns'
    }
  ], [])

  const accessibleProducts = useMemo(() => 
    products.filter(product => hasProductAccess(product.id)),
    [products, hasProductAccess]
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mes Produits
          </h1>
          <p className="text-gray-600">
            Accédez à vos produits et ressources
          </p>
        </div>

        {accessibleProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600">
              Vous n'avez actuellement accès à aucun produit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                <a
                  href={product.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                  <FaDownload />
                  Accéder au produit
                  <FaExternalLinkAlt className="text-sm" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardProducts)

