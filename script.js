const NIFI_API_URL = 'http://localhost:8080/nifi-api';

/**
 * Trigger a NiFi processor to run once.
 * @param {string} processorId - The UUID of the processor to run.
 */
async function triggerFlow(processorId) {
  try {
    const response = await fetch(`${NIFI_API_URL}/processors/${processorId}/run-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        revision: { version: 0 },
        state: 'RUN_ONCE'
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NiFi response ${response.status}: ${text}`);
    }

    alert('Flux déclenché avec succès');
  } catch (error) {
    console.error('Erreur lors du déclenchement du flux:', error);
    alert(`Erreur: ${error.message}`);
  }
}
// Expose the function globally so it can be used by inline HTML handlers
window.triggerFlow = triggerFlow;
