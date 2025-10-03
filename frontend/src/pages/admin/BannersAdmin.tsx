import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import { toImageUrl } from '../../utils/image'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function BannersAdmin() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetch = () => {
    setLoading(true)
    api
      .get(endpoints.admin.banners)
      .then((r) => setBanners((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
  }, [])

  const upload = async () => {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      await api.post(endpoints.admin.banners, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      alert('Banner uploaded successfully!')
      fetch()
    } catch (e: any) {
      console.error('Failed to upload banner:', e)
      alert(e.response?.data?.message || 'Failed to upload banner')
    } finally {
      setUploading(false)
    }
  }

  const startEdit = (banner: any) => {
    setEditingBanner(banner)
    setEditFile(null)
  }

  const update = async () => {
    if (!editFile || !editingBanner) return
    setUpdating(true)
    const fd = new FormData()
    fd.append('image', editFile)
    try {
      await api.put(endpoints.admin.banner(editingBanner.id), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Banner updated successfully!')
      setEditingBanner(null)
      setEditFile(null)
      fetch()
    } catch (e: any) {
      console.error('Failed to update banner:', e)
      alert(e.response?.data?.message || 'Failed to update banner')
    } finally {
      setUpdating(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await api.delete(endpoints.admin.banner(id))
      alert('Banner deleted successfully!')
      fetch()
    } catch (e: any) {
      console.error('Failed to delete banner:', e)
      alert(e.response?.data?.message || 'Failed to delete banner')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
          <p className="text-gray-600">{banners.length} total banners</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-0 p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload New Banner</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button 
            onClick={upload} 
            disabled={uploading || !file}
            className="shadow-md"
            size="lg"
          >
            {uploading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Banner
              </>
            )}
          </Button>
        </div>
        {file && (
          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </Card>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card className="border-0 p-16 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No banners yet</h3>
          <p className="text-gray-500">Upload banners to display on the home page</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b, idx) => (
            <Card 
              key={b.id} 
              className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={toImageUrl(b.image)}
                  alt={`Banner ${b.id}`}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x300?text=Banner'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                
                {/* Banner ID Badge */}
                <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  #{b.id}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate font-mono">{b.image}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(b)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-600 hover:text-white hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Banner #{editingBanner.id}</h3>
              <button
                onClick={() => {
                  setEditingBanner(null)
                  setEditFile(null)
                }}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                disabled={updating}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Current Banner Preview */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Current Banner</label>
              <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-md">
                <img
                  src={toImageUrl(editingBanner.image)}
                  alt="Current banner"
                  className="h-56 w-full object-cover"
                />
              </div>
            </div>

            {/* New File Upload */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Upload New Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-2 text-xs text-gray-500">
                Select a new image to replace the current banner
              </p>
            </div>

            {/* Preview New Image */}
            {editFile && (
              <div className="mb-6 animate-fade-in">
                <label className="mb-2 block text-sm font-semibold text-gray-700">New Banner Preview</label>
                <div className="overflow-hidden rounded-xl border-2 border-blue-300 shadow-lg">
                  <img
                    src={URL.createObjectURL(editFile)}
                    alt="New banner preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
                <div className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <strong>Ready to update:</strong> {editFile.name} ({(editFile.size / 1024).toFixed(2)} KB)
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 border-t pt-6">
              <button
                onClick={() => {
                  setEditingBanner(null)
                  setEditFile(null)
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={update}
                disabled={updating || !editFile}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Banner
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
