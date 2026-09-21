import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as listingService from '../services/listingService';
import * as uploadService from '../services/uploadService';
import './CreateListing.css';

const LISTING_TYPES = ['Entire Unit', 'Room', 'Whole Villa'];

const LOCATION_COUNTRY = {
  'New York': 'USA',
  'Cape Town': 'South Africa',
  Mexico: 'Mexico',
  'Los Angeles': 'USA',
  Chicago: 'USA',
  Houston: 'USA',
  Paris: 'France',
  Phoenix: 'USA',
  Philadelphia: 'USA',
  'San Antonio': 'USA',
  'San Diego': 'USA',
  Tokyo: 'Japan',
  Thailand: 'Thailand',
  Dallas: 'USA',
  'San Jose': 'USA',
};
const LOCATIONS = Object.keys(LOCATION_COUNTRY);

const emptyForm = {
  title: '',
  location: '',
  description: '',
  enhancedCleaning: false,
  selfCheckIn: false,
  amenities: [],
  images: [],
  pricePerNight: '',
  type: '',
  guests: '',
  bedrooms: '',
  baths: '',
};

export default function CreateListing() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [amenityDraft, setAmenityDraft] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    listingService
      .getListingById(id)
      .then((listing) =>
        setForm({
          title: listing.title || '',
          location: listing.city || '',
          description: listing.description || '',
          enhancedCleaning: Boolean(listing.enhancedCleaning),
          selfCheckIn: Boolean(listing.selfCheckIn),
          amenities: listing.amenities || [],
          images: listing.images || [],
          pricePerNight: listing.pricePerNight ?? '',
          type: listing.type || '',
          guests: listing.guests ?? '',
          bedrooms: listing.bedrooms ?? '',
          baths: listing.baths ?? '',
        })
      )
      .catch((err) => setError(err.response?.data?.message || 'Could not load this listing.'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  function addAmenity() {
    const value = amenityDraft.trim();
    if (!value) return;
    setForm((f) => ({ ...f, amenities: [...f.amenities, value] }));
    setAmenityDraft('');
  }

  function removeAmenity(value) {
    setForm((f) => ({ ...f, amenities: f.amenities.filter((a) => a !== value) }));
  }

  async function handleFileChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await uploadService.uploadImages(files);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload those images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(src) {
    setForm((f) => ({ ...f, images: f.images.filter((img) => img !== src) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      title: form.title,
      city: form.location,
      country: LOCATION_COUNTRY[form.location] || 'Unknown',
      description: form.description,
      enhancedCleaning: form.enhancedCleaning,
      selfCheckIn: form.selfCheckIn,
      amenities: form.amenities,
      images: form.images,
      image: form.images[0],
      pricePerNight: Number(form.pricePerNight) || 0,
      type: form.type,
      guests: Number(form.guests) || 1,
      bedrooms: Number(form.bedrooms) || 1,
      baths: Number(form.baths) || 1,
    };
    try {
      if (isEditing) {
        await listingService.updateListing(id, payload);
      } else {
        await listingService.createListing(payload);
      }
      navigate('/host');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this listing.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="container">Loading listing…</p>;

  return (
    <div className="container create-listing">
      <h1>{isEditing ? 'Update Listing' : 'Create Listing'}</h1>
      <form className="create-listing__form" onSubmit={handleSubmit}>
        <div className="create-listing__grid">
          <div className="create-listing__col">
            <label>
              <span>Listing Title</span>
              <input type="text" value={form.title} onChange={update('title')} required />
            </label>

            <label>
              <span>Location</span>
              <select value={form.location} onChange={update('location')} required>
                <option value="">Select a location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Description</span>
              <textarea rows={8} value={form.description} onChange={update('description')} required />
            </label>

            <div className="create-listing__checkboxes">
              <label className="create-listing__checkbox">
                <input type="checkbox" checked={form.enhancedCleaning} onChange={update('enhancedCleaning')} />
                Enhanced Cleaning
              </label>
              <label className="create-listing__checkbox">
                <input type="checkbox" checked={form.selfCheckIn} onChange={update('selfCheckIn')} />
                Self Check-In
              </label>
            </div>

            <div>
              <span className="create-listing__label">Amenities</span>
              <div className="create-listing__inline">
                <input
                  type="text"
                  value={amenityDraft}
                  onChange={(e) => setAmenityDraft(e.target.value)}
                  placeholder="e.g. Wifi"
                />
                <button type="button" className="btn btn-indigo" onClick={addAmenity}>Add</button>
              </div>
              <ul className="create-listing__chips">
                {form.amenities.map((a) => (
                  <li key={a}>
                    {a}
                    <button type="button" onClick={() => removeAmenity(a)} aria-label={`Remove ${a}`}>×</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="create-listing__col">
            <div className="create-listing__triplet">
              <label>
                <span>Price</span>
                <input type="number" min="0" value={form.pricePerNight} onChange={update('pricePerNight')} required />
              </label>
              <label>
                <span>Type</span>
                <select value={form.type} onChange={update('type')} required>
                  <option value="">Select an option</option>
                  {LISTING_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="create-listing__triplet">
              <label>
                <span>Guests</span>
                <input type="number" min="1" value={form.guests} onChange={update('guests')} required />
              </label>
              <label>
                <span>Bedrooms</span>
                <input type="number" min="1" value={form.bedrooms} onChange={update('bedrooms')} required />
              </label>
              <label>
                <span>Bathrooms</span>
                <input type="number" min="1" value={form.baths} onChange={update('baths')} required />
              </label>
            </div>

            <div>
              <span className="create-listing__label">Images</span>
              <div className="create-listing__inline">
                <label className="btn btn-indigo create-listing__upload-btn">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                {uploading && <span className="create-listing__uploading">Uploading…</span>}
              </div>
              {form.images.length === 0 && <p className="create-listing__empty-images">No images uploaded</p>}
              {form.images.length > 0 && (
                <div className="create-listing__previews">
                  {form.images.map((src) => (
                    <div key={src} className="create-listing__preview">
                      <img src={src} alt="Listing preview" />
                      <button type="button" onClick={() => removeImage(src)} aria-label="Remove image">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="create-listing__error">{error}</p>}

        <div className="create-listing__actions">
          <button type="submit" className="btn btn-indigo" disabled={submitting || uploading}>
            {submitting ? 'Saving…' : isEditing ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-danger" onClick={() => navigate('/host')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
