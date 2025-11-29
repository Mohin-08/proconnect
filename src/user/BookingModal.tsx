import { useState } from 'react'
import { supabase } from '../supabaseClient'

type BookingModalProps = {
  serviceId: number
  serviceName: string
  professionalId: string
  professionalName: string
  hourlyRate: number
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({
  serviceId,
  serviceName,
  professionalId,
  professionalName,
  hourlyRate,
  onClose,
  onSuccess
}: BookingModalProps) {
  const [scheduledDate, setScheduledDate] = useState('')
  const [hours, setHours] = useState(1)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const totalAmount = hourlyRate * hours

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please log in to book a service')
        return
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          client_id: session.user.id,
          professional_id: professionalId,
          service_id: serviceId,
          title: serviceName,
          description: description || `Booking for ${serviceName}`,
          scheduled_at: scheduledDate,
          budget: totalAmount,
          status: 'pending',
          payment_status: 'unpaid'
        })

      if (error) {
        console.error('Booking error:', error)
        alert(error.message)
        return
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error:', err)
      alert('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
          Book Service
        </h2>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>{serviceName}</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>with {professionalName}</div>
          <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: '700', color: '#1abc9c' }}>
            ${hourlyRate}/hour
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Number of Hours *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Project Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you need help with..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>

          <div
            style={{
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Rate per hour:</span>
              <span style={{ fontWeight: '600' }}>${hourlyRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Hours:</span>
              <span style={{ fontWeight: '600' }}>{hours}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #d1fae5'
              }}
            >
              <span style={{ fontWeight: '700' }}>Total Budget:</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#1abc9c' }}>
                ${totalAmount}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="add-btn"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
