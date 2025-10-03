import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetch = () => {
    setLoading(true)
    api
      .get(endpoints.admin.categories)
      .then((r) => setCategories((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
  }, [])

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await api.post(endpoints.admin.categories, { name })
      setName('')
      fetch()
    } catch (e) {
      alert('Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (category: any) => {
    setEditingCategory(category)
    setEditName(category.name)
  }

  const update = async () => {
    if (!editName.trim() || !editingCategory) return
    setUpdating(true)
    try {
      await api.put(endpoints.admin.category(editingCategory.id), { name: editName })
      setEditingCategory(null)
      setEditName('')
      fetch()
    } catch (e) {
      alert('Failed to update category')
    } finally {
      setUpdating(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this category?')) return
    await api.delete(endpoints.admin.category(id))
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
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <p className="text-gray-600">{categories.length} total categories</p>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Category</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={create} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="mb-3 text-center text-3xl">📂</div>
            <h3 className="mb-3 text-center font-semibold text-gray-900">{c.name}</h3>
            <div className="flex gap-2">
              <Button 
                onClick={() => startEdit(c)} 
                variant="outline" 
                size="sm" 
                className="flex-1"
              >
                Edit
              </Button>
              <Button onClick={() => remove(c.id)} variant="danger" size="sm" className="flex-1">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Edit Category</h3>
            <Input
              label="Category Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter category name"
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setEditName('')
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
                disabled={updating || !editName.trim()}
              >
                {updating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
