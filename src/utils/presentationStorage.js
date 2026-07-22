const DATABASE_NAME = 'relatorio-premium-db'
const DATABASE_VERSION = 1
const STORE_NAME = 'presentations'
const CURRENT_PRESENTATION_KEY = 'current-weekly-report'

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não está disponível neste navegador.'))
      return
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runTransaction(mode, operation) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = operation(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
  }))
}

export function loadPresentation() {
  return runTransaction('readonly', (store) => store.get(CURRENT_PRESENTATION_KEY))
}

export function savePresentation(presentation) {
  return runTransaction('readwrite', (store) => store.put(presentation, CURRENT_PRESENTATION_KEY))
}
