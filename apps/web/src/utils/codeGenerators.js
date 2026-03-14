// Code generation utilities for different languages and formats

export const generateCurl = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Replace environment variables in URL
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  // Add query parameters to URL
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(([key, value]) => {
        const paramValue = typeof value === 'object' ? value.value : value
        return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`
      })
      .join('&')
    
    processedUrl += (processedUrl.includes('?') ? '&' : '?') + queryString
  }
  
  let curlCommand = `curl -X ${method.toUpperCase()} "${processedUrl}"`
  
  // Add headers
  const processedHeaders = { ...headers }
  
  // Add auth headers
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    processedHeaders['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    const username = auth.basic.username
    const password = auth.basic.password || ''
    processedHeaders['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`
  }
  
  // Process headers with environment variables
  Object.entries(processedHeaders).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    curlCommand += ` \\\n  -H "${key}: ${processedValue}"`
  })
  
  // Add body
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      curlCommand += ` \\\n  -d '${jsonContent}'`
    } else if (body.type === 'raw' && body.content) {
      curlCommand += ` \\\n  -d '${body.content}'`
    } else if (body.type === 'form-data' && body.data) {
      Object.entries(body.data).forEach(([key, value]) => {
        if (value.enabled !== false) {
          if (value.type === 'file') {
            curlCommand += ` \\\n  -F "${key}=@${value.value}"`
          } else {
            curlCommand += ` \\\n  -F "${key}=${value.value}"`
          }
        }
      })
    }
  }
  
  return curlCommand
}

export const generateJavaScriptFetch = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Process URL with environment variables
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  // Add query parameters
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(([key, value]) => {
        const paramValue = typeof value === 'object' ? value.value : value
        return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`
      })
      .join('&')
    
    processedUrl += (processedUrl.includes('?') ? '&' : '?') + queryString
  }
  
  // Build headers object
  const fetchHeaders = { ...headers }
  
  // Add auth headers
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    fetchHeaders['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    const username = auth.basic.username
    const password = auth.basic.password || ''
    fetchHeaders['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`
  }
  
  // Process headers with environment variables
  const processedHeaders = {}
  Object.entries(fetchHeaders).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    processedHeaders[key] = processedValue
  })
  
  let fetchOptions = {
    method: method.toUpperCase(),
    headers: processedHeaders
  }
  
  // Add body
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      fetchOptions.body = jsonContent
      if (!processedHeaders['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json'
      }
    } else if (body.type === 'raw' && body.content) {
      fetchOptions.body = body.content
    }
  }
  
  const optionsStr = JSON.stringify(fetchOptions, null, 2)
  
  return `fetch("${processedUrl}", ${optionsStr})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`
}

export const generateNodeAxios = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Process URL with environment variables
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  // Build config object
  let config = {
    method: method.toLowerCase(),
    url: processedUrl,
    headers: {}
  }
  
  // Add query parameters
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    config.params = {}
    enabledParams.forEach(([key, value]) => {
      const paramValue = typeof value === 'object' ? value.value : value
      config.params[key] = paramValue
    })
  }
  
  // Process headers
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    config.headers[key] = processedValue
  })
  
  // Add auth
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    config.headers['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    config.auth = {
      username: auth.basic.username,
      password: auth.basic.password || ''
    }
  }
  
  // Add body
  if (body && body.type !== 'none' && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      try {
        config.data = JSON.parse(jsonContent)
      } catch {
        config.data = jsonContent
      }
    } else if (body.type === 'raw' && body.content) {
      config.data = body.content
    }
  }
  
  const configStr = JSON.stringify(config, null, 2)
  
  return `const axios = require('axios');

const config = ${configStr};

axios(config)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`
}

