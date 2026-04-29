import { useState, useRef } from 'react'
import TopBar from '../components/TopBar'
import { uploadFile } from '../api'

export default function AddData() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef()

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

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Add Data Overview" />

      <div className="flex-1 overflow-y-auto p-gutter bg-surface">
        <div className="max-w-[1000px] mx-auto">

          <div className="mb-8">
            <h1 className="text-[30px] font-bold text-on-surface mb-2">Import Data</h1>
            <p className="text-[16px] text-on-surface-variant">Securely bring your sales and customer data into Retail Insights.</p>
          </div>

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

        </div>
      </div>
    </div>
  )
}
