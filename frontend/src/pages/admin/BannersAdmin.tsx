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
      fetch()
    } catch (e) {
      alert('Failed to upload banner')
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
      setEditingBanner(null)
      setEditFile(null)
      fetch()
    } catch (e) {
      alert('Failed to update banner')
    } finally {
      setUpdating(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this banner?')) return
    await api.delete(endpoints.admin.banner(id))
    fetch()
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Banners</h2>
        <p className="text-gray-600">{banners.length} total banners</p>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload New Banner</h3>
        <div className="flex gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
          />
          <Button onClick={upload} disabled={uploading || !file}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Card>

      {banners.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-3 text-5xl">🖼️</div>
          <h3 className="text-lg font-semibold text-gray-900">No banners yet</h3>
          <p className="text-gray-500">Upload banners to display on the home page</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <img
                src={toImageUrl(b.image)}
                alt="banner"
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <p className="mb-3 truncate text-sm text-gray-600">{b.image}</p>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(b)} variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button onClick={() => remove(b.id)} variant="danger" size="sm" className="flex-1">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Edit Banner</h3>
            
            {/* Current Banner Preview */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Current Banner</p>
              <img
                src={toImageUrl(editingBanner.image)}
                alt="Current banner"
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>

            {/* New File Upload */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Upload New Image</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>

            {/* Preview New Image */}
            {editFile && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">New Banner Preview</p>
                <img
                  src={URL.createObjectURL(editFile)}
                  alt="New banner preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setEditingBanner(null)
                  setEditFile(null)
                }}
                variant="outline"
                className="flex-1"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={update}
                className="flex-1"
                disabled={updating || !editFile}
              >
                {updating ? 'Updating...' : 'Update Banner'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