export const generatePythonRequests = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Process URL with environment variables
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  let code = `import requests\n\n`
  
  // URL
  code += `url = "${processedUrl}"\n\n`
  
  // Query parameters
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    code += `params = {\n`
    enabledParams.forEach(([key, value]) => {
      const paramValue = typeof value === 'object' ? value.value : value
      code += `    "${key}": "${paramValue}",\n`
    })
    code += `}\n\n`
  }
  
  // Headers
  const processedHeaders = {}
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    processedHeaders[key] = processedValue
  })
  
  // Add auth headers
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    processedHeaders['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    processedHeaders['Authorization'] = `Basic ${btoa(`${auth.basic.username}:${auth.basic.password || ''}`)}`
  }
  
  if (Object.keys(processedHeaders).length > 0) {
    code += `headers = {\n`
    Object.entries(processedHeaders).forEach(([key, value]) => {
      code += `    "${key}": "${value}",\n`
    })
    code += `}\n\n`
  }
  
  // Body
  let hasBody = false
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      code += `data = '''${jsonContent}'''\n\n`
      hasBody = true
    } else if (body.type === 'raw' && body.content) {
      code += `data = '''${body.content}'''\n\n`
      hasBody = true
    }
  }
  
  // Request call
  code += `response = requests.${method.toLowerCase()}(url`
  
  if (enabledParams.length > 0) {
    code += `, params=params`
  }
  
  if (Object.keys(processedHeaders).length > 0) {
    code += `, headers=headers`
  }
  
  if (hasBody) {
    code += `, data=data`
  }
  
  code += `)\n\n`
  code += `print(response.status_code)\n`
  code += `print(response.json())`
  
  return code
}

