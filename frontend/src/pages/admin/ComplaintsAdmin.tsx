import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

type Complaint = {
  id: number
  name: string
  email: string
  phone?: string
  description: string
  status: string
  createdAt: string
}

export default function ComplaintsAdmin() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [emailResponse, setEmailResponse] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await api.get(endpoints.admin.complaints)
      // Backend returns paginated data: { data: { data: [...], meta: {...} } }
      const paginatedData = (response.data as any).data
      setComplaints(paginatedData?.data || [])
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdatingStatus(true)
      await api.put(endpoints.admin.complaint(id), { status })
      
      // Update local state immediately for better UX
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status })
      }
      
      // Update the complaints list
      setComplaints(complaints.map(c => 
        c.id === id ? { ...c, status } : c
      ))
      
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
      // Refresh to get correct state
      fetchComplaints()
    } finally {
      setUpdatingStatus(false)
    }
  }

  const sendEmail = async () => {
    if (!selectedComplaint || !emailResponse.trim()) return

    setSendingEmail(true)
    try {
      // Backend expects: to, from, subject, text
      await api.post(endpoints.admin.complaintSendMail, {
        to: selectedComplaint.email,
        from: 'admin@udaricrafts.com', // Replace with your actual email
        subject: `Re: Your Complaint - ${selectedComplaint.name}`,
        text: emailResponse,
      })
      alert('Email sent successfully!')
      setSelectedComplaint(null)
      setEmailResponse('')
      // Optionally update the complaint status to 'resolved' after sending email
      await updateStatus(selectedComplaint.id, 'resolved')
      fetchComplaints()
    } catch (error: any) {
      console.error('Failed to send email:', error)
      alert(error.response?.data?.message || 'Failed to send email. Please check your email configuration.')
    } finally {
      setSendingEmail(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      resolved: 'success' as const,
      rejected: 'danger' as const,
    }
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>
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
          <h2 className="text-3xl font-bold text-gray-900">Complaints Management</h2>
          <p className="mt-1 text-sm text-gray-500">{complaints.length} total complaints</p>
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No complaints</h3>
          <p className="text-gray-500">No customer complaints have been submitted yet</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{complaint.name}</h3>
                      <p className="text-sm text-gray-500">{complaint.email}</p>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">{complaint.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(complaint.createdAt)}</span>
                    <span className="text-blue-600 group-hover:underline">View Details →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Complaint Details & Actions */}
          <div className="sticky top-6 h-fit">
            {selectedComplaint ? (
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.name}</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.email}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-500">Complaint Description</p>
                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-900">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedComplaint.createdAt)}</p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-900">Update Status</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(selectedComplaint.id, 'pending')}
                        disabled={updatingStatus}
                        className={`
                          flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                          ${selectedComplaint.status === 'pending'
                            ? 'bg-yellow-500 text-white shadow-md ring-2 ring-yellow-500 ring-offset-2 hover:bg-yellow-600'
                            : 'border-2 border-yellow-300 bg-yellow-50 text-yellow-700 hover:border-yellow-400 hover:bg-yellow-100'
                          }
                        `}
                      >
                        {updatingStatus && selectedComplaint.status !== 'pending' ? (
                          <Spinner size="sm" className="mx-auto" />
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            {selectedComplaint.status === 'pending' && '✓'} Pending
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => updateStatus(selectedComplaint.id, 'resolved')}
                        disabled={updatingStatus}
                        className={`
                          flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                          ${selectedComplaint.status === 'resolved'
                            ? 'bg-green-600 text-white shadow-md ring-2 ring-green-500 ring-offset-2 hover:bg-green-700'
                            : 'border-2 border-green-300 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100'
                          }
                        `}
                      >
                        {updatingStatus && selectedComplaint.status !== 'resolved' ? (
                          <Spinner size="sm" className="mx-auto" />
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            {selectedComplaint.status === 'resolved' && '✓'} Resolved
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => updateStatus(selectedComplaint.id, 'rejected')}
                        disabled={updatingStatus}
                        className={`
                          flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                          ${selectedComplaint.status === 'rejected'
                            ? 'bg-red-600 text-white shadow-md ring-2 ring-red-500 ring-offset-2 hover:bg-red-700'
                            : 'border-2 border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100'
                          }
                        `}
                      >
                        {updatingStatus && selectedComplaint.status !== 'rejected' ? (
                          <Spinner size="sm" className="mx-auto" />
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            {selectedComplaint.status === 'rejected' && '✓'} Rejected
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Email Response */}
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-900">Send Email Response</p>
                    <textarea
                      value={emailResponse}
                      onChange={(e) => setEmailResponse(e.target.value)}
                      placeholder="Write your response to the customer..."
                      rows={5}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={sendEmail}
                      className="mt-3 w-full"
                      disabled={!emailResponse.trim() || sendingEmail}
                    >
                      {sendingEmail ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Select a complaint to view details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

