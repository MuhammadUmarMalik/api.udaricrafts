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
                <Button onClick={() => remove(b.id)} variant="danger" size="sm" className="w-full">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
