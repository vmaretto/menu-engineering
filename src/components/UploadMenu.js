import { useState } from 'react';

export default function UploadMenu({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return setStatus('Seleziona un CSV');
    setStatus('Caricamento…');
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      setStatus(json.message || 'Fatto');
      if (res.ok && onUploaded) onUploaded();
    } catch (err) {
      setStatus('Errore: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded shadow">
      <input
        type="file"
        accept=".csv"
        onChange={e => setFile(e.target.files[0])}
        className="mr-2"
      />
      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
        Carica CSV
      </button>
      <span className="ml-3 text-sm">{status}</span>
    </form>
  );
}
