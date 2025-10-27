import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CloudArrowUpIcon, 
  XMarkIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline'
import { materialAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const MaterialUpload = ({ onMaterialUploaded, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'General'
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const categories = [
    'General',
    'Mathematics',
    'Science',
    'English',
    'Past Questions',
    'Study Guides',
    'Textbooks',
    'Workbooks'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, Word, Excel, and PowerPoint files are allowed')
        return
      }

      setSelectedFile(file)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return false
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required')
      return false
    }

    if (!selectedFile) {
      toast.error('Please select a file')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await materialAPI.uploadMaterial(formDataToSend)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      toast.success('Material uploaded successfully!')
      onMaterialUploaded?.(response.data.data)
      onClose?.()
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊'
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📋'
    return '📄'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload Study Material
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="label">Study Material File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-4xl">{getFileIcon(selectedFile.type)}</div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select study material
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mb-4">
                      PDF, Word, Excel, PowerPoint up to 50MB
                    </div>
                  </>
                )}
                
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="material-upload"
                />
                <label
                  htmlFor="material-upload"
                  className="btn btn-outline cursor-pointer"
                >
                  {selectedFile ? 'Change File' : 'Choose File'}
                </label>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Enter material title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="input w-full"
              placeholder="Enter material description"
            />
          </div>

          {/* Price */}
          <div>
            <label className="label">Price (NGN)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="input w-full"
              placeholder="Enter price in Naira"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input w-full"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={uploading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <span>Upload Material</span>
                  <CloudArrowUpIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default MaterialUpload