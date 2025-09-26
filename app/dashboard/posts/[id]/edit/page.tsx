'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Image, Tag, Loader, Trash2 } from 'lucide-react';
import { getPostById, updatePost, deletePost } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  image?: string;
  author: {
    id: string;
    username: string;
  };
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getPostById(id);
      setPost(data.post);
      
      setFormData({
        title: data.post.title || '',
        content: data.post.content || '',
        tags: data.post.tags?.join(', ') || '',
        image: data.post.image || '',
      });
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to load post' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !post) return;

    try {
      setIsSaving(true);
      setErrors({});

      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
        ...(formData.image && { image: formData.image.trim() }),
      };

      await updatePost(post.id, postData);
      
      // Redirect to the updated post
      router.push(`/blogs/${post.id}`);
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Failed to update post. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    const confirmMessage = 'Are you sure you want to delete this post? This action cannot be undone.';
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsDeleting(true);
      await deletePost(post.id);
      router.push('/dashboard/posts');
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Failed to delete post. Please try again.' 
      });
      setIsDeleting(false);
    }
  };

  const getPreviewContent = () => {
    return formData.content.replace(/\n/g, '<br>');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">
              The post you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Link
              href="/dashboard/posts"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/posts"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Posts</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-gray-600 mt-1">Make changes to your published story</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        {!showPreview ? (
          // Edit Mode
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your post title..."
              />
              <div className="flex justify-between mt-1">
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.title.length}/200 characters
                </p>
              </div>
            </div>

            {/* Image URL Field */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4" />
                  <span>Featured Image URL (Optional)</span>
                </div>
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.image ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
              {formData.image && !errors.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="max-w-xs h-32 object-cover rounded border"
                    onError={() => setErrors(prev => ({ ...prev, image: 'Invalid image URL' }))}
                  />
                </div>
              )}
            </div>

            {/* Tags Field */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags (Optional)</span>
                </div>
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="technology, web development, react, javascript"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate tags with commas. Tags help readers discover your content.
              </p>
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={20}
                value={formData.content}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Start writing your story..."
              />
              <div className="flex justify-between mt-1">
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.content.length} characters
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="prose prose-lg max-w-none">
              {/* Preview Header */}
              <div className="not-prose mb-8">
                <div className="text-sm text-gray-500 mb-4">Preview</div>
                
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Featured"
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Preview Content */}
              <h1>{formData.title || 'Untitled Post'}</h1>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: getPreviewContent() || '<p class="text-gray-500">Start writing to see preview...</p>' 
                }} 
              />
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-between">
          <Link
            href={`/blogs/${post.id}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Post
          </Link>
          
          <div className="flex space-x-4">
            <Link
              href="/dashboard/posts"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}