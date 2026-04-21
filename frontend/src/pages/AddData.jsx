import { useState, useRef } from 'react'
import TopBar from '../components/TopBar'
import { uploadFile, addTransaction } from '../api'

export default function AddData() {
  const [tab, setTab] = useState('upload')

  // Upload state
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef()

  // Manual entry state
  const [form, setForm] = useState({
    customer_id: '', invoice_no: '', invoice_date: '',
    stock_code: '', description: '', quantity: '', unit_price: '', country: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState(null)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleConfirmUpload() {
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    setUploadError(null)
    try {
      const result = await uploadFile(file)
      setUploadResult(result)
      setFile(null)
    } catch (err) {
      setUploadError(String(err))
    } finally {
      setUploading(false)
    }
  }

  function handleFormChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmitTransaction(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg(null)
    try {
      await addTransaction({
        customer_id:  parseInt(form.customer_id),
        invoice_no:   form.invoice_no,
        invoice_date: form.invoice_date,
        stock_code:   form.stock_code,
        description:  form.description,
        quantity:     parseInt(form.quantity),
        unit_price:   parseFloat(form.unit_price),
        country:      form.country,
      })
      setSubmitMsg('Transaction added successfully.')
      setForm({ customer_id: '', invoice_no: '', invoice_date: '', stock_code: '', description: '', quantity: '', unit_price: '', country: '' })
    } catch {
      setSubmitMsg('Something went wrong. Check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-surface-container border-2 border-transparent rounded-lg p-3 text-[16px] text-on-surface focus:bg-surface-container-lowest focus:border-primary focus:outline-none transition-colors'

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Add Data Overview" />

      <div className="flex-1 overflow-y-auto p-gutter bg-surface">
        <div className="max-w-[1000px] mx-auto">

          <div className="mb-8">
            <h1 className="text-[30px] font-bold text-on-surface mb-2">Import Data</h1>
            <p className="text-[16px] text-on-surface-variant">Securely bring your sales and customer data into Retail Insights.</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-8 gap-8">
            {['upload', 'manual'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 border-b-2 text-[14px] font-semibold tracking-wide transition-colors ${
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
                }`}
              >
                {t === 'upload' ? 'Upload File' : 'Manual Entry'}
              </button>
            ))}
          </div>

          {/* Upload Tab */}
          {tab === 'upload' && (
            <div className="space-y-gutter">
              {/* Step 1: File drop */}
              <section className="bg-surface-container-lowest rounded-xl p-gutter shadow-level-1 border border-transparent hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-[14px] font-semibold text-on-surface">1</div>
                  <h2 className="text-[20px] font-semibold text-on-surface">Select Data Source</h2>
                </div>

                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer text-center transition-colors ${
                    dragging ? 'border-primary bg-surface-container' : 'border-outline-variant bg-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-primary-fixed/50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined icon-filled text-4xl text-primary">cloud_upload</span>
                  </div>
                  <h3 className="text-[20px] font-semibold text-on-surface mb-2">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </h3>
                  <p className="text-[16px] text-on-surface-variant mb-6 max-w-md">
                    CSV, XLS, or XLSX · max 50MB · first row must be column headers
                  </p>
                  <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline rounded-lg text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors shadow-sm">
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={e => setFile(e.target.files[0])}
                  />
                </div>
              </section>

              {/* Step 2: Column mapping note + confirm */}
              {file && (
                <section className="bg-surface-container-lowest rounded-xl p-gutter shadow-level-1 border border-transparent">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[14px] font-semibold">2</div>
                    <div>
                      <h2 className="text-[20px] font-semibold text-on-surface">Confirm Upload</h2>
                      <p className="text-[12px] text-on-surface-variant mt-1">
                        File must contain: CustomerID, InvoiceNo, InvoiceDate, StockCode, Description, Quantity, UnitPrice
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-container px-4 py-3 rounded-lg flex items-center gap-2 mb-6 w-fit">
                    <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                    <span className="text-[14px] text-on-surface">{file.name}</span>
                    <button onClick={() => setFile(null)} className="ml-2 text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  {uploadError && (
                    <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 mb-4 text-[14px]">
                      {uploadError}
                    </div>
                  )}

                  {uploadResult && (
                    <div className="bg-green-50 text-green-800 rounded-lg px-4 py-3 mb-4 text-[14px]">
                      Successfully inserted {uploadResult.inserted.toLocaleString()} rows.
                    </div>
                  )}

                  <div className="flex justify-end gap-4 border-t border-outline-variant pt-6">
                    <button
                      onClick={() => setFile(null)}
                      className="px-6 py-2.5 border border-primary text-primary rounded-lg text-[14px] font-semibold hover:bg-surface transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      disabled={uploading}
                      className="px-8 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      {uploading ? 'Uploading…' : 'Confirm Upload'}
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Manual Entry Tab */}
          {tab === 'manual' && (
            <section className="bg-surface-container-lowest rounded-xl p-gutter shadow-level-1">
              <h2 className="text-[20px] font-semibold text-on-surface mb-6">Enter Single Record</h2>
              <form className="space-y-6 max-w-2xl" onSubmit={handleSubmitTransaction}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Customer ID</label>
                    <input name="customer_id" value={form.customer_id} onChange={handleFormChange} className={inputCls} placeholder="e.g. 12345" type="number" required />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Invoice No.</label>
                    <input name="invoice_no" value={form.invoice_no} onChange={handleFormChange} className={inputCls} placeholder="e.g. INV-001" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Stock Code</label>
                    <input name="stock_code" value={form.stock_code} onChange={handleFormChange} className={inputCls} placeholder="e.g. 84406B" required />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Description</label>
                    <input name="description" value={form.description} onChange={handleFormChange} className={inputCls} placeholder="e.g. White Hanging Heart" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Quantity</label>
                    <input name="quantity" value={form.quantity} onChange={handleFormChange} className={inputCls} placeholder="0" type="number" min="1" required />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-on-surface-variant">$</span>
                      <input name="unit_price" value={form.unit_price} onChange={handleFormChange} className={`${inputCls} pl-7`} placeholder="0.00" type="number" step="0.01" min="0.01" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Transaction Date</label>
                    <input name="invoice_date" value={form.invoice_date} onChange={handleFormChange} className={inputCls} type="date" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold tracking-wide text-on-surface mb-2">Country (optional)</label>
                  <input name="country" value={form.country} onChange={handleFormChange} className={inputCls} placeholder="e.g. United Kingdom" />
                </div>

                {submitMsg && (
                  <div className={`rounded-lg px-4 py-3 text-[14px] ${submitMsg.includes('success') ? 'bg-green-50 text-green-800' : 'bg-error-container text-on-error-container'}`}>
                    {submitMsg}
                  </div>
                )}

                <div className="pt-6 border-t border-outline-variant flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : 'Submit Record'}
                  </button>
                </div>
              </form>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
