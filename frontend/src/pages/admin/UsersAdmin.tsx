import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    api
      .get(endpoints.admin.usersExcludeCurrent)
      .then((r) => setUsers((r.data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch()
  }, [])

  const remove = async (id: number) => {
    if (!confirm('Delete this user?')) return
    await api.delete(endpoints.admin.user(id))
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
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-gray-600">{users.length} total users</p>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-3 text-5xl">👥</div>
          <h3 className="text-lg font-semibold text-gray-900">No users yet</h3>
          <p className="text-gray-500">Registered users will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <Card key={u.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                    {u.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{u.name}</h3>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    {u.role && (
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {u.role}
                      </span>
                    )}
                  </div>
                </div>
                <Button onClick={() => remove(u.id)} variant="danger" size="sm">
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
