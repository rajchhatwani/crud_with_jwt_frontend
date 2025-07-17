import { useState, useEffect } from 'react';
import ApiResponse from './ApiResponse';
import './ServiceManager.css';

const ServiceManager = ({ category, onBack }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Normal',
    priceOptions: [{ duration: '', price: '', type: 'Hourly' }]
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/category/${category.id}/services`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      // Transform the API response to match our component expectations
      const transformedServices = data.map(service => ({
        ...service,
        priceOptions: service.ServicePriceOptions || []
      }));
      
      setServices(transformedServices);
      setApiResponse({ type: 'success', data: transformedServices, message: 'Services loaded successfully' });
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Failed to fetch services' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceOptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, i) => 
        i === index ? { ...option, [field]: field === 'price' ? Number(value) : value } : option
      )
    }));
  };

  const addPriceOption = () => {
    setFormData(prev => ({
      ...prev,
      priceOptions: [...prev.priceOptions, { duration: '', price: '', type: 'Hourly' }]
    }));
  };

  const removePriceOption = (index) => {
    setFormData(prev => ({
      ...prev,
      priceOptions: prev.priceOptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingService 
        ? `http://localhost:5000/api/category/${category.id}/service/${editingService.id}`
        : `http://localhost:5000/api/category/${category.id}/service`;
      
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse({ 
          type: 'success', 
          data, 
          message: editingService ? 'Service updated successfully' : 'Service created successfully'
        });
        resetForm();
        fetchServices();
      } else {
        setApiResponse({ type: 'error', data, message: data.error || 'Operation failed' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      type: service.type,
      priceOptions: (service.priceOptions || []).map(option => ({
        duration: option.duration,
        price: option.price,
        type: option.type
      }))
    });
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/category/${category.id}/service/${serviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        setApiResponse({ type: 'success', data, message: 'Service deleted successfully' });
        fetchServices();
      } else {
        setApiResponse({ type: 'error', data, message: data.error || 'Delete failed' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Normal',
      priceOptions: [{ duration: '', price: '', type: 'Hourly' }]
    });
    setEditingService(null);
  };

  return (
    <div className="service-manager">
      <div className="service-header">
        <button onClick={onBack} className="back-button">← Back to Categories</button>
        <h2>Services for {category.name}</h2>
      </div>
      
      <div className="service-form-section">
        <h3>{editingService ? 'Edit Service' : 'Create New Service'}</h3>
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Service name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Service Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="Normal">Normal</option>
              <option value="VIP">VIP</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div className="price-options-section">
            <h4>Price Options</h4>
            {formData.priceOptions.map((option, index) => (
              <div key={index} className="price-option">
                <input
                  type="text"
                  placeholder="Duration (e.g., 30 min)"
                  value={option.duration}
                  onChange={(e) => handlePriceOptionChange(index, 'duration', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={option.price}
                  onChange={(e) => handlePriceOptionChange(index, 'price', e.target.value)}
                  required
                />
                <select
                  value={option.type}
                  onChange={(e) => handlePriceOptionChange(index, 'type', e.target.value)}
                  required
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                {formData.priceOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePriceOption(index)}
                    className="remove-price-option"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPriceOption} className="add-price-option">
              Add Price Option
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
            {editingService && (
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="services-list">
        <h3>Services</h3>
        {services.length === 0 ? (
          <p>No services found</p>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h4>{service.name}</h4>
                <p className="service-type">Type: {service.type}</p>
                <div className="price-options">
                  <h5>Price Options:</h5>
                  {(service.priceOptions || []).map((option, index) => (
                    <div key={index} className="price-option-display">
                      <span>{option.duration} - ${option.price} ({option.type})</span>
                    </div>
                  ))}
                </div>
                <div className="service-actions">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {apiResponse && (
        <ApiResponse 
          response={apiResponse} 
          onClose={() => setApiResponse(null)} 
        />
      )}
    </div>
  );
};

export default ServiceManager;
