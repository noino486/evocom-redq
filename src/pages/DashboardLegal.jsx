import React from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import LegalEditor from '../components/LegalEditor'

const DashboardLegal = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mentions légales
          </h1>
          <p className="text-gray-600">
            Modifiez et mettez à jour les mentions légales affichées publiquement sur le site.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
        >
          <LegalEditor />
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default React.memo(DashboardLegal)


