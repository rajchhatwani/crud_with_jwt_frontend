
import { useState } from 'react';
import './ApiResponse.css';

const ApiResponse = ({ response, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatData = (data) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={`api-response ${response.type}`}>
      <div className="response-header">
        <h4>API Response</h4>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="response-message">
        <strong>{response.message}</strong>
      </div>
      
      {response.data && (
        <div className="response-data">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-button"
          >
            {isExpanded ? 'Hide' : 'Show'} Response Data
          </button>
          
          {isExpanded && (
            <pre className="response-content">
              {formatData(response.data)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiResponse;
