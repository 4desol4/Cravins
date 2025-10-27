import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon, 
  EyeIcon, 
  ShareIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { newsAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const NewsDetail = ({ articleId, onBack }) => {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    if (articleId) {
      fetchArticle()
      fetchRelatedArticles()
    }
  }, [articleId])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await newsAPI.getNewsArticle(articleId)
      setArticle(response.data.data)
    } catch (error) {
      toast.error('Failed to load article')
      onBack?.()
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedArticles = async () => {
    try {
      const response = await newsAPI.getNews({ limit: 3 })
      setRelatedArticles(response.data.data.filter(a => a.id !== articleId))
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadingTime = (content) => {
    const wordsPerMinute = 200
    const words = content ? content.trim().split(/\s+/).length : 0
    return Math.ceil(words / wordsPerMinute)
  }

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleExternalLink = () => {
    if (article?.externalUrl) {
      window.open(article.externalUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading article..." />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Article Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={onBack} className="btn btn-primary">
          Back to News
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-outline btn-sm mb-6 flex items-center space-x-2"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to News</span>
      </button>

      {/* Article Header */}
      <div className="card p-8 mb-8">
        {/* Category & Source */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {article.category && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {article.category}
              </span>
            )}
            
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              article.source === 'EXTERNAL' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {article.source === 'EXTERNAL' ? 'External Source' : 'Cravins News'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="btn btn-ghost btn-sm flex items-center space-x-2"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>

            {article.externalUrl && (
              <button
                onClick={handleExternalLink}
                className="btn btn-ghost btn-sm flex items-center space-x-2"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span>View Source</span>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Article Meta */}
        <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300 text-sm mb-6">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <EyeIcon className="w-4 h-4" />
            <span>{(article.views || 0).toLocaleString()} views</span>
          </div>

          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4" />
            <span>{getReadingTime(article.content)} min read</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-6">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{ 
              __html: article.content.replace(/\n/g, '<br>') 
            }}
          />
        </div>

        {/* Article Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Published by Cravins Team
              </span>
            </div>

            <button
              onClick={handleShare}
              className="btn btn-primary btn-sm flex items-center space-x-2"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Articles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle, index) => (
              <motion.div
                key={relatedArticle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => window.location.href = `/news/${relatedArticle.id}`}
              >
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {relatedArticle.image && (
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {relatedArticle.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                      {relatedArticle.excerpt}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarDaysIcon className="w-3 h-3 mr-1" />
                      <span>{formatDate(relatedArticle.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default NewsDetail

