
import { useState, useEffect } from 'react';
import CategoryManager from './CategoryManager';
import ServiceManager from './ServiceManager';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const storedAdminData = localStorage.getItem('admin_data');
    if (storedAdminData && storedAdminData !== 'undefined' && storedAdminData !== 'null') {
      try {
        setAdminData(JSON.parse(storedAdminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('admin_data'); // Clean up invalid data
      }
    }
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            {adminData && (
              <span className="admin-info">Welcome, {adminData.email}</span>
            )}
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('categories');
            setSelectedCategory(null);
          }}
        >
          Categories
        </button>
        {selectedCategory && (
          <button
            className={`nav-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services - {selectedCategory.name}
          </button>
        )}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'categories' && (
          <CategoryManager onCategorySelect={(category) => {
            setSelectedCategory(category);
            setActiveTab('services');
          }} />
        )}
        {activeTab === 'services' && selectedCategory && (
          <ServiceManager 
            category={selectedCategory}
            onBack={() => setActiveTab('categories')}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