export const generatePHP = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Process URL with environment variables
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  // Add query parameters
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(([key, value]) => {
        const paramValue = typeof value === 'object' ? value.value : value
        return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`
      })
      .join('&')
    
    processedUrl += (processedUrl.includes('?') ? '&' : '?') + queryString
  }
  
  let code = `<?php\n\n`
  code += `$curl = curl_init();\n\n`
  
  // Build curl options
  code += `curl_setopt_array($curl, array(\n`
  code += `    CURLOPT_URL => "${processedUrl}",\n`
  code += `    CURLOPT_RETURNTRANSFER => true,\n`
  code += `    CURLOPT_ENCODING => "",\n`
  code += `    CURLOPT_MAXREDIRS => 10,\n`
  code += `    CURLOPT_TIMEOUT => 30,\n`
  code += `    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`
  code += `    CURLOPT_CUSTOMREQUEST => "${method.toUpperCase()}",\n`
  
  // Headers
  const processedHeaders = { ...headers }
  
  // Add auth headers
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    processedHeaders['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    processedHeaders['Authorization'] = `Basic ${btoa(`${auth.basic.username}:${auth.basic.password || ''}`)}`
  }
  
  const headerArray = []
  Object.entries(processedHeaders).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    headerArray.push(`"${key}: ${processedValue}"`)
  })
  
  if (headerArray.length > 0) {
    code += `    CURLOPT_HTTPHEADER => array(\n`
    headerArray.forEach(header => {
      code += `        ${header},\n`
    })
    code += `    ),\n`
  }
  
  // Body
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      code += `    CURLOPT_POSTFIELDS => '${jsonContent}',\n`
    } else if (body.type === 'raw' && body.content) {
      code += `    CURLOPT_POSTFIELDS => '${body.content}',\n`
    }
  }
  
  code += `));\n\n`
  code += `$response = curl_exec($curl);\n`
  code += `$err = curl_error($curl);\n\n`
  code += `curl_close($curl);\n\n`
  code += `if ($err) {\n`
  code += `    echo "cURL Error #:" . $err;\n`
  code += `} else {\n`
  code += `    echo $response;\n`
  code += `}\n`
  code += `?>`
  
  return code
}

export const generateGo = (request, environmentVariables = {}) => {
  const { method, url, headers = {}, params = {}, body, auth } = request
  
  // Process URL with environment variables
  let processedUrl = url
  Object.entries(environmentVariables).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  
  // Add query parameters
  const enabledParams = Object.entries(params).filter(([key, value]) => {
    return typeof value === 'object' ? value.enabled !== false : true
  })
  
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(([key, value]) => {
        const paramValue = typeof value === 'object' ? value.value : value
        return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`
      })
      .join('&')
    
    processedUrl += (processedUrl.includes('?') ? '&' : '?') + queryString
  }
  
  let code = `package main\n\n`
  code += `import (\n`
  code += `    "fmt"\n`
  code += `    "net/http"\n`
  code += `    "io/ioutil"\n`
  
  // Check if we need strings package for body
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    code += `    "strings"\n`
  }
  
  code += `)\n\n`
  code += `func main() {\n\n`
  
  // Body
  let bodyVar = 'nil'
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (body.type === 'json' && body.content) {
      let jsonContent = body.content
      Object.entries(environmentVariables).forEach(([key, value]) => {
        jsonContent = jsonContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      })
      code += `    payload := strings.NewReader(\`${jsonContent}\`)\n\n`
      bodyVar = 'payload'
    } else if (body.type === 'raw' && body.content) {
      code += `    payload := strings.NewReader("${body.content}")\n\n`
      bodyVar = 'payload'
    }
  }
  
  code += `    url := "${processedUrl}"\n`
  code += `    method := "${method.toUpperCase()}"\n\n`
  
  code += `    client := &http.Client{}\n`
  code += `    req, err := http.NewRequest(method, url, ${bodyVar})\n\n`
  code += `    if err != nil {\n`
  code += `        fmt.Println(err)\n`
  code += `        return\n`
  code += `    }\n\n`
  
  // Headers
  const processedHeaders = { ...headers }
  
  // Add auth headers
  if (auth?.type === 'bearer' && auth.bearerToken) {
    let token = auth.bearerToken
    Object.entries(environmentVariables).forEach(([key, value]) => {
      token = token.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    processedHeaders['Authorization'] = `Bearer ${token}`
  } else if (auth?.type === 'basic' && auth.basic?.username) {
    processedHeaders['Authorization'] = `Basic ${btoa(`${auth.basic.username}:${auth.basic.password || ''}`)}`
  }
  
  Object.entries(processedHeaders).forEach(([key, value]) => {
    if (typeof value === 'object' && value.enabled === false) return
    
    const headerValue = typeof value === 'object' ? value.value : value
    let processedValue = headerValue
    Object.entries(environmentVariables).forEach(([envKey, envValue]) => {
      processedValue = processedValue.replace(new RegExp(`{{${envKey}}}`, 'g'), envValue)
    })
    
    code += `    req.Header.Add("${key}", "${processedValue}")\n`
  })
  
  code += `\n    res, err := client.Do(req)\n`
  code += `    if err != nil {\n`
  code += `        fmt.Println(err)\n`
  code += `        return\n`
  code += `    }\n`
  code += `    defer res.Body.Close()\n\n`
  code += `    body, err := ioutil.ReadAll(res.Body)\n`
  code += `    if err != nil {\n`
  code += `        fmt.Println(err)\n`
  code += `        return\n`
  code += `    }\n`
  code += `    fmt.Println(string(body))\n`
  code += `}`
  
  return code
}

export const codeGenerators = {
  curl: generateCurl,
  javascript: generateJavaScriptFetch,
  nodejs: generateNodeAxios,
  python: generatePythonRequests,
  php: generatePHP,
  go: generateGo
}

export const languageOptions = [
  { value: 'curl', label: 'cURL', icon: '⚡' },
  { value: 'javascript', label: 'JavaScript (fetch)', icon: '🟨' },
  { value: 'nodejs', label: 'Node.js (axios)', icon: '🟢' },
  { value: 'python', label: 'Python (requests)', icon: '🐍' },
  { value: 'php', label: 'PHP (cURL)', icon: '🐘' },
  { value: 'go', label: 'Go (http)', icon: '🔵' }
]