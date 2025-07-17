import { useState, useEffect } from 'react';
import ApiResponse from './ApiResponse';
import './CategoryManager.css';

const CategoryManager = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Try the singular form first since other endpoints use singular
      let response = await fetch('http://localhost:5000/api/category', {
        headers: getAuthHeaders()
      });
      
      // If singular fails, try plural as fallback
      if (!response.ok && response.status === 404) {
        response = await fetch('http://localhost:5000/api/categories', {
          headers: getAuthHeaders()
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        // Handle both array response and object with categories array
        const categoriesArray = Array.isArray(data) ? data : (data.categories || []);
        setCategories(categoriesArray);
        setApiResponse({ type: 'success', data: categoriesArray, message: 'Categories loaded successfully' });
      } else {
        setApiResponse({ type: 'error', message: `Failed to fetch categories: ${response.status}` });
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      setApiResponse({ type: 'error', message: 'Failed to fetch categories - network error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory 
        ? `http://localhost:5000/api/category/${editingCategory.id}`
        : 'http://localhost:5000/api/category';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse({ 
          type: 'success', 
          data, 
          message: editingCategory ? 'Category updated successfully' : 'Category created successfully'
        });
        setFormData({ name: '' });
        setEditingCategory(null);
        fetchCategories();
      } else {
        setApiResponse({ type: 'error', data, message: data.error || 'Operation failed' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/category/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        setApiResponse({ type: 'success', data, message: 'Category deleted successfully' });
        fetchCategories();
      } else {
        setApiResponse({ type: 'error', data, message: data.error || 'Delete failed' });
      }
    } catch (error) {
      setApiResponse({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
  };

  return (
    <div className="category-manager">
      <h2>Category Management</h2>
      
      <div className="category-form-section">
        <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Category name"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : editingCategory ? 'Update' : 'Create'}
            </button>
            {editingCategory && (
              <button type="button" onClick={cancelEdit} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="categories-list">
        <h3>Categories</h3>
        {categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <h4>{category.name}</h4>
                <div className="category-actions">
                  <button 
                    onClick={() => onCategorySelect(category)}
                    className="view-services-button"
                  >
                    View Services
                  </button>
                  <button 
                    onClick={() => handleEdit(category)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
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

export default CategoryManager;
