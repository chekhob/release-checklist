const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getProjects() {
  return request('/projects')
}

export async function getProject(id) {
  return request(`/projects/${id}`)
}

export async function createProject(data) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: 'DELETE',
  })
}

export async function toggleStep(projectId, stepId) {
  return request(`/projects/${projectId}/steps/${stepId}`, {
    method: 'PATCH',
  })
}
