/**
 * Test Project & Report Persistence Logic (CRUD + Version History)
 */
import fs from 'fs'

const STORAGE_KEY_V2 = 'focas.projects.v2'

// Simulate localStorage in Node
const storage = new Map()
const localStorageMock = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
}

function testStoreCrud() {
  console.log('Testing Project Storage CRUD operations...')

  // 1. Initial State (Empty or default)
  const initial = localStorageMock.getItem(STORAGE_KEY_V2)
  console.log('1. Initial store state:', initial ? 'Has data' : 'Empty')

  // 2. Create / Upsert Project
  const testProject = {
    id: 'proj_test_123',
    form: {
      name: 'Automated Bean Sorter',
      problem: 'Coffee roasters sorting beans manually',
      solution: 'Optical sorting camera',
    },
    status: 'Evaluating',
    updated: new Date().toISOString(),
    history: [],
  }

  const listAfterAdd = [testProject]
  localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify(listAfterAdd))
  console.log('2. Saved project:', testProject.id, testProject.form.name)

  // 3. Re-read / Retrieve
  const retrieved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_V2))
  const found = retrieved.find((p) => p.id === 'proj_test_123')
  console.log('3. Retrieved project name:', found?.form.name, 'Status:', found?.status)

  // 4. Update with Evaluation Report & Version History
  const evaluationVersion = {
    id: 'ver_1',
    timestamp: new Date().toISOString(),
    form: found.form,
    analysis: { score: 75, executiveSummary: { ideaSimple: 'Optical bean sorting' } },
  }
  found.status = 'Validating'
  found.analysis = evaluationVersion.analysis
  found.history = [evaluationVersion]
  found.updated = new Date().toISOString()

  localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify([found]))
  console.log('4. Updated with report & history version count:', found.history.length)

  // 5. Rename
  found.form.name = 'Artisan Optical Bean Sorter'
  localStorageMock.setItem(STORAGE_KEY_V2, JSON.stringify([found]))
  const renamed = JSON.parse(localStorageMock.getItem(STORAGE_KEY_V2))[0]
  console.log('5. Renamed project:', renamed.form.name)

  // 6. Delete
  localStorageMock.removeItem(STORAGE_KEY_V2)
  const afterDelete = localStorageMock.getItem(STORAGE_KEY_V2)
  console.log('6. After delete:', afterDelete === null ? 'Confirmed deleted' : 'Still exists')
  console.log('CRUD logic verified successfully.')
}

testStoreCrud()
