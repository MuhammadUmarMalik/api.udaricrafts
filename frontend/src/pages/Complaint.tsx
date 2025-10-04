import { useState } from 'react'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Complaint() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!form.description.trim()) {
      newErrors.description = 'Please describe your complaint'
    } else if (form.description.trim().length < 20) {
      newErrors.description = 'Please provide at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setSubmitting(true)
    setErrors({})

    try {
      await api.post(endpoints.complaints, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        // Status is automatically set to 'pending' by the backend
      })

      setSuccess(true)
      setForm({ name: '', email: '', phone: '', description: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Failed to submit complaint:', error)
      setErrors({
        submit: error.response?.data?.message || 'Failed to submit complaint. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-orange-100 to-red-100 p-4">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Submit a Complaint</h1>
        <p className="text-gray-600">
          We value your feedback and take all complaints seriously. Please provide details below.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="animate-fade-in rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Complaint Submitted Successfully!</h3>
              <p className="mt-1 text-sm text-green-700">
                Thank you for your feedback. We'll review your complaint and respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Form */}
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            label="Your Name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            required
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+92 300 1234567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
            required
          />

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Complaint Details <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Please describe your complaint in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              className={`w-full rounded-lg border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Minimum 20 characters. Current: {form.description.length}
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Complaint'
            )}
          </Button>
        </form>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Response Time</h3>
              <p className="mt-1 text-sm text-gray-600">
                We aim to respond within 24-48 hours
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Confidential</h3>
              <p className="mt-1 text-sm text-gray-600">
                Your information is kept private and secure
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="border-2 border-blue-100 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <svg className="h-6 w-6 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900">Need Immediate Help?</h3>
            <p className="mt-1 text-sm text-blue-800">
              For urgent matters, please contact us directly at{' '}
              <a href="tel:+923001234567" className="font-semibold underline">
                +92 300 1234567
              </a>{' '}
              or email{' '}
              <a href="mailto:info@udaricrafts.com" className="font-semibold underline">
                info@udaricrafts.com
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

