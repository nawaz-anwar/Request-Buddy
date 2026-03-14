import React, { useState } from 'react';
import { Send, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import axios from 'axios';

export default function RequestPanel({ request }) {
  const { updateTab, addToHistory } = useApp();
  const [activeSection, setActiveSection] = useState('params');
  const [loading, setLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);

  const handleInputChange = (field, value) => {
    updateTab(request.id, { [field]: value });
  };

  const handleHeaderChange = (index, field, value) => {
    const headers = { ...request.headers };
    const headerKeys = Object.keys(headers);
    const key = headerKeys[index];
    
    if (field === 'key') {
      if (key !== value) {
        delete headers[key];
        headers[value] = headers[key] || '';
      }
    } else {
      headers[key] = value;
    }
    
    handleInputChange('headers', headers);
  };

  const addHeader = () => {
    const headers = { ...request.headers, '': '' };
    handleInputChange('headers', headers);
  };

  const removeHeader = (key) => {
    const headers = { ...request.headers };
    delete headers[key];
    handleInputChange('headers', headers);
  };

  const handleParamChange = (index, field, value) => {
    const params = { ...request.params };
    const paramKeys = Object.keys(params);
    const key = paramKeys[index];
    
    if (field === 'key') {
      if (key !== value) {
        delete params[key];
        params[value] = params[key] || '';
      }
    } else {
      params[key] = value;
    }
    
    handleInputChange('params', params);
  };

  const addParam = () => {
    const params = { ...request.params, '': '' };
    handleInputChange('params', params);
  };

  const removeParam = (key) => {
    const params = { ...request.params };
    delete params[key];
    handleInputChange('params', params);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    
    try {
      const config = {
        method: request.method.toLowerCase(),
        url: request.url,
        headers: request.headers || {},
        params: request.params || {},
        timeout: 30000
      };

      // Add auth
      if (request.auth?.type === 'bearer' && request.auth.token) {
        config.headers.Authorization = `Bearer ${request.auth.token}`;
      } else if (request.auth?.type === 'basic' && request.auth.username) {
        const credentials = btoa(`${request.auth.username}:${request.auth.password || ''}`);
        config.headers.Authorization = `Basic ${credentials}`;
      }

      // Add body for non-GET requests
      if (request.method !== 'GET' && request.body?.type !== 'none') {
        if (request.body.type === 'json') {
          config.headers['Content-Type'] = 'application/json';
          config.data = request.body.content;
        } else if (request.body.type === 'form') {
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          config.data = request.body.content;
        } else if (request.body.type === 'raw') {
          config.data = request.body.content;
        }
      }

      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - startTime,
        size: JSON.stringify(response.data).length
      };

      // Add to history
      addToHistory(request, responseData);

      // Update tab with response
      updateTab(request.id, { response: responseData });

    } catch (error) {
      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        data: error.response?.data || { error: error.message },
        time: 0,
        size: 0
      };

      updateTab(request.id, { response: errorResponse });
    } finally {
      setLoading(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return (
    <div className="h-full flex flex-col">
      {/* Request Line */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <select
            value={request.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Enter request URL"
            value={request.url || ''}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          
          <button
            onClick={handleSendRequest}
            disabled={loading || !request.url}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['params', 'headers', 'body', 'auth'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeSection === section
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'params' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Query Parameters</h3>
              <button
                onClick={addParam}
                className="flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
            
            {Object.entries(request.params || {}).map(([key, value], index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={() => removeParam(key)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {Object.keys(request.params || {}).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No parameters added yet</p>
            )}
          </div>
        )}

        {activeSection === 'headers' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Headers</h3>
              <button
                onClick={addHeader}
                className="flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
            
            {Object.entries(request.headers || {}).map(([key, value], index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Header"
                  value={key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={() => removeHeader(key)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {Object.keys(request.headers || {}).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No headers added yet</p>
            )}
          </div>
        )}

        {activeSection === 'body' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Request Body</h3>
              <select
                value={request.body?.type || 'none'}
                onChange={(e) => handleInputChange('body', { ...request.body, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="none">None</option>
                <option value="json">JSON</option>
                <option value="form">Form Data</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            
            {request.body?.type !== 'none' && (
              <textarea
                placeholder={`Enter ${request.body?.type} data...`}
                value={request.body?.content || ''}
                onChange={(e) => handleInputChange('body', { ...request.body, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              />
            )}
          </div>
        )}

        {activeSection === 'auth' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Authorization</h3>
              <select
                value={request.auth?.type || 'none'}
                onChange={(e) => handleInputChange('auth', { ...request.auth, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            
            {request.auth?.type === 'bearer' && (
              <input
                type="text"
                placeholder="Token"
                value={request.auth?.token || ''}
                onChange={(e) => handleInputChange('auth', { ...request.auth, token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            
            {request.auth?.type === 'basic' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={request.auth?.username || ''}
                  onChange={(e) => handleInputChange('auth', { ...request.auth, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="relative">
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={request.auth?.password || ''}
                    onChange={(e) => handleInputChange('auth', { ...request.auth, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showAuthPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}